const express = require("express");
const auth = require("../middlewares/auth");
const allowRoles = require("../middlewares/role");

const Test = require("../models/Test");
const Question = require("../models/question");
const TestAttempt = require("../models/TestAttempt");

const router = express.Router();

/**
 * GET /student/tests
 * Get available tests
 */
router.get("/tests", auth, allowRoles("student"), async (req, res) => {
  try {
    const { testType, category, subject, difficulty } = req.query;
    
    // Build filter object based on provided query parameters
    const filter = {};
    if (testType) filter.testType = testType;
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;

    const tests = await Test.find(filter).select(
      "title subject category duration totalMarks testType difficulty",
    );

    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

/**
 * POST /student/tests/:testId/start
 * Start a test
 */
router.post(
  "/tests/:testId/start",
  auth,
  allowRoles("student"),
  async (req, res) => {
    try {
      // 🔒 Prevent multiple active attempts
      const existingAttempt = await TestAttempt.findOne({
        user: req.user._id,
        test: req.params.testId,
        status: "started",
      });

      if (existingAttempt) {
        return res.status(400).json({
          error: "You already have an active attempt for this test",
        });
      }

      const test = await Test.findById(req.params.testId).populate({
        path: "questions",
        select: "questionText options marks negativeMarks",
      });

      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      // ✅ correct creation
      const attempt = await TestAttempt.create({
        user: req.user._id,
        test: test._id,
      });

      res.status(200).json({
        attemptId: attempt._id,
        test,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to start test", err: err.message });
    }
  },
);

/**
 * GET /student/attempts
 * Fetch all attempts for the current user
 */
router.get(
  "/attempts",
  auth,
  allowRoles("student"),
  async (req, res) => {
    try {
      const attempts = await TestAttempt.find({ user: req.user._id })
        .populate("test", "title subject totalMarks duration")
        .sort({ updatedAt: -1 });

      res.status(200).json(attempts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch attempts" });
    }
  }
);

/**
 * GET /student/attempts/:attemptId
 * Fetch an active attempt and its questions
 */
router.get(
  "/attempts/:attemptId",
  auth,
  allowRoles("student"),
  async (req, res) => {
    try {
      const attempt = await TestAttempt.findOne({
        _id: req.params.attemptId,
        user: req.user._id,
      }).populate({
        path: "test",
        populate: {
          path: "questions",
          select: "questionText options marks negativeMarks difficulty",
        },
      });

      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }

      if (attempt.status !== "started") {
        return res.status(400).json({ error: "This attempt is no longer active." });
      }

      res.status(200).json(attempt);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch attempt details" });
    }
  }
);

// POST /student/tests/:attemptId/submit
// Submit test and calculate score

router.post(
  "/tests/:attemptId/submit",
  auth,
  allowRoles("student"),
  async (req, res) => {
    try {
      const { answers } = req.body;
      // answers = [{ question: ObjectId, selectedOption: "A" }]

      const attempt = await TestAttempt.findOne({
        _id: req.params.attemptId,
        user: req.user._id,
      }).populate("test", "duration");

      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }

      if (attempt.status === "submitted") {
        return res.status(400).json({ error: "Test already submitted" });
      }

      // ⏱ Timer validation AFTER attempt check
      const expiry =
        new Date(attempt.startTime).getTime() +
        attempt.test.duration * 60 * 1000;

      if (Date.now() > expiry) {
        attempt.status = "expired";
        attempt.endTime = new Date();
        await attempt.save();

        return res.status(400).json({
          error: "Time expired. Attempt closed.",
        });
      }

      let score = 0;

      // 1️⃣ Collect all question IDs
      const questionIds = answers.map((a) => a.question);

      // 2️⃣ Fetch all questions in ONE DB call
      const questions = await Question.find({
        _id: { $in: questionIds },
      }).select("+correctOption marks negativeMarks");

      // 3️⃣ Create quick lookup map
      const questionMap = {};
      questions.forEach((q) => {
        questionMap[q._id.toString()] = q;
      });

      // 4️⃣ Calculate score without extra DB calls
      for (let ans of answers) {
        const question = questionMap[ans.question];

        if (!question) continue;

        if (question.correctOption === ans.selectedOption) {
          score += question.marks;
        } else {
          score -= question.negativeMarks;
        }
      }

      attempt.answers = answers;
      attempt.score = score;
      attempt.status = "submitted";

      await attempt.save();

      res.status(200).json({
        message: "Test submitted successfully",
        score,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to submit test" });
    }
  },
);

// GET /student/results/:attemptId
// View test result

router.get(
  "/results/:attemptId",
  auth,
  allowRoles("student"),
  async (req, res) => {
    try {
      const attempt = await TestAttempt.findOne({
        _id: req.params.attemptId,
        user: req.user._id,
      })
      .populate("test", "title subject duration")
      .populate({
        path: "answers.question",
        select: "questionText options correctOption marks negativeMarks explanation"
      });

      if (!attempt) {
        return res.status(404).json({ error: "Result not found" });
      }

      if (attempt.status !== "submitted") {
        return res.status(403).json({ error: "You cannot view results before submitting the test." });
      }

      res.status(200).json(attempt);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch result" });
    }
  },
);

// GET /student/search
// Global search across tests
router.get("/search", auth, allowRoles("student"), async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ tests: [] });

    const searchRegex = new RegExp(q, "i");

    const tests = await Test.find({
      $or: [
        { title: searchRegex },
        { subject: searchRegex },
        { category: searchRegex }
      ]
    }).select("title subject category duration testType").limit(10);

    // If there were other searchable models (like Flashcards or Resources), you could query them here and return them in the same payload.
    res.status(200).json({ tests });
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// POST /student/exams
// Update target exams
router.post("/exams", auth, allowRoles("student"), async (req, res) => {
  try {
    const { exams } = req.body;
    
    // Quick validation
    if (!Array.isArray(exams) || exams.length > 3) {
      return res.status(400).json({ error: "You can only track up to 3 exams." });
    }

    // Usually User is imported at top, but to avoid circular or missing dependencies if not imported:
    const User = require("../models/User");
    const user = await User.findById(req.user._id);
    
    user.targetExams = exams.map(e => ({
      name: e.name,
      date: new Date(e.date)
    }));
    
    await user.save();
    
    res.status(200).json({ message: "Exams updated successfully", targetExams: user.targetExams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update exams" });
  }
});

module.exports = router;

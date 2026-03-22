const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

// Connect to DB to load models
mongoose.connect(process.env.DB_URI || "mongodb://localhost:27017/studyspark")
  .then(() => {
    // Load Question model
    require("./src/models/question");
    const Question = mongoose.model("Question");

    const results = [];
    const filePath = "./uploads/1774189822956-final_160_questions_clean.csv";

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        const cleanKey = (key) => key.replace(/"/g, "").trim();

        let questionsToInsert = results.map((row, index) => {
          const cleanedRow = {};
          Object.keys(row).forEach((key) => {
            cleanedRow[cleanKey(key)] = row[key];
          });

          if (!cleanedRow.questionText) return null;

          return {
            _rowIndex: index + 2, // Excel rows are 1-indexed, and header is row 1
            questionText: cleanedRow.questionText?.trim(),
            options: {
              A: cleanedRow.optionA?.trim(),
              B: cleanedRow.optionB?.trim(),
              C: cleanedRow.optionC?.trim(),
              D: cleanedRow.optionD?.trim(),
            },
            correctOption: cleanedRow.correctOption?.trim().toUpperCase(),
            explanation: cleanedRow.explanation?.trim(),
            marks: Number(cleanedRow.marks) || 1,
            negativeMarks: Number(cleanedRow.negativeMarks) || 0,
            subject: cleanedRow.subject?.trim(),
            chapter: cleanedRow.chapter?.trim(),
            topic: cleanedRow.topic?.trim(),
            difficulty: cleanedRow.difficulty?.trim().toLowerCase() || "medium",
            examYear: cleanedRow.examYear ? Number(cleanedRow.examYear) : undefined,
            isPYQ: cleanedRow.isPYQ?.toLowerCase() === "true",
            isRepeated: cleanedRow.isRepeated?.toLowerCase() === "true",
            importance: cleanedRow.importance?.trim().toLowerCase() || "medium",
            createdBy: new mongoose.Types.ObjectId(), // Dummy ID
          };
        }).filter(Boolean);

        let hasError = false;
        for (const qData of questionsToInsert) {
          const q = new Question(qData);
          const err = q.validateSync();
          if (err) {
            console.error(`Row ${qData._rowIndex} failed validation:`, err.message);
            hasError = true;
            break; // Stop on first error
          }
        }

        if (!hasError) {
          console.log("All rows passed validation!");
        }
        process.exit(0);
      });
  })
  .catch(err => {
    console.error("DB Error:", err);
    process.exit(1);
  });

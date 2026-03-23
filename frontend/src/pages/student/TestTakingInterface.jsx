import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { Clock, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, BookMarked, Flag, BookOpen } from 'lucide-react';
import { customToast } from '../../utils/toast';
import RichText from '../../components/RichText';

const TestTakingInterface = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: "A" }
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Reporting state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('incorrect_question');
  const [reportDesc, setReportDesc] = useState('');

  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        const response = await studentService.getAttempt(attemptId);
        const attemptData = response.data;
        const testData = attemptData.test;
        
        setTest(testData);
        setQuestions(testData.questions);
        
        // Calculate remaining time
        const startTime = new Date(attemptData.startTime).getTime();
        const expiryTime = startTime + (testData.duration * 60 * 1000);
        const currentTime = Date.now();
        const calcTimeLeft = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
        
        setTimeLeft(calcTimeLeft);
        
        // Populate existing answers if any
        if (attemptData.answers && attemptData.answers.length > 0) {
           const initialAnswers = {};
           attemptData.answers.forEach(a => initialAnswers[a.question] = a.selectedOption);
           setAnswers(initialAnswers);
        }
        
      } catch (err) {
        customToast.error(err.response?.data?.error || 'Failed to load test. It may be expired or invalid.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptData();
  }, [attemptId, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleSelectOption = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmitTest = async () => {
    try {
      const answersArray = Object.keys(answers).map(qId => ({ question: qId, selectedOption: answers[qId] }));
      await studentService.submitTest(attemptId, answersArray);
      navigate(`/dashboard/results/${attemptId}`);
    } catch {
      customToast.error('Failed to submit test. It may have expired.');
      navigate('/dashboard');
    }
  };

  const handleBookmark = async (questionId) => {
    try {
      await studentService.bookmarkItem({ itemType: 'Question', itemId: questionId });
      customToast.success('Question bookmarked successfully!');
    } catch {
      customToast.error('Failed to bookmark or already bookmarked.');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentService.reportQuestion({
        questionId: questions[currentIdx]._id,
        reason: reportReason,
        description: reportDesc
      });
      customToast.success('Report submitted successfully. Thank you!');
      setReportModalOpen(false);
      setReportDesc('');
    } catch {
      customToast.error('Failed to submit report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col text-slate-300">
      {/* Test Header */}
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-black text-white capitalize truncate w-48 sm:w-auto tracking-normal">
              {test?.title || 'Active Test'}
            </h1>
            <span className="hidden sm:inline-block px-3 py-1 bg-dark-900 border border-dark-700 text-slate-200 text-xs font-bold uppercase tracking-widest">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className={`flex items-center px-4 py-2 border font-mono font-bold text-sm sm:text-base tracking-widest ${
              timeLeft < 300 ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-primary-500/10 text-primary-500 border-primary-500/30'
            }`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {formatTime(timeLeft)}
            </div>
            
            <button 
              onClick={handleSubmitTest}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2 hidden sm:block" />
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Subject Tabs for Mock Tests */}
      {test?.testType === 'mock' && (
        <div className="bg-dark-800 border-b border-dark-700 px-4 sm:px-6 lg:px-8 py-2 flex space-x-2 overflow-x-auto">
          {[...new Set(questions.map(q => q.subject))].filter(Boolean).map(sub => (
            <button
              key={sub}
              onClick={() => {
                const firstIdx = questions.findIndex(q => q.subject === sub);
                if (firstIdx !== -1) setCurrentIdx(firstIdx);
              }}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors border ${
                questions[currentIdx]?.subject === sub
                  ? 'bg-primary-500/10 text-primary-500 border-primary-500/50 border-b-primary-500 shadow-[inset_0_-2px_0_theme(colors.primary.500)]'
                  : 'bg-dark-900 text-slate-300 hover:bg-dark-800 border-dark-700 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6 lg:gap-8">
        
        {/* Question Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-dark-800 p-8 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 border-l-4 border-l-primary-500 relative">
            
            {/* Action Bar (Bookmark & Report) */}
            <div className="absolute top-6 right-6 flex space-x-2">
               <button 
                 onClick={() => setReportModalOpen(true)}
                 className="p-2 text-slate-300 hover:text-amber-500 hover:bg-dark-900 border border-transparent hover:border-amber-500/20 transition-colors"
                 title="Report Question"
               >
                 <Flag className="w-5 h-5" />
               </button>
               <button 
                 onClick={() => handleBookmark(currentQ._id)}
                 className="p-2 text-slate-300 hover:text-primary-500 hover:bg-dark-900 border border-transparent hover:border-primary-500/20 transition-colors"
                 title="Bookmark Question"
               >
                 <BookMarked className="w-5 h-5" />
               </button>
            </div>

            <div className="mb-8 pr-24">
              <span className="inline-block px-3 py-1 bg-dark-900 border border-dark-700 text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
                Question {currentIdx + 1}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                <RichText content={currentQ?.questionText} />
              </div>
              <div className="mt-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
                Marks: <span className="text-green-500 ml-1">+{currentQ?.marks || 4}</span>
              </div>
            </div>

            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(currentQ?._id, opt)}
                  className={`w-full text-left p-5 border-2 transition-colors flex items-center ${
                    currentQ && answers[currentQ._id] === opt
                      ? 'border-primary-500 bg-primary-500/5 text-primary-400 font-bold'
                      : 'border-dark-700 hover:border-dark-600 bg-dark-900 text-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 border flex items-center justify-center mr-5 shrink-0 transition-colors text-xs font-bold uppercase ${
                    currentQ && answers[currentQ._id] === opt 
                      ? 'bg-primary-500 border-primary-500 text-white' 
                      : 'bg-dark-800 border-dark-700 text-slate-300'
                  }`}>
                    {opt}
                  </div>
                  <span className="text-base sm:text-lg leading-relaxed w-full"><RichText content={currentQ?.options[opt]} /></span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className={`flex items-center px-6 py-3 font-bold text-xs uppercase tracking-widest transition-colors border ${
                currentIdx === 0 
                  ? 'opacity-50 cursor-not-allowed bg-dark-900 text-slate-600 border-dark-800' 
                  : 'bg-dark-800 text-white hover:bg-dark-700 border-dark-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-3" />
              Previous
            </button>

            <button
              onClick={() => {
                if (!isLastQuestion) setCurrentIdx(prev => prev + 1);
              }}
              className={`flex items-center px-6 py-3 font-bold text-xs uppercase tracking-widest transition-colors border ${
                isLastQuestion 
                  ? 'opacity-50 cursor-not-allowed bg-dark-900 text-slate-600 border-dark-800' 
                  : 'bg-primary-500 hover:bg-primary-600 text-white border-primary-500'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-3" />
            </button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="w-full md:w-72 bg-dark-800 border border-dark-700 p-6 h-fit shrink-0">
          <h3 className="font-extrabold text-white mb-6 flex items-center tracking-wide uppercase">
            <BookOpen className="w-5 h-5 mr-3 text-primary-500" />
            Palette
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {questions.map((q, idx) => {
              if (test?.testType === 'mock' && q.subject !== questions[currentIdx]?.subject) return null;

              const isAnswered = !!answers[q._id];
              const isCurrent = currentIdx === idx;
              
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-10 h-10 font-bold text-xs transition-colors border focus:outline-none ${
                    isCurrent ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-900 border-primary-500 text-primary-500' : ''
                  } ${
                    isAnswered 
                      ? 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600' 
                      : (!isCurrent ? 'bg-dark-900 text-slate-200 border-dark-700 hover:bg-dark-700' : 'bg-dark-900')
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-4 border-t border-dark-700 pt-6">
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-200">
              <div className="w-3 h-3 bg-primary-500 mr-3"></div>
              Answered ({Object.keys(answers).length})
            </div>
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-200">
              <div className="w-3 h-3 bg-dark-900 border border-dark-700 mr-3"></div>
              Unanswered ({questions.length - Object.keys(answers).length})
            </div>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center text-amber-500 mb-4">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Report Question</h2>
            </div>
            <p className="text-slate-300 dark:text-slate-200 text-sm mb-6">
              Found an issue with this question? Let our instructors know.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                >
                  <option value="incorrect_question">Incorrect Question</option>
                  <option value="incorrect_options">Incorrect/Missing Options</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  rows="3"
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Provide more details to help us fix it..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-md shadow-amber-500/20"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTakingInterface;

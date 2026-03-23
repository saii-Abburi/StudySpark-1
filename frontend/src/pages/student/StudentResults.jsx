import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentService } from '../../services/api';
import { CheckCircle, XCircle, ArrowLeft, Plus, AlertTriangle, BookMarked } from 'lucide-react';
import toast from 'not-a-toast';
import 'not-a-toast/style.css';
import RichText from '../../components/RichText';

const StudentResults = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  
  // Track which explanations are expanded (by question ID)
  const [expandedExplanations, setExpandedExplanations] = useState(new Set());

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await studentService.getAttemptResults(attemptId);
        setResult(response.data);
        
        // Auto-expand all explanations by default
        if (response.data?.answers) {
          const allQuestionIds = response.data.answers.map(a => a.question?._id).filter(Boolean);
          setExpandedExplanations(new Set(allQuestionIds));
        }

        if (response.data?.test?.testType === 'mock') {
          const subjects = [...new Set(response.data.answers.map(a => a.question?.subject))].filter(Boolean);
          if (subjects.length > 0) setActiveSubject(subjects[0]);
        }
      } catch {
        setError('Failed to load test results. They may not exist or are still pending.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center shadow-sm">
        <AlertTriangle className="w-6 h-6 mr-3 shrink-0" />
        {error || 'Results not found.'}
        <Link to="/dashboard" className="ml-auto underline font-medium">Back to Dashboard</Link>
      </div>
    );
  }

  const { test, score, answers, status, createdAt } = result;
  
  // Create a quick lookup for student answers
  const studentAnswers = {};
  answers.forEach(ans => {
    studentAnswers[ans.question?._id] = ans.selectedOption;
  });

  let correctCount = 0;
  let incorrectCount = 0;

  answers.forEach(ans => {
    if (ans.question && ans.selectedOption === ans.question.correctOption) {
      correctCount++;
    } else if (ans.question) {
      incorrectCount++;
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/dashboard" 
          className="p-3 bg-dark-900 border border-dark-700 hover:bg-dark-800 transition-colors text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Test Results</h1>
          <p className="text-slate-200 font-bold text-xs uppercase tracking-widest mt-1">{test?.title} • {test?.subject}</p>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="bg-dark-800 border border-dark-700 p-8 sm:p-12 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary-500/10 transition-colors"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 bg-primary-500/10 border border-primary-500/30 text-primary-500 text-xs font-bold uppercase tracking-widest">
              {status}
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter">{score} <span className="text-base font-bold text-slate-300 uppercase tracking-widest">Points</span></h2>
            <p className="text-slate-200 font-medium max-w-sm">
              You submitted this test on {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString()}.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-dark-900 border border-dark-700 p-6 flex flex-col items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
              <span className="text-3xl font-black text-white">{correctCount}</span>
              <span className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-2">Correct</span>
            </div>
            <div className="bg-dark-900 border border-dark-700 p-6 flex flex-col items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500 mb-3" />
              <span className="text-3xl font-black text-white">{incorrectCount}</span>
              <span className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-2">Incorrect</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center">
          <span className="w-6 h-1 bg-primary-500 mr-3"></span>
          Detailed Review
        </h3>

        {test?.testType === 'mock' && (
          <div className="bg-dark-800 border-b border-dark-700 px-4 sm:px-6 lg:px-8 py-2 flex space-x-2 overflow-x-auto mb-6">
            {[...new Set(answers.map(a => a.question?.subject))].filter(Boolean).map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors border ${
                  activeSubject === sub
                    ? 'bg-primary-500/10 text-primary-500 border-primary-500/50 border-b-primary-500 shadow-[inset_0_-2px_0_theme(colors.primary.500)]'
                    : 'bg-dark-900 text-slate-300 hover:bg-dark-800 border-dark-700 hover:text-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
        
        {answers.length === 0 ? (
          <div className="bg-dark-800 p-8 border border-dark-700 text-center text-slate-200 font-medium">
            No answers were submitted for this test.
          </div>
        ) : (
          <div className="space-y-6">
            {answers.map((ans, index) => {
              const q = ans.question;
              if (!q) return null; // If question was deleted from DB
              if (test?.testType === 'mock' && activeSubject && q.subject !== activeSubject) return null;

              const isCorrect = ans.selectedOption === q.correctOption;

              return (
                <div key={q._id} className={`bg-dark-800 p-6 sm:p-8 border-l-4 transition-colors border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 ${
                  isCorrect 
                    ? 'border-l-green-500' 
                    : 'border-l-red-500'
                }`}>
                  <div className="flex items-start justify-between mb-6">
                     <span className="text-xs font-bold text-slate-300 uppercase tracking-widest bg-dark-900 border border-dark-700 px-3 py-1">Question {index + 1}</span>
                     {isCorrect ? (
                       <span className="flex items-center text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                         <CheckCircle className="w-3 h-3 mr-2" /> +{q.marks}
                       </span>
                     ) : (
                       <span className="flex items-center text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                         <XCircle className="w-3 h-3 mr-2" /> -{q.negativeMarks}
                       </span>
                     )}
                  </div>
                  
                  <div className="text-lg font-bold text-white mb-6 leading-snug">
                    <RichText content={q.questionText} />
                  </div>

                  <div className="flex space-x-2 mb-8 border-b border-dark-700 pb-6">
                    <button
                      onClick={() => {
                        studentService.bookmarkItem({ itemType: 'Question', itemId: q._id })
                          .then(() => toast({
                            message: 'Question bookmarked!',
                            iconType: 'success',
                            background: '#1f2937',
                            color: '#f97316',
                            border: '1px solid #374151',
                          }))
                          .catch(() => toast({
                            message: 'Failed to bookmark or already bookmarked.',
                            iconType: 'error',
                            background: '#1f2937',
                            color: '#f87171',
                            border: '1px solid #374151',
                          }));
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-dark-900 border border-dark-700 hover:border-primary-500/50 hover:bg-primary-500/10 text-slate-200 hover:text-primary-500 transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      <BookMarked className="w-4 h-4" />
                      <span>Bookmark</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = window.prompt("Reason for reporting (e.g., incorrect_question, incorrect_options, inappropriate, other)?", "incorrect_question");
                        if (reason) {
                          studentService.reportQuestion({ questionId: q._id, reason, description: "Reported from results review" })
                            .then(() => toast({
                              message: 'Question reported successfully!',
                              iconType: 'success',
                              background: '#1f2937',
                              color: '#f97316',
                              border: '1px solid #374151',
                            }))
                            .catch(() => toast({
                              message: 'Failed to report.',
                              iconType: 'error',
                              background: '#1f2937',
                              color: '#f87171',
                              border: '1px solid #374151',
                            }));
                        }
                      }}
                       className="flex items-center space-x-2 px-4 py-2 bg-dark-900 border border-dark-700 hover:border-amber-500/50 hover:bg-amber-500/10 text-slate-200 hover:text-amber-500 transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Report</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optText = q.options[opt];
                      if (!optText) return null;
                      
                      const isStudentSelected = ans.selectedOption === opt;
                      const isActualCorrect = q.correctOption === opt;
                      
                      let optionStyle = 'border-dark-700 bg-dark-900 text-slate-300'; // Default
                      
                      if (isActualCorrect) {
                        optionStyle = 'border-green-500/50 bg-green-500/10 text-green-400';
                      } else if (isStudentSelected && !isActualCorrect) {
                        optionStyle = 'border-red-500/50 bg-red-500/10 text-red-400';
                      }

                      return (
                        <div key={opt} className={`flex items-start p-4 border transition-colors ${optionStyle}`}>
                          <strong className="mr-4 mt-0.5 text-xs font-bold uppercase">{opt}.</strong>
                          <div className="leading-relaxed flex-1"><RichText content={optText} /></div>
                          
                          {/* Indicators */}
                          {isActualCorrect && <CheckCircle className="w-5 h-5 text-green-500 ml-3 shrink-0" />}
                          {isStudentSelected && !isActualCorrect && <XCircle className="w-5 h-5 text-red-500 ml-3 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-6 border border-dark-700 bg-dark-900 overflow-hidden">
                      <button 
                        onClick={() => {
                          setExpandedExplanations(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(q._id)) newSet.delete(q._id);
                            else newSet.add(q._id);
                            return newSet;
                          });
                        }}
                        className="w-full flex items-center justify-between p-4 bg-dark-800 hover:bg-dark-700 transition-colors text-white font-bold uppercase tracking-widest text-xs"
                      >
                        <span className="text-primary-500">Explanation</span>
                        <Plus 
                          className={`w-5 h-5 text-slate-200 transition-transform duration-300 ease-in-out ${
                            expandedExplanations.has(q._id) ? 'rotate-[225deg] text-primary-500' : 'rotate-0'
                          }`} 
                        />
                      </button>
                      
                      <div className={`transition-all duration-300 ease-in-out ${
                        expandedExplanations.has(q._id) ? 'max-h-96 opacity-100 p-4 border-t border-t-dark-700 overflow-y-auto' : 'max-h-0 opacity-0 p-0 overflow-hidden'
                      }`}>
                        <div className="text-sm leading-relaxed text-slate-300"><RichText content={q.explanation} /></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { instructorService } from '../../services/api';
import { ArrowLeft, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { customToast } from '../../utils/toast';
import RichText from '../../components/RichText';

const InstructorEditTest = () => {
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // We get the test and its questions by calling getQuestions
        // Let's assume there's a route GET /instructor/quizzes/:testId/questions
        // Wait, the API service getQuizzes gets all quizzes. We need specifically questions for a quiz.
        // Let's try to fetch it. I might need to add this route to api.js if not there.
        // Using a direct axios call or adding it to api.js is better. I'll add it to api.js later.
        // For now let's map it.
        const response = await instructorService.getQuestionsForQuiz(testId);
        setQuestions(response.data.questions || []);
      } catch {
        setError('Failed to fetch questions. Ensure the test exists and you have access.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId]);

  const handleEditClick = (question) => {
    setEditingId(question._id);
    setEditForm({
      questionText: question.questionText,
      options: { ...question.options },
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      marks: question.marks,
      negativeMarks: question.negativeMarks || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    setSaveLoading(true);
    try {
      setQuestions(questions.map(q => q._id === editingId ? { ...q, ...editForm } : q));
      setEditingId(null);
      setEditForm(null);
    } catch (err) {
      customToast.error(err.response?.data?.error || 'Failed to update question.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard" 
            className="p-3 bg-dark-900 border border-dark-700 hover:bg-dark-800 transition-colors text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Edit Questions</h1>
            <p className="text-slate-200 font-bold tracking-widest uppercase text-xs mt-1">Test ID: {testId}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 font-bold text-sm tracking-wide flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-dark-800 p-12 text-center border border-dark-700 shadow-sm">
          <p className="text-slate-200 font-medium">No questions found for this test. Try uploading a CSV on the dashboard.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q._id} className="bg-dark-800 p-6 sm:p-8 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 border-l-4 border-l-primary-500 transition-all">
              
              {editingId === q._id ? (
                // Edit Form
                <div className="space-y-6 pb-2">
                  <div className="flex items-center justify-between border-b border-dark-700 pb-4">
                    <h3 className="text-lg font-black text-white uppercase tracking-wide">Editing Question {index + 1}</h3>
                    <div className="flex space-x-3">
                       <button onClick={handleCancelEdit} className="p-2 text-slate-300 hover:text-white bg-dark-900 hover:bg-dark-700 border border-dark-700 transition-colors">
                         <X className="w-5 h-5" />
                       </button>
                       <button onClick={handleSaveEdit} disabled={saveLoading} className="flex items-center px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50">
                         <Save className="w-4 h-4 mr-2" />
                         {saveLoading ? 'Saving...' : 'Save'}
                       </button>
                    </div>
                  </div>

                  <div className="space-y-6 mt-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">Question Text</label>
                      <textarea 
                        className="w-full px-5 py-4 bg-black/40 border border-dark-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-100 font-medium text-sm leading-relaxed resize-none shadow-inner"
                        rows="3"
                        value={editForm.questionText}
                        onChange={(e) => setEditForm({...editForm, questionText: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-4 border-primary-500 pl-6 py-2 bg-dark-900/50 p-4">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt}>
                          <label className="block text-xs font-bold text-secondary-500 uppercase tracking-widest mb-2">Option {opt}</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-black/40 border border-dark-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-100 font-medium text-sm shadow-inner"
                            value={editForm.options[opt]}
                            onChange={(e) => setEditForm({
                              ...editForm, 
                              options: { ...editForm.options, [opt]: e.target.value }
                            })}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">Explanation (Optional)</label>
                      <textarea 
                        className="w-full px-5 py-4 bg-black/40 border border-dark-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-100 font-medium text-sm leading-relaxed resize-none shadow-inner"
                        rows="3"
                        value={editForm.explanation}
                        onChange={(e) => setEditForm({...editForm, explanation: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-dark-700">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Correct Answer</label>
                        <select 
                          className="w-full px-4 py-3 bg-black/40 border border-dark-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-100 uppercase font-bold text-xs shadow-inner"
                          value={editForm.correctAnswer}
                          onChange={(e) => setEditForm({...editForm, correctAnswer: e.target.value})}
                        >
                          {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Marks (+)</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-black/40 border border-dark-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-100 font-bold text-xs shadow-inner"
                          value={editForm.marks}
                          onChange={(e) => setEditForm({...editForm, marks: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Marks (-)</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-black/40 border border-dark-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-100 font-bold text-xs shadow-inner"
                          value={editForm.negativeMarks}
                          onChange={(e) => setEditForm({...editForm, negativeMarks: Number(e.target.value)})}
                        />
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col md:flex-row md:items-start justify-between group">
                  <div className="flex-1 pr-6 mb-4 md:mb-0">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-sm font-black text-primary-500 uppercase">Q{index + 1}.</span>

                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest bg-dark-900 border border-dark-700 px-3 py-1">
                        +{q.marks || 4} / -{q.negativeMarks || 0}
                      </span>
                    </div>
                    
                    <div className="text-xl font-bold text-white mb-6 leading-snug">
                      <RichText content={q.questionText} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {Object.entries(q.options).map(([key, value]) => (
                        <div key={key} className={`flex items-start p-4 border transition-colors font-medium ${
                          q.correctAnswer === key 
                            ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                            : 'border-dark-700 bg-dark-900 text-slate-300'
                        }`}>
                          <strong className="mr-4 mt-0.5 text-xs font-bold uppercase tracking-widest">{key}.</strong>
                          <div className="leading-relaxed w-full"><RichText content={value} /></div>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="mt-6 p-4 bg-primary-500/5 border border-primary-500/20 text-slate-300 text-sm leading-relaxed">
                        <strong className="block text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">Explanation:</strong>
                        <RichText content={q.explanation} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex shrink-0">
                    <button 
                      onClick={() => handleEditClick(q)}
                      className="flex items-center space-x-2 px-5 py-3 text-white bg-dark-900 hover:bg-primary-500/20 border border-dark-700 hover:border-primary-500/50 transition-colors font-bold text-xs uppercase tracking-widest"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorEditTest;

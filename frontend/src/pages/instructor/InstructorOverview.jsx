import React, { useState, useEffect } from 'react';
import { instructorService } from '../../services/api';
import { Plus, Trash2, Edit3, BookOpen, Layers, FileUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { customToast } from '../../utils/toast';

const InstructorOverview = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Quiz State
  const [isCreating, setIsCreating] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', subject: 'physics', category: 'engineering', duration: 60, testType: 'chapter-wise', difficulty: 'mixed' });
  const [createError, setCreateError] = useState('');

  // CSV Upload State
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [uploadType, setUploadType] = useState('questions'); // 'questions' or 'flashcards'
  const [uploading, setUploading] = useState(false);
  const [csvLimits, setCsvLimits] = useState({
    total: '', easy: '', medium: '', hard: '', maths: '', physics: '', chemistry: '', biology: ''
  });

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await instructorService.getQuizzes();
      setQuizzes(response.data);
    } catch {
      setError('Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      const payload = { ...newQuiz };
      if (payload.testType === 'mock') {
        payload.subject = payload.category; // Ensure backend validation passes
      }
      const response = await instructorService.createQuiz(payload);
      setQuizzes([response.data, ...quizzes]);
      setIsCreating(false);
      setNewQuiz({ title: '', subject: 'physics', category: 'engineering', duration: 60, testType: 'chapter-wise', difficulty: 'mixed' });
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create test.');
    }
  };

  const handleDeleteQuiz = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test? All questions and attempts associated with it will be lost.')) return;
    try {
      await instructorService.deleteQuiz(testId);
      setQuizzes(quizzes.filter(q => q._id !== testId));
    } catch {
      customToast.error('Failed to delete test.');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return customToast.error('Please select a file to upload.');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', csvFile);
    if (uploadType === 'questions') {
      formData.append('limits', JSON.stringify(csvLimits));
    }

    try {
      if (uploadType === 'flashcards') {
        const res = await instructorService.uploadFlashcardsCSV(formData);
        customToast.error(`Successfully uploaded ${res.data.count} flashcards.`);
      } else {
        if (!selectedQuizId) {
           setUploading(false);
           return customToast.error('Please select a quiz to upload questions for.');
        }
        const res = await instructorService.uploadQuestionsCSV(selectedQuizId, formData);
        customToast.error(`Successfully uploaded ${res.data.count} questions.`);
        fetchQuizzes(); // Refresh to get updated marks/question count
      }
      setCsvFile(null);
    } catch (err) {
      customToast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
          <span className="w-8 h-1 bg-primary-500 mr-3"></span>
          Instructor Dashboard
        </h1>
        <p className="text-slate-400 font-medium tracking-wide mt-2">Manage your tests, questions, and students' educational content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Uploads */}
        <div className="space-y-8 lg:col-span-1">
          {/* Stats Widget */}
          <div className="bg-dark-800 p-8 border border-dark-700">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Your Content</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-dark-900 border-l-4 border-l-primary-500">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-500/10 text-primary-500 border border-primary-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-300 uppercase tracking-widest text-xs">Total Quizzes</span>
                </div>
                <span className="text-3xl font-black text-white">{quizzes.length}</span>
              </div>
            </div>
          </div>

          {/* CSV Uploader */}
          <div className="bg-dark-800 p-8 border border-dark-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center uppercase tracking-wide">
              <FileUp className="w-5 h-5 mr-3 text-primary-500" />
              Bulk Upload
            </h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Upload Type</label>
                <select 
                  value={uploadType} 
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-medium"
                >
                  <option value="questions">Questions to Quiz</option>
                  <option value="flashcards">Global Flashcards</option>
                </select>
              </div>

              {uploadType === 'questions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Quiz</label>
                    <select 
                      value={selectedQuizId} 
                      onChange={(e) => setSelectedQuizId(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-medium"
                      required
                    >
                      <option value="" disabled>Select a quiz...</option>
                      {quizzes.map(q => (
                        <option key={q._id} value={q._id}>{q.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedQuizId && (
                    <div className="bg-dark-900 p-5 border border-dark-700 space-y-6">
                       <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Limit</label>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Maximum questions to pull from the file.</p>
                         <input 
                           type="number"
                           min="0"
                           placeholder="All (e.g. 50)"
                           value={csvLimits.total}
                           onChange={(e) => setCsvLimits({...csvLimits, total: e.target.value})}
                           className="w-full px-3 py-2 bg-dark-800 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-medium text-xs"
                         />
                       </div>

                       <div>
                         <label className="block text-[10px] font-bold text-slate-400 border-b border-dark-700 pb-2 mb-3 uppercase tracking-widest">Difficulty Breakdown</label>
                         <div className="grid grid-cols-3 gap-3">
                           {['easy', 'medium', 'hard'].map(diff => (
                             <div key={diff}>
                               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{diff}</label>
                               <input 
                                 type="number"
                                 min="0"
                                 placeholder="All"
                                 value={csvLimits[diff]}
                                 onChange={(e) => setCsvLimits({...csvLimits, [diff]: e.target.value})}
                                 className="w-full px-3 py-2 bg-dark-800 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-medium text-xs"
                               />
                             </div>
                           ))}
                         </div>
                       </div>

                       <div>
                         <label className="block text-[10px] font-bold text-slate-400 border-b border-dark-700 pb-2 mb-3 uppercase tracking-widest">Subject Breakdown</label>
                         <div className="grid grid-cols-2 gap-3">
                           {['maths', 'physics', 'chemistry', 'biology'].map(sub => (
                             <div key={sub}>
                               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{sub}</label>
                               <input 
                                 type="number"
                                 min="0"
                                 placeholder="All"
                                 value={csvLimits[sub]}
                                 onChange={(e) => setCsvLimits({...csvLimits, [sub]: e.target.value})}
                                 className="w-full px-3 py-2 bg-dark-800 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-medium text-xs"
                               />
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CSV File</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-dark-900 file:text-primary-500 hover:file:bg-dark-700 file:border file:border-dark-700 cursor-pointer focus:outline-none transition-colors"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Quiz Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between bg-dark-800 p-6 border border-dark-700">
            <h2 className="text-xl font-black text-white uppercase tracking-wide">Active Quizzes</h2>
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest transition-all"
            >
              {isCreating ? <span className="mr-2 text-lg leading-none">&times;</span> : <Plus className="w-4 h-4 mr-2" />}
              {isCreating ? 'Cancel' : 'New Quiz'}
            </button>
          </div>

          {isCreating && (
            <div className="bg-dark-800 p-8 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 border-l-4 border-l-primary-500">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Create New Quiz</h3>
              {createError && <p className="text-red-500 text-sm font-bold bg-red-500/10 p-3 border border-red-500/30 mb-6 tracking-wide">{createError}</p>}
              
              <form onSubmit={handleCreateQuiz} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" 
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold"
                    placeholder="e.g. Thermodynamics Weekly Test"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Test Type</label>
                  <div className="flex bg-dark-900 border border-dark-700 p-1">
                    <button
                      type="button"
                      onClick={() => setNewQuiz({...newQuiz, testType: 'chapter-wise'})}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                        newQuiz.testType === 'chapter-wise' 
                        ? 'bg-primary-500 text-white' 
                        : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Chapter-wise Test
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewQuiz({...newQuiz, testType: 'mock'})}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                        newQuiz.testType === 'mock' 
                        ? 'bg-primary-500 text-white' 
                        : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Mock Test
                    </button>
                  </div>
                </div>

                {newQuiz.testType === 'chapter-wise' ? (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Subject</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['physics', 'chemistry', 'biology', 'maths'].map(sub => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setNewQuiz({...newQuiz, subject: sub})}
                          className={`py-3 px-4 text-xs font-bold uppercase tracking-widest border transition-all ${
                            newQuiz.subject === sub
                            ? 'bg-dark-800 border-primary-500 text-primary-500'
                            : 'bg-dark-900 border-dark-700 text-slate-500 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Mock Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['engineering', 'medical'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewQuiz({...newQuiz, category: cat})}
                          className={`py-3 px-4 text-xs font-bold uppercase tracking-widest border transition-all flex flex-col items-center justify-center gap-1 ${
                            newQuiz.category === cat
                            ? 'bg-dark-800 border-primary-500 text-primary-500'
                            : 'bg-dark-900 border-dark-700 text-slate-500 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          <span>{cat} Mock</span>
                          <span className={`text-[10px] ${newQuiz.category === cat ? 'text-primary-500/70' : 'text-slate-600'}`}>
                            {cat === 'engineering' ? 'Maths/Phy/Chem' : 'Bio/Phy/Chem'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Difficulty</label>
                  <select 
                    value={newQuiz.difficulty}
                    onChange={(e) => setNewQuiz({...newQuiz, difficulty: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold uppercase text-xs tracking-widest"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed (General)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Duration (Mins)</label>
                  <input 
                    type="number" 
                    value={newQuiz.duration}
                    onChange={(e) => setNewQuiz({...newQuiz, duration: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold"
                    min="1"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-end mt-4">
                  <button type="submit" className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest transition-colors">
                    Save Quiz
                  </button>
                </div>
              </form>
            </div>
          )}

          {error ? (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 font-bold p-4 text-sm tracking-wide">{error}</div>
          ) : quizzes.length === 0 ? (
            <div className="bg-dark-800 p-12 text-center border border-dark-700 shadow-sm mt-8">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No quizzes yet</h3>
              <p className="text-slate-400 font-medium">Click "New Quiz" to create your first assessment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {quizzes.map(quiz => (
                <div key={quiz._id} className="bg-dark-800 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 border-l-4 border-l-primary-500 p-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-dark-800/80 transition-colors">
                  <div className="mb-6 sm:mb-0">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-widest ${
                        quiz.testType === 'mock' 
                          ? (quiz.category === 'engineering' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20')
                          : quiz.subject === 'maths' ? 'text-red-500 bg-red-500/10 border-red-500/20'
                          : quiz.subject === 'physics' ? 'text-purple-500 bg-purple-500/10 border-purple-500/20'
                          : quiz.subject === 'chemistry' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                          : quiz.subject === 'biology' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-primary-500 bg-dark-900 border-dark-700'
                      }`}>
                        {quiz.testType === 'mock' 
                          ? (quiz.category === 'engineering' ? '80 Maths • 40 Physics • 40 Chemistry' : '80 Biology • 40 Physics • 40 Chemistry') 
                          : quiz.subject}
                      </span>
                      <span className="px-3 py-1 bg-dark-900 border border-dark-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        {quiz.difficulty || 'mixed'}
                      </span>
                      <h3 className="text-xl font-bold text-white leading-snug">{quiz.title}</h3>
                    </div>
                    <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-500 space-x-6 ml-1">
                      <span className="flex items-center"><Activity className="w-3 h-3 mr-2" />{quiz.duration} mins</span>
                      <span className="w-1 h-3 bg-dark-700"></span>
                      <span className="flex items-center text-primary-500">Total Marks: {quiz.totalMarks || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link 
                      to={`/dashboard/edit-test/${quiz._id}`} 
                      className="p-3 bg-dark-900 text-slate-400 hover:text-white hover:bg-primary-500/20 border border-dark-700 hover:border-primary-500/50 transition-colors"
                      title="Edit Questions"
                    >
                      <Edit3 className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="p-3 bg-dark-900 text-slate-500 hover:text-red-500 hover:bg-red-500/10 border border-dark-700 hover:border-red-500/30 transition-colors"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorOverview;

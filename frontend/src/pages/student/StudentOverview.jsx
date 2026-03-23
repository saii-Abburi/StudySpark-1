import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { Play, CheckCircle, Award, Target, Activity, Clock, BookOpen, ArrowRight, AlertCircle, Calendar, Trash2, Plus } from 'lucide-react';
import { customToast } from '../../utils/toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const StudentOverview = () => {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const targetExams = user?.targetExams || [];
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', date: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [testsRes, attemptsRes] = await Promise.all([
          studentService.getAvailableTests(),
          studentService.getAttempts()
        ]);
        
        setTests(testsRes.data || []);
        setAttempts(attemptsRes.data || []);
      } catch (err) {
        console.error('Dashboard Error:', err);
        setError('Failed to load dashboard data. Please try again.');
        customToast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartTest = async (testId) => {
    try {
      const response = await studentService.startTest(testId);
      // Navigate to the test taking interface with the attempt ID
      navigate(`/dashboard/test/${response.data.attemptId}`);
    } catch (err) {
      customToast.error(err.response?.data?.error || 'Failed to start test. You might already have an active attempt.');
    }
  };

  const handleResumeTest = (attemptId) => {
    navigate(`/dashboard/test/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Calculate some basic stats
  const completedAttempts = (attempts || []).filter(a => a.status === 'submitted' || a.status === 'completed');
  const totalScore = completedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avgScore = completedAttempts.length > 0 ? Math.round(totalScore / completedAttempts.length) : 0;
  
  // Find active attempts
  const activeAttempts = (attempts || []).filter(a => a.status === 'started');

  const handleAddExam = async () => {
    if (!newExam.name || !newExam.date) return;
    if (targetExams.length >= 3) return customToast.error("Maximum 3 exams allowed");
    
    try {
      const updatedExams = [...targetExams, newExam];
      const res = await studentService.updateExams(updatedExams);
      updateUser({ targetExams: res.data.targetExams });
      setNewExam({ name: '', date: '' });
      setIsAddingExam(false);
      customToast.success("Exam countdown added!");
    } catch (err) {
      customToast.error("Failed to add exam.");
    }
  };

  const handleRemoveExam = async (index) => {
    try {
      const updatedExams = targetExams.filter((_, i) => i !== index);
      const res = await studentService.updateExams(updatedExams);
      updateUser({ targetExams: res.data.targetExams });
      customToast.success("Exam removed.");
    } catch (err) {
      customToast.error("Failed to remove exam.");
    }
  };

  const calculateDaysLeft = (targetDate) => {
    const diffTime = new Date(targetDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Prepare data for the performance chart
  const chartData = [...completedAttempts]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-10) // Show last 10 attempts
    .map(a => ({
      name: a.test?.title?.length > 15 ? a.test?.title?.substring(0, 15) + '...' : a.test?.title || 'Test',
      score: a.score || 0,
      date: new Date(a.createdAt).toLocaleDateString()
    }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
             <span className="w-8 h-1 bg-primary-500 mr-3"></span>
             My Dashboard
          </h1>
          <p className="text-slate-200 font-medium tracking-wide mt-2">Track your progress and take new tests.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-red-500 flex items-center shadow-sm">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800 p-6 border-l-4 border-l-primary-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 shrink-0">
          <div className="flex items-center text-primary-500 mb-4">
            <Target className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-200">Total Tests</h3>
          </div>
          <div className="text-3xl font-black text-white">{completedAttempts.length}</div>
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-2">{activeAttempts.length} in progress</p>
        </div>
        
        <div className="bg-dark-800 p-6 border-l-4 border-l-green-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 shrink-0">
          <div className="flex items-center text-green-500 mb-4">
            <Award className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-200">Avg Score</h3>
          </div>
          <div className="text-3xl font-black text-white">{avgScore}</div>
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-2">Points per test</p>
        </div>

        <div className="bg-dark-800 p-6 border-l-4 border-l-indigo-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 shrink-0">
          <div className="flex items-center text-indigo-500 mb-4">
            <Activity className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-200">Total Points</h3>
          </div>
          <div className="text-3xl font-black text-white">{totalScore}</div>
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-2">Lifetime earnings</p>
        </div>
        
        <div className="bg-dark-800 p-6 border-l-4 border-l-amber-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 shrink-0">
          <div className="flex items-center text-amber-500 mb-4">
            <BookOpen className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-200">Available</h3>
          </div>
          <div className="text-3xl font-black text-white">{tests.length}</div>
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-2">New tests ready</p>
        </div>
      </div>

      {/* Target Exams Countdown */}
      <div className="bg-dark-800 border border-dark-700 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center">
            <span className="w-6 h-1 bg-amber-500 mr-3"></span>
            Exam Countdowns
          </h2>
          {targetExams.length < 3 && !isAddingExam && (
            <button 
              onClick={() => setIsAddingExam(true)}
              className="text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg flex items-center transition-colors uppercase tracking-widest"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Exam Track
            </button>
          )}
        </div>

        {isAddingExam && (
          <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl flex flex-col sm:flex-row items-end gap-4 mb-6 relative overflow-hidden">
            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Exam Name</label>
              <input 
                type="text" 
                placeholder="e.g. AP EAPCET" 
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                value={newExam.name}
                onChange={e => setNewExam({...newExam, name: e.target.value})}
              />
            </div>
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Date</label>
              <input 
                type="date" 
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                value={newExam.date}
                onChange={e => setNewExam({...newExam, date: e.target.value})}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleAddExam}
                className="flex-1 sm:flex-none bg-amber-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg hover:bg-amber-600 transition"
              >
                Save
              </button>
              <button 
                onClick={() => setIsAddingExam(false)}
                className="flex-1 sm:flex-none border border-dark-600 text-slate-300 font-bold text-xs uppercase px-4 py-2.5 rounded-lg hover:bg-dark-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {targetExams.length === 0 && !isAddingExam ? (
          <div className="text-center py-6 border border-dashed border-dark-700 rounded-xl text-slate-400 text-sm">
            Track up to 3 upcoming exams and stay focused!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {targetExams.map((exam, idx) => {
              const daysLeft = calculateDaysLeft(exam.date);
              return (
                <div key={idx} className="bg-dark-900 border border-dark-700 p-5 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleRemoveExam(idx)} className="text-slate-500 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Calendar className="w-6 h-6 text-amber-500 mb-3" />
                  <h3 className="text-white font-bold text-lg mb-1 truncate">{exam.name}</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-amber-500">{daysLeft}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Days Left</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 font-medium">Target: {new Date(exam.date).toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Chart */}
      {chartData.length > 1 && (
        <div className="bg-dark-800 border border-dark-700 p-6 sm:p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center mb-6">
            <span className="w-6 h-1 bg-indigo-500 mr-3"></span>
            Performance History
          </h2>
          <div className="h-64 sm:h-80 w-full min-h-[300px]" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, bottom: 25, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', padding: '12px' }}
                  itemStyle={{ color: '#8b5cf6', fontWeight: '900', fontSize: '16px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                  formatter={(value) => [`${value} Points`, 'Score']}
                  labelFormatter={(label) => `Test: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#1e293b' }} 
                  activeDot={{ r: 8, fill: '#a78bfa', stroke: '#fff', strokeWidth: 2 }} 
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Attempts (Takes up 2/3 width on LG screens) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center">
            <span className="w-6 h-1 bg-primary-500 mr-3"></span>
            Recent Attempts
          </h2>
          
          <div className="bg-dark-800 border border-dark-700">
            {attempts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-dark-900 border border-dark-700 flex items-center justify-center mb-6">
                  <Activity className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">No attempts yet</h3>
                <p className="text-slate-200 font-medium">Start a test to see your history here.</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-700">
                {attempts.slice(0, 5).map(attempt => (
                  <div key={attempt._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-dark-800/80 transition-colors gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 border mt-1 shrink-0 ${
                        attempt.status === 'completed' || attempt.status === 'submitted' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                     }`}>
                        {attempt.status === 'completed' || attempt.status === 'submitted' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white leading-snug">{attempt.test?.title || 'Unknown Test'}</h4>
                        <div className="flex flex-wrap items-center mt-2 gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-widest text-slate-200">
                          <span className="flex items-center text-primary-500">
                            {attempt.test?.subject}
                          </span>
                          <span>•</span>
                          <span>{new Date(attempt.updatedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`${attempt.status === 'started' ? 'text-amber-500' : 'text-green-500'}`}>
                            {attempt.status === 'started' ? 'In Progress' : 'Completed'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
                       {attempt.status === 'started' ? (
                          <button
                            onClick={() => handleResumeTest(attempt._id)}
                            className="w-full sm:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest transition-colors shadow-lg shadow-amber-500/20"
                          >
                            Resume
                          </button>
                       ) : (
                          <>
                            <div className="text-lg font-black text-white px-4 py-1 bg-dark-900 border border-dark-700 inline-block text-center sm:text-right">
                              {attempt.score !== undefined ? `${attempt.score} pts` : 'Pending'}
                            </div>
                            <button
                              onClick={() => navigate(`/dashboard/results/${attempt._id}`)}
                              className="text-xs font-bold text-primary-500 hover:text-primary-400 uppercase tracking-widest flex items-center justify-center sm:justify-end"
                            >
                              View Details <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                          </>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {attempts.length > 5 && (
              <div className="p-4 border-t border-dark-700 text-center">
                <button 
                  onClick={() => navigate('/dashboard/results')} // If you have a full history page
                  className="text-primary-500 hover:text-primary-400 font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  View All History
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Available Tests */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center">
              <span className="w-6 h-1 bg-amber-500 mr-3"></span>
              Available Tests
            </h2>
          </div>
          
          <div className="space-y-4">
            {tests.length === 0 ? (
              <div className="bg-dark-800 border border-dark-700 p-8 text-center text-slate-300 font-bold text-xs uppercase tracking-widest">
                No new tests right now
              </div>
            ) : (
              tests.map(test => {
                // Check if user already has an active attempt for this test
                const hasActiveAttempt = activeAttempts.some(a => a.test?._id === test._id || a.test === test._id);
                
                return (
                  <div key={test._id} className="bg-dark-800 p-6 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 hover:bg-dark-800/80 transition-colors group relative border-l-4 border-l-amber-500">
                    <span className="inline-block px-2 py-1 bg-dark-900 border border-dark-700 text-slate-200 text-xs font-bold uppercase tracking-widest mb-3">
                      {test.testType === 'mock' 
                        ? (test.category === 'engineering' ? '80 Maths • 40 Physics • 40 Chemistry' : '80 Biology • 40 Physics • 40 Chemistry')
                        : test.subject} • {test.duration}m
                    </span>
                    <h3 className="text-lg font-bold text-white mb-4 leading-snug pr-4">{test.title}</h3>
                    
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                        {test.totalMarks ? `${test.totalMarks} Marks` : 'Unmarked'}
                      </span>
                      {hasActiveAttempt ? (
                         <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">In Progress</span>
                      ) : (
                        <button 
                          onClick={() => handleStartTest(test._id)}
                          className="w-10 h-10 rounded-full bg-dark-900 border border-dark-700 hover:border-amber-500 hover:bg-amber-500/10 text-slate-200 hover:text-amber-500 flex items-center justify-center transition-all group-hover:scale-110"
                        >
                          <Play className="w-4 h-4 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default StudentOverview;

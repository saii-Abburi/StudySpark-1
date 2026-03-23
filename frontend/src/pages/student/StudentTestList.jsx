import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { customToast } from '../../utils/toast';
import { Play, Filter, AlertCircle, BookOpen, Clock, Target, Activity } from 'lucide-react';

const StudentTestList = () => {
  const { testType, subCategory } = useParams();
  const navigate = useNavigate();
  
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Title formatting based on route params
  const formatTitle = () => {
    const typeStr = testType === 'mock' ? 'Mock Tests' : 'Chapter-wise Tests';
    const catStr = subCategory.charAt(0).toUpperCase() + subCategory.slice(1);
    return `${catStr} ${typeStr}`;
  };

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const params = {
          testType: testType === 'mock' ? 'mock' : 'chapter-wise'
        };
        
        if (testType === 'mock') {
          params.category = subCategory;
        } else {
          params.subject = subCategory;
        }
  
        const response = await studentService.getAvailableTests(params);
        setTests(response.data || []);
      } catch (err) {
        console.error('Error fetching tests:', err);
        customToast.error('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [testType, subCategory]);

  const handleStartTest = async (testId) => {
    try {
      const response = await studentService.startTest(testId);
      navigate(`/dashboard/test/${response.data.attemptId}`);
    } catch (err) {
      customToast.error(err.response?.data?.error || 'Failed to start test.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-dark-800 p-8 border-l-4 border-l-primary-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            {formatTitle()}
          </h1>
          <p className="text-slate-200 font-medium text-sm">
            Select a test below to start practicing. Good luck!
          </p>
        </div>
      </div>
      {/* Tests Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-dark-900 border border-dark-700 flex items-center justify-center mb-6 rounded-full">
            <AlertCircle className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">No Tests Found</h3>
          <p className="text-slate-200 font-medium max-w-md">
            We couldn't find any tests matching your current selection. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => (
            <div key={test._id} className="bg-dark-800 border bg-gradient-to-br from-dark-800 to-dark-900 border-dark-700 hover:border-primary-500/50 transition-all group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors"></div>
              
              <div className="p-6 flex-1 relative z-10 flex flex-col">
                <div className="flex justify-end items-start mb-4">
                  <div className="flex items-center text-slate-200 text-xs font-bold bg-dark-900 px-3 py-1 border border-dark-700">
                    <Clock className="w-3 h-3 mr-1" />
                    {test.duration}m
                  </div>
                </div>
                
                {test.testType === 'mock' ? (
                  <span className={`inline-block mb-3 text-xs font-bold uppercase tracking-widest px-2 py-1 border w-fit ${
                    test.category === 'engineering' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {test.category === 'engineering' ? '80 Maths • 40 Physics • 40 Chemistry' : '80 Biology • 40 Physics • 40 Chemistry'}
                  </span>
                ) : (
                  <span className={`inline-block mb-3 text-xs font-bold uppercase tracking-widest px-2 py-1 border w-fit ${
                    test.subject === 'maths' ? 'text-red-500 bg-red-500/10 border-red-500/20'
                    : test.subject === 'physics' ? 'text-purple-500 bg-purple-500/10 border-purple-500/20'
                    : test.subject === 'chemistry' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                    : test.subject === 'biology' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-slate-200 bg-dark-900 border-dark-700'
                  }`}>
                    {test.subject}
                  </span>
                )}
                
                <h3 className="text-lg font-black text-white mb-3 leading-snug flex-1">{test.title}</h3>
                
                <div className="flex items-center text-slate-200 text-xs font-bold uppercase tracking-widest mb-6 pt-4 border-t border-dark-700/50">
                  <Target className="w-4 h-4 mr-2 text-primary-500" />
                  {test.totalMarks ? `${test.totalMarks} Points` : 'Practice'}
                </div>
                
                <button 
                  onClick={() => handleStartTest(test._id)}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center group-hover:shadow-primary-500/40"
                >
                  Start Test
                  <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentTestList;

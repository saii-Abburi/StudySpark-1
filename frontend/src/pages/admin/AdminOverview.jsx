import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Users, FileText, CheckSquare, Activity, ShieldAlert } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, onlineRes, attemptsRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getOnlineUsers(),
          adminService.getRecentAttempts()
        ]);
        setStats(statsRes.data);
        setOnlineUsers(onlineRes.data.users || []);
        setRecentAttempts(attemptsRes.data || []);
      } catch {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-6 font-bold text-sm tracking-wide flex items-center">
        <ShieldAlert className="w-6 h-6 mr-3 shrink-0" />
        {error}
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: <Users className="w-6 h-6 text-indigo-500" /> },
    { title: 'Total Tests', value: stats?.totalTests || 0, icon: <FileText className="w-6 h-6 text-primary-500" /> },
    { title: 'Total Questions', value: stats?.totalQuestions || 0, icon: <CheckSquare className="w-6 h-6 text-emerald-500" /> },
    { title: 'Total Attempts', value: stats?.totalAttempts || 0, icon: <Activity className="w-6 h-6 text-amber-500" /> },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
          <span className="w-8 h-1 bg-primary-500 mr-3"></span>
          Admin Dashboard
        </h1>
        <p className="text-slate-200 font-medium tracking-wide mt-2">Platform overview and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-dark-800 p-6 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 border-l-4 border-l-primary-500 transition-colors group hover:bg-dark-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-dark-900 border border-dark-700 group-hover:bg-dark-800 transition-colors">
                {stat.icon}
              </div>
              <Activity className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Extended platform visibility can be added here, like a small activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Attempts */}
        <div className="bg-dark-800 p-8 border border-dark-700 relative overflow-hidden">
          <h3 className="text-xl font-black text-white uppercase tracking-wide mb-6 relative z-10 flex items-center">
            <Activity className="w-5 h-5 mr-3 text-primary-500" />
            Live Test Activity
          </h3>
          
          <div className="space-y-4 relative z-10">
            {recentAttempts.length === 0 ? (
              <p className="text-slate-200 font-medium">No recent attempts.</p>
            ) : (
              recentAttempts.map((attempt) => (
                <div key={attempt._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-dark-900 border border-dark-700 hover:bg-dark-800 transition-colors gap-3">
                  <div>
                    <p className="font-bold text-white text-sm">
                      {attempt.user?.firstName || 'Student'} <span className="text-slate-300 font-medium px-1">attempted</span> {attempt.test?.title}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-2">
                      {new Date(attempt.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border self-start sm:self-auto shrink-0 ${
                    attempt.status === 'submitted' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {attempt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Online Users */}
        <div className="bg-dark-800 p-8 border border-dark-700 relative overflow-hidden">
          <h3 className="text-xl font-black text-white uppercase tracking-wide mb-6 relative z-10 flex items-center">
            <span className="relative flex h-3 w-3 mr-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Online Users (Last 5 mins)
          </h3>
          
          <div className="space-y-4 relative z-10">
            {onlineUsers.length === 0 ? (
              <p className="text-slate-200 font-medium">No users currently online.</p>
            ) : (
              onlineUsers.map((user) => (
                <div key={user._id} className="flex justify-between items-center p-5 bg-dark-900 border border-dark-700 hover:bg-dark-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 font-black uppercase text-lg">
                      {user.firstName ? user.firstName[0] : user.email[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-200">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest bg-dark-800 px-3 py-1 border border-dark-700">
                    {user.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

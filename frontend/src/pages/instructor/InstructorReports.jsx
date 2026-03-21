import React, { useState, useEffect } from 'react';
import { instructorService } from '../../services/api';
import { customToast } from '../../utils/toast';
import { Flag, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const InstructorReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await instructorService.getReports();
      setReports(response.data);
    } catch {
      // Using toast for error
      customToast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId, status) => {
    try {
      await instructorService.updateReportStatus(reportId, status);
      setReports(reports.map(r => r._id === reportId ? { ...r, status } : r));
      customToast.success(`Report marked as ${status}.`);
    } catch {
      customToast.error('Failed to update report status.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="w-8 h-1 bg-amber-500 mr-3"></span>
            Reported Questions
          </h1>
          <p className="text-slate-200 mt-2 font-medium">Review and resolve issues reported by students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 p-12 text-center text-slate-200">
            No active reports right now.
          </div>
        ) : (
          reports.map(report => (
            <div key={report._id} className="bg-dark-800 border-l-4 border-amber-500 border-t border-r border-b border-dark-700 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                    report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    report.status === 'resolved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    'bg-slate-500/10 text-slate-200 border border-slate-500/20'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-slate-300 text-xs font-bold uppercase flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">Question:</h3>
                  <div className="bg-dark-900 border border-dark-700 p-4 text-slate-300 text-sm">
                    {report.question?.questionText || "Question text unavailable"}
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-4">
                  <h4 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Reason: {report.reason.replace('_', ' ')}
                  </h4>
                  {report.description && (
                    <p className="text-slate-300 text-sm mt-2">{report.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                {report.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(report._id, 'resolved')}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Resolve
                    </button>
                    <button
                      onClick={() => updateStatus(report._id, 'dismissed')}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-dark-900 hover:bg-dark-700 text-slate-200 border border-dark-700 transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InstructorReports;

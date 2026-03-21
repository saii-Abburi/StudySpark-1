import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { FileText, Download, Eye, Search, AlertCircle, Lock } from 'lucide-react';
import { customToast } from '../../utils/toast';

const StudentResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await studentService.getResources();
      setResources(response.data);
    } catch {
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleViewResource = async (id) => {
    try {
      const response = await studentService.viewResource(id);
      
      // Create a Blob from the PDF Stream
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      // Open in new tab securely
      window.open(fileURL, '_blank');
      
      // Note: Ideally, clean up URL.revokeObjectURL(fileURL) after use, 
      // but opening in a new tab makes that tricky. The browser handles it well enough.
    } catch {
      customToast.error('Failed to open PDF. It may be restricted.');
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
            <span className="w-8 h-1 bg-primary-500 mr-3"></span>
            Study Materials
          </h1>
          <p className="text-slate-200 font-medium tracking-wide mt-2">Access PDFs, lecture notes, and formula sheets.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center shadow-sm">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-dark-900 p-4 border border-dark-700 flex items-center">
        <Search className="w-5 h-5 text-primary-500 mr-3" />
        <input 
          type="text"
          placeholder="Search by title or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white font-medium placeholder-slate-500"
        />
      </div>

      {/* Resources List */}
      <div className="bg-dark-800 border border-dark-700">
        {loading ? (
          <div className="p-8 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Loading study materials...</div>
        ) : filteredResources.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-dark-900 border border-dark-700 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No materials available</h3>
            <p className="text-slate-200 font-medium max-w-sm">There are currently no study materials uploaded for you to view.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredResources.map((resource) => (
              <div key={resource._id} className="group bg-dark-900 p-6 border-l-4 border-l-primary-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 hover:bg-dark-800/80 transition-colors relative flex flex-col items-start h-full">
                
                <div className="flex items-center justify-between w-full mb-6 relative z-10">
                  <div className={`w-12 h-12 border flex items-center justify-center shrink-0 ${
                    resource.isPremium ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-primary-500/10 border-primary-500/30 text-primary-500'
                  }`}>
                    {resource.isPremium ? <Lock className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  {resource.isPremium && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest flex items-center">
                      Premium
                    </span>
                  )}
                </div>

                <div className="relative z-10 w-full flex-grow mb-6">
                  <span className="inline-block px-2 py-1 bg-dark-800 border border-dark-700 text-slate-300 text-xs font-bold uppercase tracking-widest mb-3 block">
                    {resource.subject} {resource.chapter && `• ${resource.chapter}`}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">
                    Uploaded: {new Date(resource.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button 
                  onClick={() => handleViewResource(resource._id)}
                  className="mt-auto w-full py-3 bg-dark-800 hover:bg-dark-700 text-white border border-dark-600 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center relative z-10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentResources;

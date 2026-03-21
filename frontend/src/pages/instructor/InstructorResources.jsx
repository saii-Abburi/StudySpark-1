import React, { useState, useEffect, useRef } from 'react';
import { instructorService } from '../../services/api';
import { FileText, UploadCloud, Trash2, AlertCircle, Search, PlusCircle, X } from 'lucide-react';
import { customToast } from '../../utils/toast';

const InstructorResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    chapter: '',
    isPremium: 'false'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getResources();
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      customToast.error('Please select a valid PDF file.');
      e.target.value = null;
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !formData.title || !formData.subject) {
      customToast.error('Please provide a file, title, and subject.');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      if (formData.chapter) data.append('chapter', formData.chapter);
      data.append('isPremium', formData.isPremium);

      await instructorService.uploadResource(data);
      customToast.error('Resource uploaded successfully!');
      setShowUploadModal(false);
      
      // Reset form
      setFormData({ title: '', subject: '', chapter: '', isPremium: 'false' });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      
      fetchResources();
    } catch (err) {
      customToast.error(err.response?.data?.error || 'Failed to upload resource.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await instructorService.deleteResource(id);
      setResources(prev => prev.filter(r => r._id !== id));
    } catch {
      customToast.error('Failed to delete resource.');
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
          <p className="text-slate-200 font-medium tracking-wide mt-2">Manage and upload PDF resources for your students.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest flex items-center transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Upload New Resource
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 font-bold text-sm tracking-wide flex items-center">
          <AlertCircle className="h-5 w-5 mr-3" />
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-dark-800 p-4 border border-dark-700 flex items-center">
        <Search className="w-5 h-5 text-slate-300 mr-3" />
        <input 
          type="text"
          placeholder="SEARCH BY TITLE OR SUBJECT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none focus:outline-none text-white font-bold text-sm tracking-widest uppercase placeholder-slate-600"
        />
      </div>

      {/* Resources List */}
      <div className="bg-dark-800 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 border-l-4 border-l-primary-500 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-300 font-bold uppercase tracking-widest text-sm">Loading resources...</div>
        ) : filteredResources.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-dark-900 border border-dark-700 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">No resources found</h3>
            <p className="text-slate-200 max-w-sm mb-8 font-medium">You haven't uploaded any study materials yet, or none match your search.</p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-dark-900 hover:bg-dark-700 text-white border border-dark-700 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Upload First File
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="text-xs font-bold uppercase tracking-widest bg-dark-900 border-b border-dark-700 text-slate-300">
                <tr>
                  <th className="px-6 py-4">Resource Title</th>
                  <th className="px-6 py-4">Subject & Chapter</th>
                  <th className="px-6 py-4">Access</th>
                  <th className="px-6 py-4">Uploaded Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => (
                  <tr key={resource._id} className="border-b border-dark-700 hover:bg-dark-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-dark-900 border border-dark-700 flex items-center justify-center mr-4 shrink-0">
                          <FileText className="w-5 h-5 text-primary-500" />
                        </div>
                        <span className="font-bold text-white text-base">{resource.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold uppercase tracking-widest text-xs text-slate-300">{resource.subject}</span>
                        {resource.chapter && <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">{resource.chapter}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${
                        resource.isPremium ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {resource.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-300">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(resource._id)}
                        className="p-3 bg-dark-900 text-slate-300 hover:text-red-500 hover:bg-red-500/10 border border-dark-700 hover:border-red-500/30 transition-colors"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 w-full max-w-lg shadow-2xl overflow-hidden border border-dark-700 flex flex-col max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-dark-700 flex justify-between items-center bg-dark-900">
              <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center">
                <UploadCloud className="w-6 h-6 mr-3 text-primary-500" />
                Upload Resource
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-300 hover:text-white transition-colors">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <form id="uploadResourceForm" onSubmit={handleUploadSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">Resource Title *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Physics Formula Sheet"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">Subject *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="e.g. Physics"
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold uppercase text-xs tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">Chapter</label>
                    <input 
                      type="text" 
                      value={formData.chapter}
                      onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                      placeholder="Optional"
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">Access Level</label>
                  <select
                    value={formData.isPremium}
                    onChange={(e) => setFormData({...formData, isPremium: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold uppercase text-xs tracking-widest appearance-none"
                  >
                    <option value="false">Free (Available to all students)</option>
                    <option value="true">Premium (Restricted access)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">PDF File *</label>
                  <div className="border border-dashed border-dark-600 p-8 flex flex-col items-center justify-center bg-dark-900 hover:bg-dark-800 transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf"
                      required
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden" 
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-16 h-16 bg-dark-800 border border-dark-700 text-primary-500 flex items-center justify-center mb-4">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-bold text-primary-500 hover:text-primary-400 mb-2 uppercase tracking-widest">Click to browse</span>
                      <span className="text-xs font-medium text-slate-300 uppercase tracking-widest">Only .pdf files are supported (Max 10MB)</span>
                    </label>
                    {selectedFile && (
                      <div className="mt-6 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-widest flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-dark-700 flex justify-end gap-4 bg-dark-900">
              <button 
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-3 text-slate-200 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-700 font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="uploadResourceForm"
                disabled={uploading}
                className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center"
              >
                {uploading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>}
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default InstructorResources;

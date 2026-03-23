import React, { useState, useRef } from 'react';
import api from '../../services/api';
import { 
  Folder, FolderPlus, FileText, UploadCloud, Trash2, Pencil, 
  ChevronRight, ArrowLeft, Plus, X, Loader, Check, FlaskConical, 
  Calculator, Leaf, Bug, Atom, BookOpen
} from 'lucide-react';
import { customToast } from '../../utils/toast';

const STREAMS = {
  engineering: {
    label: 'Engineering',
    color: 'border-l-blue-500',
    accent: 'text-blue-400',
    subjects: [
      { key: 'maths-a', label: 'Maths A', icon: <Calculator className="w-8 h-8" /> },
      { key: 'maths-b', label: 'Maths B', icon: <Calculator className="w-8 h-8" /> },
      { key: 'physics', label: 'Physics', icon: <Atom className="w-8 h-8" /> },
      { key: 'chemistry', label: 'Chemistry', icon: <FlaskConical className="w-8 h-8" /> },
    ]
  },
  agriculture: {
    label: 'Agriculture',
    color: 'border-l-green-500',
    accent: 'text-green-400',
    subjects: [
      { key: 'zoology', label: 'Zoology', icon: <Bug className="w-8 h-8" /> },
      { key: 'botany', label: 'Botany', icon: <Leaf className="w-8 h-8" /> },
      { key: 'physics', label: 'Physics', icon: <Atom className="w-8 h-8" /> },
      { key: 'chemistry', label: 'Chemistry', icon: <FlaskConical className="w-8 h-8" /> },
    ]
  }
};

export default function InstructorResources() {
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Folder create/edit state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [savingFolder, setSavingFolder] = useState(false);

  // Item upload state
  const [showItemModal, setShowItemModal] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [itemTitle, setItemTitle] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemType, setItemType] = useState('pdf');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingItem, setUploadingItem] = useState(false);
  const fileRef = useRef(null);

  // ─── Navigation helpers ───────────────────────────
  const loadFolders = async (stream, subject) => {
    setLoadingFolders(true);
    try {
      const res = await api.get('/resources/folders', { params: { stream: stream.key || stream, subject: subject.key } });
      setFolders(res.data.folders || []);
    } catch { setFolders([]); }
    finally { setLoadingFolders(false); }
  };

  const loadItems = async (folder) => {
    setLoadingItems(true);
    try {
      const res = await api.get(`/resources/items/${folder._id}`);
      setItems(res.data.items || []);
    } catch { setItems([]); }
    finally { setLoadingItems(false); }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setSelectedFolder(null);
    loadFolders(selectedStream, subject);
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    loadItems(folder);
  };

  const goBack = () => {
    if (selectedFolder) { setSelectedFolder(null); return; }
    if (selectedSubject) { setSelectedSubject(null); setFolders([]); return; }
    if (selectedStream) { setSelectedStream(null); return; }
  };

  // ─── Folder CRUD ──────────────────────────────────
  const openCreateFolder = () => { setEditingFolder(null); setFolderName(''); setShowFolderModal(true); };
  const openEditFolder = (folder, e) => { e.stopPropagation(); setEditingFolder(folder); setFolderName(folder.name); setShowFolderModal(true); };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setSavingFolder(true);
    try {
      if (editingFolder) {
        const res = await api.put(`/resources/instructor/folders/${editingFolder._id}`, { name: folderName });
        setFolders(prev => prev.map(f => f._id === editingFolder._id ? res.data.folder : f));
        customToast.success('Folder renamed!');
      } else {
        const res = await api.post('/resources/instructor/folders', {
          stream: selectedStream,
          subject: selectedSubject.key,
          name: folderName,
        });
        setFolders(prev => [...prev, res.data.folder]);
        customToast.success('Folder created!');
      }
      setShowFolderModal(false);
    } catch (err) {
      customToast.error(err.response?.data?.error || 'Failed to save folder');
    } finally { setSavingFolder(false); }
  };

  const handleDeleteFolder = async (folder, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder "${folder.name}" and ALL its contents? This cannot be undone.`)) return;
    try {
      await api.delete(`/resources/instructor/folders/${folder._id}`);
      setFolders(prev => prev.filter(f => f._id !== folder._id));
      if (selectedFolder?._id === folder._id) setSelectedFolder(null);
      customToast.success('Folder deleted.');
    } catch {
      customToast.error('Failed to delete folder.');
    }
  };

  // ─── Item Upload ──────────────────────────────────
  const openUploadModal = () => {
    setItemTitle(''); setItemUrl(''); setItemType('pdf'); setSelectedFile(null); setUploadMode('file');
    setShowItemModal(true);
  };

  const handleUploadItem = async (e) => {
    e.preventDefault();
    if (!itemTitle.trim()) return customToast.error('Title is required');
    if (uploadMode === 'url' && !itemUrl.trim()) return customToast.error('URL is required');
    if (uploadMode === 'file' && !selectedFile) return customToast.error('Please select a file');

    setUploadingItem(true);
    try {
      const data = new FormData();
      data.append('folderId', selectedFolder._id);
      data.append('title', itemTitle);
      data.append('type', itemType);
      if (uploadMode === 'url') data.append('url', itemUrl);
      if (uploadMode === 'file') data.append('file', selectedFile);

      const res = await api.post('/resources/instructor/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setItems(prev => [...prev, res.data.item]);
      customToast.success('Resource uploaded!');
      setShowItemModal(false);
    } catch (err) {
      customToast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploadingItem(false); }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.delete(`/resources/instructor/items/${item._id}`);
      setItems(prev => prev.filter(i => i._id !== item._id));
      customToast.success('Item deleted.');
    } catch { customToast.error('Failed to delete item.'); }
  };

  // ─── Render ──────────────────────────────────────
  const streamData = selectedStream ? STREAMS[selectedStream] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {selectedStream && (
            <button onClick={goBack} className="p-2 text-slate-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
              <span className="w-8 h-1 bg-primary-500 mr-3"></span>
              Materials Manager
            </h1>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              <span className={selectedStream ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setSelectedStream(null); setSelectedSubject(null); setSelectedFolder(null); }}>All Streams</span>
              {selectedStream && <><ChevronRight className="w-3 h-3" /><span className={selectedSubject ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setSelectedSubject(null); setSelectedFolder(null); }}>{streamData?.label}</span></>}
              {selectedSubject && <><ChevronRight className="w-3 h-3" /><span className={selectedFolder ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => setSelectedFolder(null)}>{selectedSubject.label}</span></>}
              {selectedFolder && <><ChevronRight className="w-3 h-3" /><span className="text-white">{selectedFolder.name}</span></>}
            </div>
          </div>
        </div>

        {/* Context actions */}
        <div className="flex gap-3">
          {selectedSubject && !selectedFolder && (
            <button onClick={openCreateFolder} className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
              <FolderPlus className="w-4 h-4" /> New Folder
            </button>
          )}
          {selectedFolder && (
            <button onClick={openUploadModal} className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
              <UploadCloud className="w-4 h-4" /> Upload Resource
            </button>
          )}
        </div>
      </div>

      {/* ── Level 1: Stream Selector ── */}
      {!selectedStream && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(STREAMS).map(([key, s]) => (
            <button key={key} onClick={() => setSelectedStream(key)}
              className={`group bg-dark-800 p-8 border-l-4 ${s.color} border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 text-left hover:bg-dark-700 transition-all`}>
              <BookOpen className="w-10 h-10 text-primary-500 mb-4" />
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">{s.label}</h2>
              <p className="text-slate-400 text-sm mt-2">{s.subjects.length} subjects</p>
              <div className="flex items-center text-primary-500 text-xs font-bold uppercase tracking-widest mt-6">
                Manage <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Level 2: Subject selector ── */}
      {selectedStream && !selectedSubject && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {streamData.subjects.map(subject => (
            <button key={subject.key} onClick={() => handleSubjectClick(subject)}
              className={`group bg-dark-800 p-8 border-l-4 ${streamData.color} border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 text-left hover:bg-dark-700 transition-all flex flex-col items-start`}>
              <div className={`${streamData.accent} mb-4`}>{subject.icon}</div>
              <h3 className="font-black text-white text-lg uppercase tracking-wide">{subject.label}</h3>
              <div className="flex items-center text-primary-500 text-xs font-bold uppercase tracking-widest mt-4">
                Manage <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Level 3: Folders ── */}
      {selectedSubject && !selectedFolder && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white uppercase tracking-wide">{selectedSubject.label} — Folders</h2>
          {loadingFolders ? <div className="text-center text-slate-400 py-12 text-sm font-bold uppercase tracking-widest">Loading...</div> : folders.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 p-16 text-center">
              <Folder className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No folders yet</p>
              <button onClick={openCreateFolder} className="mt-6 px-6 py-3 bg-primary-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-colors">
                Create First Folder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map(folder => (
                <div key={folder._id} onClick={() => handleFolderClick(folder)}
                  className="group bg-dark-800 p-6 border-l-4 border-l-amber-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 hover:bg-dark-700 transition-all cursor-pointer relative">
                  <Folder className="w-8 h-8 text-amber-500 mb-3" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">{folder.name}</h3>
                  <div className="flex items-center gap-2 absolute top-4 right-4">
                    <button onClick={(e) => openEditFolder(folder, e)} className="p-1.5 text-slate-500 hover:text-primary-400 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => handleDeleteFolder(folder, e)} className="p-1.5 text-slate-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Level 4: Items ── */}
      {selectedFolder && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white uppercase tracking-wide">{selectedFolder.name} — Resources</h2>
          {loadingItems ? <div className="text-center text-slate-400 py-12 text-sm font-bold uppercase tracking-widest">Loading...</div> : items.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 p-16 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No resources yet</p>
              <button onClick={openUploadModal} className="mt-6 px-6 py-3 bg-primary-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-colors">
                Upload First Resource
              </button>
            </div>
          ) : (
            <div className="bg-dark-800 border border-dark-700 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="text-xs font-bold uppercase tracking-widest bg-dark-900 border-b border-dark-700 text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} className="border-b border-dark-700 hover:bg-dark-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary-500 shrink-0" />
                          <span className="font-bold text-white">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-bold uppercase tracking-widest">{item.type}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteItem(item)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors">
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
      )}

      {/* ── Folder Create/Edit Modal ── */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 w-full max-w-md border border-dark-700 shadow-2xl">
            <div className="px-6 py-5 border-b border-dark-700 bg-dark-900 flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase tracking-wide">{editingFolder ? 'Rename Folder' : 'New Folder'}</h2>
              <button onClick={() => setShowFolderModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveFolder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Folder Name</label>
                <input
                  type="text" required autoFocus
                  value={folderName}
                  onChange={e => setFolderName(e.target.value)}
                  placeholder="e.g. Revision Notes, Handwritten Notes..."
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowFolderModal(false)} className="px-5 py-2.5 text-slate-300 border border-dark-700 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-dark-700 transition-colors">Cancel</button>
                <button type="submit" disabled={savingFolder} className="px-6 py-2.5 bg-primary-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2 transition-colors">
                  {savingFolder ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingFolder ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Item Upload Modal ── */}
      {showItemModal && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 w-full max-w-lg border border-dark-700 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-dark-700 bg-dark-900 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary-500" /> Upload Resource
              </h2>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUploadItem} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Resource Title *</label>
                <input type="text" required value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="e.g. Chapter 1 – Animal Kingdom"
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Resource Type</label>
                  <select value={itemType} onChange={e => setItemType(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold text-xs uppercase tracking-widest">
                    <option value="pdf">PDF</option>
                    <option value="link">External Link</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Upload Mode</label>
                  <div className="flex">
                    <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border transition-colors ${uploadMode === 'file' ? 'bg-primary-500 text-white border-primary-500' : 'bg-dark-900 border-dark-700 text-slate-400 hover:text-white'}`}>
                      File
                    </button>
                    <button type="button" onClick={() => setUploadMode('url')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border-t border-b border-r transition-colors ${uploadMode === 'url' ? 'bg-primary-500 text-white border-primary-500' : 'bg-dark-900 border-dark-700 text-slate-400 hover:text-white'}`}>
                      URL
                    </button>
                  </div>
                </div>
              </div>

              {uploadMode === 'url' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Resource URL *</label>
                  <input type="url" value={itemUrl} onChange={e => setItemUrl(e.target.value)} placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Upload File *</label>
                  <div className="border border-dashed border-dark-600 p-8 bg-dark-900 hover:bg-dark-800 transition-colors text-center">
                    <input type="file" accept=".pdf,image/*,video/*" ref={fileRef} className="hidden" id="item-file"
                      onChange={e => setSelectedFile(e.target.files[0])} />
                    <label htmlFor="item-file" className="cursor-pointer flex flex-col items-center gap-3">
                      <UploadCloud className="w-8 h-8 text-primary-500" />
                      {selectedFile ? (
                        <span className="text-green-400 font-bold text-sm">{selectedFile.name}</span>
                      ) : (
                        <span className="text-primary-500 font-bold text-sm uppercase tracking-widest">Click to browse files</span>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowItemModal(false)} className="px-5 py-2.5 text-slate-300 border border-dark-700 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-dark-700 transition-colors">Cancel</button>
                <button type="submit" disabled={uploadingItem} className="px-6 py-2.5 bg-primary-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2 transition-colors">
                  {uploadingItem ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</> : <><UploadCloud className="w-4 h-4" /> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

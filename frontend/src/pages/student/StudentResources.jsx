import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Folder, FileText, ChevronRight, ArrowLeft, BookOpen,
  FlaskConical, Calculator, Leaf, Bug, Atom, Maximize2, Minimize2, X
} from 'lucide-react';

const STREAMS = {
  engineering: {
    label: 'Engineering',
    color: 'border-l-blue-500',
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
    subjects: [
      { key: 'zoology', label: 'Zoology', icon: <Bug className="w-8 h-8" /> },
      { key: 'botany', label: 'Botany', icon: <Leaf className="w-8 h-8" /> },
      { key: 'physics', label: 'Physics', icon: <Atom className="w-8 h-8" /> },
      { key: 'chemistry', label: 'Chemistry', icon: <FlaskConical className="w-8 h-8" /> },
    ]
  }
};

export default function StudentResources() {
  const { stream } = useParams();  // /dashboard/materials/:stream
  const navigate = useNavigate();

  // Navigation state
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Validate stream
  const streamData = stream ? STREAMS[stream.toLowerCase()] : null;

  // No stream selected → show stream picker
  if (!stream || !streamData) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
            <span className="w-8 h-1 bg-primary-500 mr-3"></span>
            Materials & Resources
          </h1>
          <p className="text-slate-400 mt-2">Select your stream to explore study materials.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(STREAMS).map(([key, s]) => (
            <button
              key={key}
              onClick={() => navigate(`/dashboard/materials/${key}`)}
              className={`group bg-dark-800 p-8 border-l-4 ${s.color} border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 text-left hover:bg-dark-700 transition-all`}
            >
              <BookOpen className="w-10 h-10 text-primary-500 mb-4" />
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">{s.label}</h2>
              <p className="text-slate-400 text-sm mt-2">{s.subjects.length} subjects available</p>
              <div className="flex items-center text-primary-500 text-xs font-bold uppercase tracking-widest mt-6">
                Explore <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Subject selected → load folders
  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    setSelectedFolder(null);
    setViewingItem(null);
    setLoadingFolders(true);
    try {
      const res = await api.get('/resources/folders', { params: { stream: stream.toLowerCase(), subject: subject.key } });
      setFolders(res.data.folders || []);
    } catch {
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  };

  // Folder selected → load items
  const handleFolderClick = async (folder) => {
    setSelectedFolder(folder);
    setViewingItem(null);
    setLoadingItems(true);
    try {
      const res = await api.get(`/resources/items/${folder._id}`);
      setItems(res.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Breadcrumb back navigation
  const goBack = () => {
    if (viewingItem) { setViewingItem(null); return; }
    if (selectedFolder) { setSelectedFolder(null); return; }
    if (selectedSubject) { setSelectedSubject(null); return; }
    navigate('/dashboard/materials');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 overflow-x-hidden">
      {/* Header + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button onClick={goBack} className="p-2 text-slate-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="text-primary-500 cursor-pointer hover:text-white" onClick={() => navigate('/dashboard/materials')}>Materials</span>
            <ChevronRight className="w-3 h-3" />
            <span className={selectedSubject ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setSelectedSubject(null); setSelectedFolder(null); setViewingItem(null); }}>
              {streamData.label}
            </span>
            {selectedSubject && <><ChevronRight className="w-3 h-3" /><span className={selectedFolder ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setSelectedFolder(null); setViewingItem(null); }}>{selectedSubject.label}</span></>}
            {selectedFolder && <><ChevronRight className="w-3 h-3" /><span className={viewingItem ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => setViewingItem(null)}>{selectedFolder.name}</span></>}
            {viewingItem && <><ChevronRight className="w-3 h-3" /><span className="text-white">{viewingItem.title}</span></>}
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      {viewingItem && (
        <>
          {/* Fullscreen overlay */}
          {isFullscreen && (
            <div className="fixed inset-0 z-[9999] bg-dark-900 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 shrink-0">
                <h2 className="text-sm font-black text-white uppercase tracking-wide truncate pr-4">{viewingItem.title}</h2>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 text-slate-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors shrink-0"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingItem.url)}&embedded=true`}
                title={viewingItem.title}
                className="flex-1 w-full border-0"
              />
            </div>
          )}

          {/* Inline viewer */}
          {!isFullscreen && (
            <div className="bg-dark-800 border border-dark-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
                <h2 className="text-sm font-black text-white uppercase tracking-wide truncate pr-4">{viewingItem.title}</h2>
                <button
                  onClick={() => setIsFullscreen(true)}
                  title="Fullscreen"
                  className="p-2 text-slate-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors shrink-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              {viewingItem.type === 'pdf' ? (
                <div className="w-full overflow-hidden" style={{ touchAction: 'pan-y pinch-zoom' }}>
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingItem.url)}&embedded=true`}
                    title={viewingItem.title}
                    className="w-full border-0 block"
                    style={{ height: 'min(82vh, calc(100vw * 1.41))', display: 'block', maxWidth: '100%' }}
                    scrolling="no"
                  />
                </div>
              ) : (
                <div className="p-6">
                  <a href={viewingItem.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-primary-600 transition-colors">
                    <FileText className="w-4 h-4" /> Open Resource
                  </a>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Resource Items list */}
      {selectedFolder && !viewingItem && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center">
            <span className="w-6 h-1 bg-primary-500 mr-3"></span>
            {selectedFolder.name}
          </h2>
          {loadingItems ? (
            <div className="text-slate-400 text-sm uppercase tracking-widest font-bold py-8 text-center">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No resources here yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <button
                  key={item._id}
                  onClick={() => setViewingItem(item)}
                  className="group bg-dark-800 p-6 border-l-4 border-l-primary-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 text-left hover:bg-dark-700 transition-all"
                >
                  <FileText className="w-8 h-8 text-primary-500 mb-4" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide leading-snug">{item.title}</h3>
                  <div className="flex items-center text-primary-500 text-xs font-bold uppercase tracking-widest mt-4">
                    Open <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Folders list */}
      {selectedSubject && !selectedFolder && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center">
            <span className="w-6 h-1 bg-primary-500 mr-3"></span>
            {selectedSubject.label} — Resource Folders
          </h2>
          {loadingFolders ? (
            <div className="text-slate-400 text-sm uppercase tracking-widest font-bold py-8 text-center">Loading folders...</div>
          ) : folders.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 p-12 text-center">
              <Folder className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No folders created yet</p>
              <p className="text-slate-500 text-xs mt-2">Your instructor hasn't added any resources here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map(folder => (
                <button
                  key={folder._id}
                  onClick={() => handleFolderClick(folder)}
                  className="group bg-dark-800 p-6 border-l-4 border-l-amber-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 text-left hover:bg-dark-700 transition-all"
                >
                  <Folder className="w-8 h-8 text-amber-500 mb-4" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">{folder.name}</h3>
                  <div className="flex items-center text-amber-500 text-xs font-bold uppercase tracking-widest mt-4">
                    Browse <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subject cards */}
      {!selectedSubject && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center">
            <span className="w-6 h-1 bg-primary-500 mr-3"></span>
            {streamData.label} — Select a Subject
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {streamData.subjects.map(subject => (
              <button
                key={subject.key}
                onClick={() => handleSubjectClick(subject)}
                className={`group bg-dark-800 p-8 border-l-4 ${streamData.color} border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 text-left hover:bg-dark-700 transition-all flex flex-col items-start`}
              >
                <div className="text-primary-500 mb-4">{subject.icon}</div>
                <h3 className="font-black text-white text-lg uppercase tracking-wide">{subject.label}</h3>
                <div className="flex items-center text-primary-500 text-xs font-bold uppercase tracking-widest mt-4">
                  View <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

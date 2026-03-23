import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  ChevronRight, ArrowLeft, Plus, Pencil, Trash2,
  UploadCloud, Loader, Check, X, FolderPlus, FileText, BookOpen
} from 'lucide-react';
import { customToast } from '../../utils/toast';

const EMOJI_OPTIONS = ['📄','📘','📗','📙','📝','🔬','📐','🧬','🌿','⚗️','🧪','📊','🗒️','📋'];

// ── Generic inline-edit modal ──────────────────────────────────────────────
function Modal({ title, value, onChange, onSave, onClose, saving, placeholder, extraField }) {
  return (
    <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 w-full max-w-md border border-dark-700 shadow-2xl">
        <div className="px-6 py-4 border-b border-dark-700 bg-dark-900 flex justify-between items-center">
          <h2 className="text-base font-black text-white uppercase tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {extraField}
          <input
            type="text" autoFocus required
            value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder || 'Name...'}
            className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-300 border border-dark-700 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-dark-700 transition-colors">Cancel</button>
            <button onClick={onSave} disabled={saving || !value.trim()} className="px-6 py-2.5 bg-primary-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2 transition-colors">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Level-agnostic list panel ───────────────────────────────────────────────
function ListPanel({ title, items, labelKey = 'name', onSelect, onAdd, addLabel, onEdit, onDelete, selected, iconKey }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white uppercase tracking-wide">{title}</h2>
        <button onClick={onAdd} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nothing here yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <div
              key={item._id}
              onClick={() => onSelect(item)}
              className={`group relative bg-dark-800 p-5 border-l-4 border-l-primary-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 hover:bg-dark-700 transition-all cursor-pointer ${selected?._id === item._id ? 'ring-1 ring-primary-500' : ''}`}
            >
              {iconKey && <span className="text-2xl mb-2 block">{item[iconKey]}</span>}
              <p className="font-bold text-white text-sm uppercase tracking-wide pr-12">{item[labelKey] || item.title || item.name}</p>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); onEdit(item); }} className="p-1.5 text-slate-400 hover:text-primary-400"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={e => { e.stopPropagation(); onDelete(item); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function InstructorResources() {
  // Data state
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [cards, setCards] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [files, setFiles] = useState([]);

  // Selection state
  const [stream, setStream] = useState(null);
  const [subject, setSubject] = useState(null);
  const [card, setCard] = useState(null);
  const [chapter, setChapter] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // { type, editing }
  const [modalValue, setModalValue] = useState('');
  const [modalIcon, setModalIcon] = useState('📄');
  const [modalIsPremium, setModalIsPremium] = useState(false);
  const [modalPrice, setModalPrice] = useState('');
  const [saving, setSaving] = useState(false);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadMode, setUploadMode] = useState('file');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadIsFreePreview, setUploadIsFreePreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Loading
  const [loading, setLoading] = useState(false);

  // ── Loaders ──────────────────────────────────────────────
  useEffect(() => { fetchStreams(); }, []);

  const fetchStreams = async () => {
    try { const r = await api.get('/resources/streams'); setStreams(r.data.streams); } catch {}
  };
  const fetchSubjects = async (streamId) => {
    setLoading(true);
    try { const r = await api.get('/resources/subjects', { params: { streamId } }); setSubjects(r.data.subjects); } catch {}
    setLoading(false);
  };
  const fetchCards = async (subjectId) => {
    setLoading(true);
    try { const r = await api.get('/resources/cards', { params: { subjectId } }); setCards(r.data.cards); } catch {}
    setLoading(false);
  };
  const fetchChapters = async (cardId) => {
    setLoading(true);
    try { const r = await api.get('/resources/chapters', { params: { cardId } }); setChapters(r.data.chapters); } catch {}
    setLoading(false);
  };
  const fetchFiles = async (chapterId) => {
    setLoading(true);
    try { const r = await api.get('/resources/files', { params: { chapterId } }); setFiles(r.data.files); } catch {}
    setLoading(false);
  };

  // ── Navigation ────────────────────────────────────────────
  const selectStream = (s) => { setStream(s); setSubject(null); setCard(null); setChapter(null); fetchSubjects(s._id); };
  const selectSubject = (s) => { setSubject(s); setCard(null); setChapter(null); fetchCards(s._id); };
  const selectCard = (c) => { setCard(c); setChapter(null); fetchChapters(c._id); };
  const selectChapter = (c) => { setChapter(c); fetchFiles(c._id); };

  const goBack = () => {
    if (chapter) { setChapter(null); return; }
    if (card) { setCard(null); return; }
    if (subject) { setSubject(null); return; }
    if (stream) { setStream(null); return; }
  };

  // ── CRUD helpers ─────────────────────────────────────────
  const openCreate = (type) => { 
    setModal({ type, editing: null }); 
    setModalValue(''); 
    setModalIcon('📄'); 
    setModalIsPremium(false);
    setModalPrice('');
  };
  const openEdit = (type, item) => { 
    setModal({ type, editing: item }); 
    setModalValue(item.name || item.title || ''); 
    setModalIcon(item.icon || '📄'); 
    setModalIsPremium(item.isPremium || false);
    setModalPrice(item.price || '');
  };

  const openUpload = () => {
    setShowUpload(true);
    setUploadTitle('');
    setUploadUrl('');
    setUploadFile(null);
    setUploadIsFreePreview(false);
  };

  const handleSave = async () => {
    if (!modalValue.trim()) return;
    setSaving(true);
    try {
      const { type, editing } = modal;
      const url = editing ? `/resources/${type}s/${editing._id}` : `/resources/${type}s`;
      const payload = type === 'stream' ? { name: modalValue }
        : type === 'subject' ? { name: modalValue, streamId: stream._id }
        : type === 'card' ? { title: modalValue, icon: modalIcon, subjectId: subject._id, isPremium: modalIsPremium, price: modalPrice }
        : /* chapter */ { title: modalValue, cardId: card._id };

      const method = editing ? 'put' : 'post';
      const r = await api[method](url, payload);

      const keyMap = { stream: 'stream', subject: 'subject', card: 'card', chapter: 'chapter' };
      const newItem = r.data[keyMap[type]];

      if (type === 'stream') editing ? setStreams(p => p.map(x => x._id === editing._id ? newItem : x)) : setStreams(p => [...p, newItem]);
      if (type === 'subject') editing ? setSubjects(p => p.map(x => x._id === editing._id ? newItem : x)) : setSubjects(p => [...p, newItem]);
      if (type === 'card') editing ? setCards(p => p.map(x => x._id === editing._id ? newItem : x)) : setCards(p => [...p, newItem]);
      if (type === 'chapter') editing ? setChapters(p => p.map(x => x._id === editing._id ? newItem : x)) : setChapters(p => [...p, newItem]);

      customToast.success(`${type} ${editing ? 'updated' : 'created'}!`);
      setModal(null);
    } catch (err) { customToast.error(err.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (type, item) => {
    if (!window.confirm(`Delete "${item.name || item.title}"? This will delete all nested content.`)) return;
    try {
      await api.delete(`/resources/${type}s/${item._id}`);
      if (type === 'stream') { setStreams(p => p.filter(x => x._id !== item._id)); if (stream?._id === item._id) setStream(null); }
      if (type === 'subject') { setSubjects(p => p.filter(x => x._id !== item._id)); if (subject?._id === item._id) setSubject(null); }
      if (type === 'card') { setCards(p => p.filter(x => x._id !== item._id)); if (card?._id === item._id) setCard(null); }
      if (type === 'chapter') { setChapters(p => p.filter(x => x._id !== item._id)); if (chapter?._id === item._id) setChapter(null); }
      customToast.success('Deleted.');
    } catch { customToast.error('Delete failed.'); }
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.title}"?`)) return;
    try {
      await api.delete(`/resources/files/${file._id}`);
      setFiles(p => p.filter(f => f._id !== file._id));
      customToast.success('File deleted.');
    } catch { customToast.error('Delete failed.'); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return customToast.error('Title is required');
    if (uploadMode === 'url' && !uploadUrl.trim()) return customToast.error('URL is required');
    if (uploadMode === 'file' && !uploadFile) return customToast.error('Select a file');

    setUploading(true);
    try {
      const data = new FormData();
      data.append('title', uploadTitle); data.append('chapterId', chapter._id);
      data.append('isFreePreview', uploadIsFreePreview);
      if (uploadMode === 'url') { data.append('fileUrl', uploadUrl); data.append('fileType', 'link'); }
      else { data.append('file', uploadFile); data.append('fileType', 'pdf'); }
      const r = await api.post('/resources/files', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFiles(p => [...p, r.data.file]);
      customToast.success('Uploaded!');
      setShowUpload(false); setUploadTitle(''); setUploadUrl(''); setUploadFile(null);
    } catch (err) { customToast.error(err.response?.data?.error || 'Upload failed'); }
    setUploading(false);
  };

  // ── Level label ───────────────────────────────────────────
  const level = chapter ? 'files' : card ? 'chapters' : subject ? 'cards' : stream ? 'subjects' : 'streams';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header + Breadcrumb */}
      <div className="flex flex-wrap items-center gap-4">
        {stream && (
          <button onClick={goBack} className="p-2 text-slate-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
            <span className="w-6 h-1 bg-primary-500 mr-3"></span>Materials Manager
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
            <span className={stream ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setStream(null); setSubject(null); setCard(null); setChapter(null); }}>Streams</span>
            {stream && <><ChevronRight className="w-3 h-3" /><span className={subject ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setSubject(null); setCard(null); setChapter(null); }}>{stream.name}</span></>}
            {subject && <><ChevronRight className="w-3 h-3" /><span className={card ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setCard(null); setChapter(null); }}>{subject.name}</span></>}
            {card && <><ChevronRight className="w-3 h-3" /><span className={chapter ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => setChapter(null)}>{card.title}</span></>}
            {chapter && <><ChevronRight className="w-3 h-3" /><span className="text-white">{chapter.title}</span></>}
          </div>
        </div>
      </div>

      {loading && <div className="text-center text-slate-400 py-8 text-xs font-bold uppercase tracking-widest">Loading...</div>}

      {/* ── Streams ── */}
      {!stream && !loading && (
        <ListPanel title="Streams" items={streams} labelKey="name"
          onSelect={selectStream} onAdd={() => openCreate('stream')} addLabel="New Stream"
          onEdit={item => openEdit('stream', item)} onDelete={item => handleDelete('stream', item)} />
      )}

      {/* ── Subjects ── */}
      {stream && !subject && !loading && (
        <ListPanel title={`${stream.name} — Subjects`} items={subjects} labelKey="name"
          onSelect={selectSubject} onAdd={() => openCreate('subject')} addLabel="New Subject"
          onEdit={item => openEdit('subject', item)} onDelete={item => handleDelete('subject', item)} />
      )}

      {/* ── Resource Cards ── */}
      {subject && !card && !loading && (
        <ListPanel title={`${subject.name} — Resource Cards`} items={cards} labelKey="title" iconKey="icon"
          onSelect={selectCard} onAdd={() => openCreate('card')} addLabel="New Card"
          onEdit={item => openEdit('card', item)} onDelete={item => handleDelete('card', item)} />
      )}

      {/* ── Chapters ── */}
      {card && !chapter && !loading && (
        <ListPanel title={`${card.title} — Chapters`} items={chapters} labelKey="title"
          onSelect={selectChapter} onAdd={() => openCreate('chapter')} addLabel="New Chapter"
          onEdit={item => openEdit('chapter', item)} onDelete={item => handleDelete('chapter', item)} />
      )}

      {/* ── Files ── */}
      {chapter && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-wide">{chapter.title} — Files</h2>
            <button onClick={() => setShowUpload(true)} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
              <UploadCloud className="w-4 h-4" /> Upload File
            </button>
          </div>
          {files.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 p-12 text-center">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No files yet</p>
            </div>
          ) : (
            <div className="bg-dark-800 border border-dark-700 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-bold uppercase tracking-widest bg-dark-900 border-b border-dark-700 text-slate-400">
                  <tr><th className="px-5 py-3">Title</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Delete</th></tr>
                </thead>
                <tbody>
                  {files.map(f => (
                    <tr key={f._id} className="border-b border-dark-700 hover:bg-dark-700/50">
                      <td className="px-5 py-3 font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-500 shrink-0" />
                        {f.title}
                        {f.isFreePreview && <span className="ml-2 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 font-black uppercase tracking-tighter">Free Preview</span>}
                      </td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-bold uppercase">{f.fileType}</span></td>
                      <td className="px-5 py-3 text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right"><button onClick={() => handleDeleteFile(f)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {modal && (
        <Modal
          title={`${modal.editing ? 'Edit' : 'New'} ${modal.type}`}
          value={modalValue}
          onChange={setModalValue}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
          placeholder={modal.type === 'card' ? 'e.g. Revision Notes' : modal.type === 'chapter' ? 'e.g. Animal Kingdom' : `${modal.type} name...`}
          extraField={modal.type === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Icon (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} type="button" onClick={() => setModalIcon(e)}
                      className={`text-xl p-1.5 rounded border ${modalIcon === e ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 bg-dark-900 hover:border-dark-500'}`}>{e}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${modalIsPremium ? 'bg-primary-500' : 'bg-dark-700'}`} onClick={() => setModalIsPremium(!modalIsPremium)}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${modalIsPremium ? 'left-6' : 'left-1'}`}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Premium Card</span>
                </label>
                {modalIsPremium && (
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="Price" 
                      value={modalPrice} 
                      onChange={e => setModalPrice(e.target.value)}
                      className="w-full px-3 py-1.5 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        />
      )}

      {/* ── Upload File Modal ── */}
      {showUpload && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 w-full max-w-lg border border-dark-700 shadow-2xl">
            <div className="px-6 py-4 border-b border-dark-700 bg-dark-900 flex justify-between items-center">
              <h2 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2"><UploadCloud className="w-5 h-5 text-primary-500" />Upload Resource</h2>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">File Title *</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={uploadIsFreePreview} onChange={e => setUploadIsFreePreview(e.target.checked)} className="rounded border-dark-700 bg-dark-900 text-primary-500 focus:ring-primary-500" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 border border-green-500/20">Free Preview</span>
                </label>
              </div>
              <input type="text" required value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Chapter 1 – Animal Kingdom"
                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold" />
              <div className="flex">
                <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest border transition-colors ${uploadMode === 'file' ? 'bg-primary-500 text-white border-primary-500' : 'bg-dark-900 border-dark-700 text-slate-400 hover:text-white'}`}>Upload File</button>
                <button type="button" onClick={() => setUploadMode('url')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest border-t border-b border-r transition-colors ${uploadMode === 'url' ? 'bg-primary-500 text-white border-primary-500' : 'bg-dark-900 border-dark-700 text-slate-400 hover:text-white'}`}>Paste URL</button>
              </div>
              {uploadMode === 'url' ? (
                <input type="url" value={uploadUrl} onChange={e => setUploadUrl(e.target.value)} placeholder="https://..."
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 text-white font-bold" />
              ) : (
                <div className="border border-dashed border-dark-600 p-6 bg-dark-900 text-center">
                  <input type="file" accept=".pdf,image/*" ref={fileRef} className="hidden" id="res-file" onChange={e => setUploadFile(e.target.files[0])} />
                  <label htmlFor="res-file" className="cursor-pointer flex flex-col items-center gap-2">
                    <UploadCloud className="w-7 h-7 text-primary-500" />
                    {uploadFile ? <span className="text-green-400 font-bold text-sm">{uploadFile.name}</span> : <span className="text-primary-500 font-bold text-sm uppercase tracking-widest">Click to browse</span>}
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="px-5 py-2.5 text-slate-300 border border-dark-700 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-dark-700 transition-colors">Cancel</button>
                <button type="submit" disabled={uploading} className="px-6 py-2.5 bg-primary-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2 transition-colors">
                  {uploading ? <><Loader className="w-4 h-4 animate-spin" />Uploading...</> : <><UploadCloud className="w-4 h-4" />Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

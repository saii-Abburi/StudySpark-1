import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ChevronRight, ArrowLeft, BookOpen, Folder, FileText, Maximize2, Minimize2, Lock
} from 'lucide-react';

// ── Navigation level constants ───────────────────────────────────────────────
const LEVELS = ['streams', 'subjects', 'cards', 'chapters', 'files'];

export default function StudentResources() {
  const { streamId } = useParams();
  const navigate = useNavigate();

  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [cards, setCards] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [files, setFiles] = useState([]);

  const [stream, setStream] = useState(null);
  const [subject, setSubject] = useState(null);
  const [card, setCard] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [cardMeta, setCardMeta] = useState({ isPremium: false, hasPurchased: true, price: 0 });
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // Load streams on mount
  useEffect(() => {
    api.get('/resources/streams').then(r => setStreams(r.data.streams || [])).catch(() => {});
  }, []);

  // Handle direct navigation via streamId param
  useEffect(() => {
    if (streamId && streams.length > 0) {
      const found = streams.find(s => s._id === streamId);
      if (found) selectStream(found);
    }
  }, [streamId, streams]);

  // ── Loaders ─────────────────────────────────────────────
  const loadSubjects = async (s) => {
    setLoading(true);
    try { const r = await api.get('/resources/subjects', { params: { streamId: s._id } }); setSubjects(r.data.subjects || []); } catch {}
    setLoading(false);
  };
  const loadCards = async (s) => {
    setLoading(true);
    try { const r = await api.get('/resources/cards', { params: { subjectId: s._id } }); setCards(r.data.cards || []); } catch {}
    setLoading(false);
  };
  const loadChapters = async (c) => {
    setLoading(true);
    try { const r = await api.get('/resources/chapters', { params: { cardId: c._id } }); setChapters(r.data.chapters || []); } catch {}
    setLoading(false);
  };
  const loadFiles = async (c) => {
    setLoading(true);
    try { 
      const r = await api.get('/resources/files', { params: { chapterId: c._id } }); 
      setFiles(r.data.files || []);
      setCardMeta({ 
        isPremium: r.data.cardIsPremium, 
        hasPurchased: r.data.hasPurchased, 
        price: r.data.cardPrice 
      });
    } catch {}
    setLoading(false);
  };

  const purchaseResource = async () => {
    if (!card) return;
    setPurchasing(true);
    try {
      await api.post(`/resources/purchase/${card._id}`);
      // Refresh to unlock
      loadFiles(chapter);
    } catch (err) { alert('Purchase failed. Please try again.'); }
    setPurchasing(false);
  };

  // ── Navigation ───────────────────────────────────────────
  const selectStream = (s) => { setStream(s); setSubject(null); setCard(null); setChapter(null); setViewingFile(null); loadSubjects(s); };
  const selectSubject = (s) => { setSubject(s); setCard(null); setChapter(null); setViewingFile(null); loadCards(s); };
  const selectCard = (c) => { setCard(c); setChapter(null); setViewingFile(null); loadChapters(c); };
  const selectChapter = (c) => { setChapter(c); setViewingFile(null); loadFiles(c); };

  const goBack = () => {
    if (viewingFile) { setViewingFile(null); setIsFullscreen(false); return; }
    if (chapter) { setChapter(null); return; }
    if (card) { setCard(null); return; }
    if (subject) { setSubject(null); return; }
    if (stream) { setStream(null); return; }
  };

  // ── Render helpers ───────────────────────────────────────
  const CardGrid = ({ items, onSelect, labelKey = 'name', iconKey, colorClass = 'border-l-primary-500', emptyMsg = 'Nothing here yet' }) => (
    items.length === 0 ? (
      <div className="bg-dark-800 border border-dark-700 p-12 text-center">
        <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{emptyMsg}</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(item => (
          <button key={item._id} onClick={() => onSelect(item)}
            className={`group bg-dark-800 p-6 border border-dark-700 ${item.isPremium 
              ? 'border-l-4 border-l-amber-500 bg-gradient-to-br from-dark-800 via-dark-800 to-amber-500/10 shadow-[0_4px_20px_rgba(245,158,11,0.08)]' 
              : `border-l-4 ${colorClass}`
            } text-left hover:bg-dark-700 transition-all flex flex-col relative overflow-hidden`}>
            {item.isPremium && (
              <>
                <div className="absolute top-0 right-0 p-2">
                  <span className="bg-amber-500 text-[10px] font-black text-white px-2 py-0.5 uppercase tracking-[0.15em] shadow-lg flex items-center gap-1">
                    <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                    Premium
                  </span>
                </div>
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/5 blur-2xl rounded-full"></div>
              </>
            )}
            {iconKey && <span className="text-2xl mb-3 drop-shadow-md">{item[iconKey]}</span>}
            {!iconKey && <Folder className="w-7 h-7 text-amber-500 mb-3" />}
            <h3 className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-amber-400 transition-colors">{item[labelKey] || item.title || item.name}</h3>
            {item.isPremium && item.price > 0 && (
              <p className="text-amber-500 text-[11px] font-black uppercase mt-1 flex items-center gap-1.5 py-0.5 px-2 bg-amber-500/10 w-fit">
                ₹{item.price}
              </p>
            )}
            <div className={`flex items-center ${item.isPremium ? 'text-amber-500' : 'text-primary-500'} text-[10px] font-black uppercase tracking-[0.2em] mt-auto pt-5`}>
              {item.isPremium ? 'View Details' : 'Open'} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
            {item.isPremium && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
          </button>
        ))}
      </div>
    )
  );

  const pdfSrc = viewingFile?.fileUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(viewingFile.fileUrl)}&embedded=true`
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 overflow-x-hidden">
      {/* Header + Back + Breadcrumb */}
      {stream && (
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={goBack} className="p-2 text-slate-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="cursor-pointer hover:text-white" onClick={() => { setStream(null); setSubject(null); setCard(null); setChapter(null); setViewingFile(null); }}>Materials</span>
            <ChevronRight className="w-3 h-3" />
            <span className={subject ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setSubject(null); setCard(null); setChapter(null); setViewingFile(null); }}>{stream.name}</span>
            {subject && <><ChevronRight className="w-3 h-3" /><span className={card ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setCard(null); setChapter(null); setViewingFile(null); }}>{subject.name}</span></>}
            {card && <><ChevronRight className="w-3 h-3" /><span className={chapter ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => { setChapter(null); setViewingFile(null); }}>{card.title}</span></>}
            {chapter && <><ChevronRight className="w-3 h-3" /><span className={viewingFile ? 'cursor-pointer hover:text-white' : 'text-white'} onClick={() => setViewingFile(null)}>{chapter.title}</span></>}
            {viewingFile && <><ChevronRight className="w-3 h-3" /><span className="text-white">{viewingFile.title}</span></>}
          </div>
        </div>
      )}

      {loading && <div className="text-center text-slate-400 py-8 text-xs font-bold uppercase tracking-widest">Loading...</div>}

      {/* ── Level: Streams ── */}
      {!stream && !loading && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
              <span className="w-8 h-1 bg-primary-500 mr-3"></span>Materials & Resources
            </h1>
            <p className="text-slate-400 mt-2">Select your stream to explore study materials.</p>
          </div>
          {streams.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No streams available yet</p>
              <p className="text-slate-500 text-xs mt-2">Your instructor hasn't created any streams yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.map(s => (
                <button key={s._id} onClick={() => selectStream(s)}
                  className="group bg-dark-800 p-8 border-l-4 border-l-primary-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 text-left hover:bg-dark-700 transition-all">
                  <BookOpen className="w-10 h-10 text-primary-500 mb-4" />
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">{s.name}</h2>
                  <div className="flex items-center text-primary-500 text-xs font-bold uppercase tracking-widest mt-6">
                    Explore <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Level: Subjects ── */}
      {stream && !subject && !loading && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase">{stream.name} — Select a Subject</h2>
          <CardGrid items={subjects} onSelect={selectSubject} labelKey="name" colorClass="border-l-blue-500" emptyMsg="No subjects created yet" />
        </div>
      )}

      {/* ── Level: Resource Cards ── */}
      {subject && !card && !loading && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase">{subject.name} — Resources</h2>
          <CardGrid items={cards} onSelect={selectCard} labelKey="title" iconKey="icon" colorClass="border-l-amber-500" emptyMsg="No resource cards yet" />
        </div>
      )}

      {/* ── Level: Chapters ── */}
      {card && !chapter && !loading && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase">{card.title} — Chapters</h2>
          <CardGrid items={chapters} onSelect={selectChapter} labelKey="title" colorClass="border-l-green-500" emptyMsg="No chapters yet" />
        </div>
      )}

      {/* ── Level: Files ── */}
      {chapter && !viewingFile && !loading && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase">{chapter.title} — Files</h2>
          {files.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 p-12 text-center">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No files uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(f => (
                <button key={f._id} onClick={() => !f.isLocked && setViewingFile(f)}
                  className={`group bg-dark-800 p-6 border-l-4 ${f.isLocked ? 'border-l-slate-700 bg-dark-900/50 cursor-default' : 'border-l-primary-500 cursor-pointer'} border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 text-left hover:bg-dark-700 transition-all flex flex-col relative`}>
                  {f.isLocked ? <Lock className="w-7 h-7 text-slate-700 mb-3" /> : <FileText className="w-7 h-7 text-primary-500 mb-3" />}
                  <h3 className={`font-bold ${f.isLocked ? 'text-slate-400' : 'text-white'} text-sm uppercase tracking-wide flex items-center gap-2`}>
                    {f.title}
                    {f.isFreePreview && <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 font-black uppercase tracking-tighter shrink-0">Free</span>}
                  </h3>
                  <div className="flex items-center text-primary-500 text-xs font-bold uppercase tracking-widest mt-auto pt-4">
                    {f.isLocked ? 'Unlock to View' : 'View'} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                  {f.isLocked && <div className="absolute top-2 right-2"><Lock className="w-3.5 h-3.5 text-slate-500" /></div>}
                </button>
              ))}
            </div>
          )}
          
          {/* Purchase Banner */}
          {cardMeta.isPremium && !cardMeta.hasPurchased && (
            <div className="mt-8 bg-amber-500/5 border border-amber-500/20 p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Unlock Full Access</h3>
              <p className="text-slate-400 text-sm max-w-md mb-6 font-bold">
                This subject involves premium handwritten notes. Purchase access to unlock all chapters and files for <span className="text-amber-500">₹{cardMeta.price}</span>.
              </p>
              <button 
                onClick={purchaseResource}
                disabled={purchasing}
                className="bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-sm tracking-widest px-8 py-4 transition-all flex items-center gap-2 disabled:opacity-50">
                {purchasing ? 'Unlocking...' : <>Unlock for ₹{cardMeta.price}</>}
              </button>
              <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">One-time payment for lifetime access</p>
            </div>
          )}
        </div>
      )}

      {/* ── PDF Viewer ── */}
      {viewingFile && !isFullscreen && (
        <div className="bg-dark-800 border border-dark-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
            <h2 className="text-sm font-black text-white uppercase tracking-wide truncate pr-4">{viewingFile.title}</h2>
            <button onClick={() => setIsFullscreen(true)} title="Fullscreen"
              className="p-2 text-slate-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors shrink-0">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          {viewingFile.fileType === 'link' ? (
            <div className="p-6">
              <a href={viewingFile.fileUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-primary-600 transition-colors">
                <FileText className="w-4 h-4" /> Open Resource
              </a>
            </div>
          ) : (
            <div className="w-full overflow-hidden" style={{ touchAction: 'pan-y pinch-zoom' }}>
              <iframe src={pdfSrc} title={viewingFile.title}
                className="w-full border-0 block"
                style={{ height: 'min(82vh, calc(100vw * 1.41))', display: 'block', maxWidth: '100%' }}
                scrolling="no" />
            </div>
          )}
        </div>
      )}

      {/* ── Fullscreen overlay ── */}
      {viewingFile && isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-dark-900 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 shrink-0">
            <h2 className="text-sm font-black text-white uppercase tracking-wide truncate pr-4">{viewingFile.title}</h2>
            <button onClick={() => setIsFullscreen(false)}
              className="p-2 text-slate-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors shrink-0">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
          <iframe src={pdfSrc} title={viewingFile.title} className="flex-1 w-full border-0" />
        </div>
      )}
    </div>
  );
}

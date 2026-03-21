import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { BookMarked, Trash2, ExternalLink, Layers, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { customToast } from '../../utils/toast';

const StudentBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // All, Question, Flashcard
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const response = await studentService.getBookmarks(filter !== 'All' ? { itemType: filter } : {});
        setBookmarks(response.data.bookmarks);
      } catch {
        setError('Failed to load bookmarks.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [filter]);

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await studentService.removeBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
    } catch {
      customToast.error('Failed to remove bookmark.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
            <span className="w-8 h-1 bg-primary-500 mr-3"></span>
            My Bookmarks
          </h1>
          <p className="text-slate-200 font-medium tracking-wide mt-2">Review your saved questions and flashcards.</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 bg-dark-900 border border-dark-700 p-1">
          {['All', 'Question', 'Flashcard'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                filter === type
                  ? 'bg-dark-800 text-white border border-dark-600'
                  : 'text-slate-300 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 font-medium text-sm tracking-wide">{error}</div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-dark-800 p-12 text-center border border-dark-700 shadow-sm mt-8">
          <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No bookmarks found</h3>
          <p className="text-slate-200 font-medium">
            {filter !== 'All' ? `You haven't bookmarked any ${filter.toLowerCase()}s.` : "Save items while studying to review them here later."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => {
            const isQuestion = bookmark.itemType === 'Question';
            const item = bookmark.itemId; // The populated question or flashcard

            return (
              <div key={bookmark._id} className="bg-dark-800 p-6 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 flex flex-col group hover:bg-dark-800/80 transition-colors border-l-4 border-l-primary-500">
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 border ${isQuestion ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-primary-500/10 text-primary-500 border-primary-500/20'}`}>
                      {isQuestion ? <HelpCircle className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      {bookmark.itemType}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveBookmark(bookmark._id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-dark-900 border border-transparent hover:border-red-500/20 transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 mb-8">
                  {/* Content Preview */}
                  {item ? (
                    <>
                      <div className="mb-4">
                         <span className="inline-block px-2 py-1 bg-dark-900 border border-dark-700 text-slate-300 text-xs font-bold uppercase tracking-widest">
                           {item.subject}
                         </span>
                      </div>
                      <p className="text-slate-300 font-medium line-clamp-4 leading-relaxed">
                        {isQuestion ? item.questionText : `"${item.quote}"`}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-300 italic font-medium">This item is no longer available.</p>
                  )}
                </div>

                {isQuestion && item && (
                   <Link 
                     to={`/dashboard/materials`} // Could route to a specific view later
                     className="w-full flex items-center justify-center space-x-2 py-3 bg-dark-900 hover:bg-dark-700 text-white border border-dark-600 transition-colors text-xs font-bold uppercase tracking-widest mt-auto"
                   >
                     <span>Review Question</span>
                     <ExternalLink className="w-4 h-4" />
                   </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentBookmarks;

import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { BookMarked, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import toast from 'not-a-toast';
import 'not-a-toast/style.css';

const StudentFlashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    const fetchFlashcards = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (subject) filters.subject = subject;
        if (difficulty) filters.difficulty = difficulty;

        const response = await studentService.getFlashcards(filters);
        setFlashcards(response.data.flashcards);
        setCurrentIndex(0); // Reset to first card on new fetch
      } catch {
        // Silently handle error or show a toast
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [subject, difficulty]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentCard = flashcards[currentIndex];

  const handleBookmark = async () => {
    try {
      if (!currentCard) return;
      await studentService.bookmarkItem({ itemType: 'Flashcard', itemId: currentCard._id });
      toast({
        message: 'Flashcard bookmarked successfully!',
        iconType: 'success',
        background: '#1f2937', // dark-800
        color: '#f97316', // primary-500
        border: '1px solid #374151', // dark-700
      });
    } catch {
      toast({
        message: 'Failed to bookmark or already bookmarked.',
        iconType: 'error',
        background: '#1f2937',
        color: '#f87171', // red-400
        border: '1px solid #374151',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase flex items-center tracking-tight">
            <span className="w-8 h-1 bg-primary-500 mr-3"></span>
            Flashcards
          </h1>
          <p className="text-slate-200 font-medium tracking-wide mt-2">Quick revision cards for active recall.</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 transition-colors text-white font-bold text-xs uppercase tracking-widest"
          >
            <option value="">All Subjects</option>
            <option value="biology">Biology</option>
            <option value="chemistry">Chemistry</option>
            <option value="physics">Physics</option>
            <option value="maths">Maths</option>
          </select>

          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-3 bg-dark-900 border border-dark-700 focus:outline-none focus:border-primary-500 transition-colors text-white font-bold text-xs uppercase tracking-widest"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>
      ) : flashcards.length === 0 ? (
        <div className="bg-dark-800 p-12 text-center border border-dark-700 shadow-sm mt-8">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No flashcards found</h3>
          <p className="text-slate-200 font-medium">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Progress */}
          <div className="text-sm font-bold text-slate-300 mb-6 font-mono tracking-widest bg-dark-800 px-4 py-2 border border-dark-700">
             {currentIndex + 1} / {flashcards.length}
          </div>

          {/* Flashcard Component */}
          <div className="relative w-full max-w-2xl aspect-[3/2] perspective-1000 group mt-4">
            <div className="w-full h-full relative transition-all duration-500 preserve-3d cursor-pointer">
              
              {/* Card Face */}
              <div className="absolute inset-0 w-full h-full bg-dark-800 p-8 md:p-12 shadow-2xl border-l-4 border-l-primary-500 border-t border-t-dark-700 border-r border-r-dark-700 border-b border-b-dark-700 flex flex-col justify-center items-center text-center">
                
                {/* Decorative Top Left */}
                <div className="absolute top-6 left-6">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                    {currentCard.subject}
                  </span>
                </div>

                {/* Decorative Top Right */}
                <div className="absolute top-6 right-6 flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${
                    currentCard.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    currentCard.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {currentCard.difficulty || 'medium'}
                  </span>
                </div>

                <div className="w-16 h-1 bg-primary-500 mb-8 mt-4"></div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                  "{currentCard.quote}"
                </h2>
                
                {currentCard.chapter && (
                  <p className="absolute bottom-6 text-xs text-slate-300 font-bold tracking-widest uppercase">
                    Chapter: {currentCard.chapter}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6 mt-10">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-4 transition-all ${
                currentIndex === 0 
                ? 'bg-dark-900 text-dark-700 border border-dark-800 cursor-not-allowed' 
                : 'bg-dark-800 text-white hover:bg-dark-700 border border-dark-700'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
               onClick={handleBookmark}
               className="flex items-center space-x-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white transition-colors font-bold text-sm uppercase tracking-widest"
            >
              <BookMarked className="w-5 h-5" />
              <span>Bookmark</span>
            </button>

            <button 
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className={`p-4 transition-all ${
                currentIndex === flashcards.length - 1 
                ? 'bg-dark-900 text-dark-700 border border-dark-800 cursor-not-allowed' 
                : 'bg-dark-800 text-white hover:bg-dark-700 border border-dark-700'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFlashcards;

import React, { useState, useMemo, useEffect } from 'react';
import { VideoItem } from '../types';

interface FloatingReviewHubProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (rating: number, text: string) => void;
  initialTab?: 'Read' | 'Write';
}

const FloatingReviewHub: React.FC<FloatingReviewHubProps> = ({ video, isOpen, onClose, onSubmitReview, initialTab = 'Read' }) => {
  const [activeTab, setActiveTab] = useState<'Read' | 'Write'>(initialTab);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const approvedReviews = useMemo(() => {
    return (video.reviews || [])
      .filter(r => r.isApproved)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [video]);

  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setRating(0);
      setText('');
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Auto-close success window after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }
    if (!text.trim()) {
      alert("Please enter review text.");
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmitReview(rating, text);
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full animate-fade-in pointer-events-auto mt-4">
      <div className="bg-[#0f172a]/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group ring-1 ring-white/5">
        <div className="relative z-10 w-full">
          {showSuccess ? (
            <div className="py-12 text-center animate-fade-in flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <i className="fa-solid fa-check text-purple-500 text-3xl"></i>
              </div>
              <h3 className="text-white text-[16px] font-black uppercase tracking-[0.4em] mb-3">Transmission Received</h3>
              <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-8 animate-pulse">Pending Administrator Authorization</p>
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[9px] font-black text-purple-300 uppercase tracking-widest hover:text-white hover:bg-purple-500/20 transition-all"
              >
                Return to Feed
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setActiveTab('Read')} 
                    className={`text-[11px] font-black uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${activeTab === 'Read' ? 'text-white border-purple-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                  >
                    READ REVIEWS ({approvedReviews.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('Write')} 
                    className={`text-[11px] font-black uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${activeTab === 'Write' ? 'text-white border-purple-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                  >
                    WRITE REVIEW
                  </button>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {activeTab === 'Write' ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex justify-center gap-4 py-3 bg-slate-950/40 rounded-2xl border border-white/5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button"
                        onClick={() => setRating(star)} 
                        className="transition-transform hover:scale-125 focus:outline-none"
                      >
                        <i className={`fa-solid fa-star text-2xl ${star <= rating ? 'text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]' : 'text-slate-800'}`}></i>
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <textarea
                      autoFocus
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Record your neural impression..."
                      className="w-full h-32 bg-slate-950/80 border border-white/10 rounded-[1.5rem] p-6 text-[12px] text-slate-300 placeholder-slate-700 focus:outline-none focus:border-purple-500/50 resize-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all border shadow-xl ${
                      isSubmitting 
                        ? 'bg-purple-600/20 text-purple-400 border-purple-500/20 cursor-wait' 
                        : 'bg-purple-600 text-white border-purple-400 hover:bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]'
                    }`}
                  >
                    {isSubmitting ? 'UPLOADING...' : 'Finalize Transmission'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                  {approvedReviews.length === 0 ? (
                    <div className="py-20 text-center text-slate-700">
                      <i className="fa-solid fa-satellite-dish text-5xl mb-6 opacity-10"></i>
                      <p className="text-[12px] font-black uppercase tracking-[0.4em]">No approved signals detected.</p>
                      <button onClick={() => setActiveTab('Write')} className="mt-4 text-[10px] text-purple-500 font-bold uppercase tracking-widest border-b border-purple-500/20 pb-1">Submit your impression</button>
                    </div>
                  ) : (
                    approvedReviews.map((review) => (
                      <div key={review.id} className="p-6 rounded-[2rem] bg-slate-950/40 border border-white/5 flex flex-col gap-3 shadow-sm hover:border-purple-500/20 transition-all">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-purple-500 tracking-[0.2em] uppercase">TRANSMISSION::{review.user}</span>
                          <div className="flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <i key={s} className={`fa-solid fa-star text-[11px] ${s <= review.rating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-slate-800'}`}></i>
                            ))}
                          </div>
                        </div>
                        <p className="text-[13px] text-slate-300 italic leading-relaxed border-l-2 border-purple-500/40 pl-5 py-2">
                          "{review.text}"
                        </p>
                        <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest text-right">
                          AUTHENTICATED_STAMP::{new Date(review.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingReviewHub;
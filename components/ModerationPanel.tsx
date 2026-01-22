import React, { useMemo } from 'react';
import { VideoItem, Review } from '../types';

interface ModerationPanelProps {
  videos: VideoItem[];
  onApprove: (videoId: string, reviewId: string) => void;
  onReject: (videoId: string, reviewId: string) => void;
  onClose: () => void;
}

interface PendingReview extends Review {
  videoTitle: string;
  videoId: string;
}

const ModerationPanel: React.FC<ModerationPanelProps> = ({ videos, onApprove, onReject, onClose }) => {
  const pendingReviews = useMemo(() => {
    const list: PendingReview[] = [];
    videos.forEach(v => {
      (v.reviews || []).forEach(r => {
        if (!r.isApproved) {
          list.push({ ...r, videoTitle: v.prompt, videoId: v.id });
        }
      });
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [videos]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="w-full max-w-4xl bg-[#0f172a]/95 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto animate-fade-in h-[85vh]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <i className="fa-solid fa-shield-halved text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Admin Review Console</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Intercepting Neural Transmissions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Queue Length</span>
              <span className="text-lg font-black text-purple-400">{pendingReviews.length} Pending</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {pendingReviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-6">
                <i className="fa-solid fa-inbox text-4xl text-slate-700"></i>
              </div>
              <h3 className="text-lg font-black uppercase tracking-[0.3em] text-slate-500">Inbox Clear</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-2">All signals have been processed.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingReviews.map((review) => (
                <div 
                  key={review.id} 
                  className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-2 py-1 bg-purple-500/10 rounded-lg">
                        USER::{review.user}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <i key={s} className={`fa-solid fa-star text-[9px] ${s <= review.rating ? 'text-amber-400' : 'text-slate-800'}`}></i>
                        ))}
                      </div>
                      <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                        {new Date(review.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Target Signal:</span>
                      <p className="text-[10px] font-black text-white uppercase italic">{review.videoTitle}</p>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed border-l-2 border-purple-500/30 pl-4 py-1">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="flex gap-3 shrink-0">
                    <button 
                      onClick={() => onReject(review.videoId, review.id)}
                      className="px-5 py-3 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Purge Data
                    </button>
                    <button 
                      onClick={() => onApprove(review.videoId, review.id)}
                      className="px-6 py-3 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                    >
                      Authorize Stream
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-black/40 border-t border-white/5 shrink-0 flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-[0.5em]">
          <span>Integrated Neural Moderation v2.4</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModerationPanel;
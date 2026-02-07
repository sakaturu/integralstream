import React, { useMemo } from 'react';
import { VideoItem, Review, VideoCategory } from '../types';
import { LIBRARY_VERSION } from '../services/sampleData';

interface ModerationPanelProps {
  videos: VideoItem[];
  categories: VideoCategory[];
  categoryColors: Record<string, string>;
  onApprove: (videoId: string, reviewId: string) => void;
  onReject: (videoId: string, reviewId: string) => void;
  onResetStats?: () => void;
  onResetToSource?: () => void;
  onClose: () => void;
}

interface PendingReview extends Review {
  videoTitle: string;
  videoId: string;
}

const ModerationPanel: React.FC<ModerationPanelProps> = ({ 
  videos, 
  onApprove, 
  onReject, 
  onResetStats, 
  onResetToSource,
  onClose
}) => {
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

  const [confirmReset, setConfirmReset] = React.useState(false);

  const handleResetToSource = () => {
    if (confirmReset) {
      onResetToSource?.();
      setConfirmReset(false);
      onClose();
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <div className="w-full animate-fade-in mt-4">
      <div className="bg-[#0f172a]/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ring-1 ring-white/5 max-h-[700px]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-600/20 border border-purple-500/40 text-purple-400">
              <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>
            <div>
              <h2 className="text-[12px] font-black text-white uppercase tracking-tighter">Moderation Terminal</h2>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Pending User Submissions</p>
            </div>
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <div className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest bg-purple-600 text-white shadow-lg">
              Queue ({pendingReviews.length})
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {pendingReviews.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-4">
                <i className="fa-solid fa-inbox text-2xl text-slate-700"></i>
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Queue Purged</h3>
              <div className="mt-8 pt-8 border-t border-white/5 w-full flex flex-col items-center gap-4">
                <button 
                  onClick={handleResetToSource}
                  className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${confirmReset ? 'bg-red-600 text-white animate-pulse' : 'text-slate-500 hover:text-red-500 hover:bg-red-500/5'}`}
                >
                  {confirmReset ? 'Confirm Factory Reset?' : 'Factory Reset Library'}
                </button>
                {confirmReset && (
                  <button onClick={() => setConfirmReset(false)} className="text-[7px] text-slate-600 uppercase font-black hover:text-white">Cancel</button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingReviews.map((review) => (
                <div key={review.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-1.5 py-0.5 bg-purple-500/10 rounded-md">USER::{review.user}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <i key={s} className={`fa-solid fa-star text-[8px] ${s <= review.rating ? 'text-amber-500' : 'text-slate-800'}`}></i>
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] font-black text-white uppercase italic truncate max-w-xs">{review.videoTitle}</p>
                    <p className="text-[10px] text-slate-400 border-l-2 border-purple-500/30 pl-3 py-0.5 italic">"{review.text}"</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => onReject(review.videoId, review.id)} className="px-4 py-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-[8px] font-black uppercase tracking-widest transition-all">Reject</button>
                    <button onClick={() => onApprove(review.videoId, review.id)} className="px-4 py-2 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500 text-[8px] font-black uppercase tracking-widest transition-all">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-black/40 border-t border-white/5 shrink-0 flex items-center justify-between text-[7px] font-black text-slate-600 uppercase tracking-[0.5em]">
          <span>IntegralStream Terminal v2.9</span>
          <span className="flex items-center gap-2">
            Library v{LIBRARY_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModerationPanel;
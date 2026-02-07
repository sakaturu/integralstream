import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VideoItem, VideoCategory } from './types';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './Playlist';
import LoginGate from './components/LoginGate';
import VaultGallery from './components/VaultGallery';
import FloatingReviewHub from './components/FloatingReviewHub';
import ModerationPanel from './components/ModerationPanel';
import GenerationModal from './components/GenerationModal';
import { getSampleLibrary, getSurpriseVideo } from './services/sampleData';

const DATA_KEY = 'integral_v412_vault';
const AUTH_KEY = 'integral_v411_auth';
const CAT_KEY = 'integral_v412_categories';
const CAT_COLORS_KEY = 'integral_v412_cat_colors';
const ADMIN_PASSWORD = 'ADMIN';

const DEFAULT_CAT_COLORS: Record<string, string> = {
  'Meditation': '#10b981',
  'Tribal': '#94a3b8',
  'Dance': '#8b5cf6',
  'Integral Serenity': '#38bdf8',
  'Permia Community': '#facc15',
  'Other': '#64748b'
};

const IntegralLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 transition-transform duration-1000 ease-in-out hover:rotate-[360deg]">
    <path d="M50 5 C58 20 58 40 50 52 C42 40 42 20 50 5Z" fill="#0071ce" />
    <path d="M28 25 C12 30 12 50 28 60 C36 50 36 30 28 25Z" fill="#e41e26" transform="rotate(-15, 28, 42.5)" />
    <path d="M72 25 C88 30 88 50 72 60 C64 50 64 30 72 25Z" fill="#f4821f" transform="rotate(15, 72, 42.5)" />
    <circle cx="50" cy="78" r="11" fill="#7c7c7c" />
    <path d="M15 55 C15 85 40 95 50 95" fill="none" stroke="#0099d8" strokeWidth="7" strokeLinecap="round" />
    <path d="M85 55 C85 85 60 95 50 95" fill="none" stroke="#7c7c7c" strokeWidth="7" strokeLinecap="round" />
  </svg>
);

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => localStorage.getItem(AUTH_KEY) === 'true');
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [activeSecondaryView, setActiveSecondaryView] = useState<'none' | 'reviews' | 'vault' | 'moderation'>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlistTab, setPlaylistTab] = useState<VideoCategory | 'All' | 'Vault'>('All');
  const [isCopyingCode, setIsCopyingCode] = useState(false);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<VideoCategory[]>(() => {
    const saved = localStorage.getItem(CAT_KEY);
    if (saved) return JSON.parse(saved);
    return ['Meditation', 'Tribal', 'Dance', 'Integral Serenity', 'Permia Community', 'Other'];
  });

  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(CAT_COLORS_KEY);
    if (saved) return JSON.parse(saved);
    return DEFAULT_CAT_COLORS;
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : getSampleLibrary();
      } catch (e) {
        return getSampleLibrary();
      }
    }
    return getSampleLibrary();
  });

  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(videos[0]?.id);

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(videos));
    localStorage.setItem(AUTH_KEY, isAuthorized ? 'true' : 'false');
    localStorage.setItem(CAT_KEY, JSON.stringify(categories));
    localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(categoryColors));
  }, [videos, isAuthorized, categories, categoryColors]);

  const handleCopyArchive = useCallback(() => {
    const json = JSON.stringify(videos, null, 2);
    navigator.clipboard.writeText(json);
    setIsCopyingCode(true);
    setTimeout(() => setIsCopyingCode(false), 2000);
  }, [videos]);

  const pendingReviewsCount = useMemo(() => {
    return videos.reduce((acc, v) => acc + (v.reviews?.filter(r => !r.isApproved).length || 0), 0);
  }, [videos]);

  const vaultCount = useMemo(() => {
    return videos.filter(v => v.isFavorite).length;
  }, [videos]);

  const handleRemoveVideo = useCallback((id: string) => {
    setVideos(prev => {
      const filtered = prev.filter(v => v.id !== id);
      if (currentVideoId === id) {
        setCurrentVideoId(filtered.length > 0 ? filtered[0].id : undefined);
      }
      return filtered;
    });
  }, [currentVideoId]);

  const handlePurgeAll = useCallback(() => {
    setVideos([]);
    setCurrentVideoId(undefined);
    setIsPlaying(false);
    setActiveSecondaryView('none');
  }, []);

  const handleResetStats = useCallback(() => {
    setVideos(prev => prev.map(v => ({
      ...v,
      viewCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      isLiked: false,
      isDisliked: false
    })));
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, isFavorite: !v.isFavorite } : v));
  }, []);

  const handleToggleLike = useCallback((id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { 
      ...v, 
      isLiked: !v.isLiked, 
      likeCount: v.isLiked ? v.likeCount - 1 : v.likeCount + 1,
      isDisliked: v.isLiked ? v.isDisliked : false,
      dislikeCount: (v.isLiked || !v.isDisliked) ? v.dislikeCount : v.dislikeCount - 1
    } : v));
  }, []);

  const handleToggleDislike = useCallback((id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { 
      ...v, 
      isDisliked: !v.isDisliked, 
      dislikeCount: v.isDisliked ? v.dislikeCount - 1 : v.dislikeCount + 1,
      isLiked: v.isDisliked ? v.isLiked : false,
      likeCount: (v.isDisliked || !v.isLiked) ? v.likeCount : v.likeCount - 1
    } : v));
  }, []);

  const handleIncrementView = useCallback((id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, viewCount: v.viewCount + 1 } : v));
  }, []);

  const handleSelectVideo = useCallback((v: VideoItem) => {
    if (currentVideoId === v.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentVideoId(v.id);
      setIsPlaying(true);
    }
  }, [currentVideoId]);

  const handleAddCategory = (name: string) => {
    if (!categories.includes(name)) {
      setCategories(prev => [...prev, name]);
      const color = categoryColors['Other'] || '#64748b';
      setCategoryColors(prev => ({ ...prev, [name]: color }));
    }
  };

  const handleRemoveCategory = (name: string) => {
    setCategories(prev => prev.filter(c => c !== name));
    if (playlistTab === name) setPlaylistTab('All');
  };

  const handleUpdateCategoryColor = (category: string, color: string) => {
    setCategoryColors(prev => ({ ...prev, [category]: color }));
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleGenerationStart = useCallback((prompt: string, category: VideoCategory) => {
    const id = `gen-${Date.now()}`;
    const newVideo: VideoItem = {
      id, prompt, category, url: '', status: 'generating', timestamp: Date.now(),
      viewCount: 0, likeCount: 0, dislikeCount: 0, rating: 0, isFavorite: false,
      isLiked: false, isDisliked: false, progress: 'Initializing Synthesis...'
    };
    setVideos(prev => [newVideo, ...prev]);
    setCurrentVideoId(id);
    return id;
  }, []);

  const handleGenerationUpdate = useCallback((id: string, progress: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, progress } : v));
  }, []);

  const handleGenerationComplete = useCallback((id: string, url: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, url, status: 'ready', progress: undefined } : v));
    setIsPlaying(true);
  }, []);

  const handleGenerationFail = useCallback((id: string, error: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'error', progress: error } : v));
  }, []);

  const currentVideo = useMemo(() => videos.find(v => v.id === currentVideoId) || null, [videos, currentVideoId]);

  const stableViewIncrement = useCallback(() => {
    if (currentVideoId) handleIncrementView(currentVideoId);
  }, [currentVideoId, handleIncrementView]);

  const getCategoryStyles = (category: VideoCategory) => {
    const color = categoryColors[category] || '#64748b';
    return {
      color: color,
      border: `1px solid ${color}4D`,
      background: `${color}1A`,
    };
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      <header className="h-20 border-b border-white/5 bg-[#050a18]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveSecondaryView('none')}>
          <IntegralLogo />
          <div className="flex flex-col">
            <h1 className="font-black text-xl uppercase tracking-tighter leading-none text-blue-500">IntegralStream</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">serenity library</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          {isAuthorized && (
            <button 
              onClick={() => setActiveSecondaryView(p => p === 'moderation' ? 'none' : 'moderation')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all relative cursor-pointer ${activeSecondaryView === 'moderation' ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-purple-400'}`}
            >
              <i className="fa-solid fa-shield-check text-lg"></i>
              {pendingReviewsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-[#050a18] shadow-lg">
                  {pendingReviewsCount}
                </span>
              )}
            </button>
          )}

          <button 
            onClick={() => isAuthorized ? setIsAuthorized(false) : setShowLoginOverlay(true)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${isAuthorized ? 'bg-blue-600/10 border-blue-500/30 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
          >
            <i className={`fa-solid ${isAuthorized ? 'fa-user-check' : 'fa-user-lock'}`}></i>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[420px] flex-shrink-0 border-r border-white/5 bg-[#030814] overflow-y-auto custom-scrollbar">
          <Playlist 
            videos={videos}
            categories={categories}
            categoryColors={categoryColors}
            currentVideo={currentVideo}
            onSelect={handleSelectVideo}
            onRemove={handleRemoveVideo} 
            onToggleFavorite={handleToggleFavorite}
            onAddRandom={() => { const v = getSurpriseVideo(); setVideos(p => [v, ...p]); setCurrentVideoId(v.id); }}
            onAddManualVideo={(u, p, c) => {
              const nv: VideoItem = { id: `m-${Date.now()}`, url: u, prompt: p, category: c, isFavorite: false, viewCount: 0, likeCount: 0, dislikeCount: 0, status: 'ready', timestamp: Date.now(), rating: 0, isLiked: false, isDisliked: false, reviews: [] };
              setVideos(prev => [nv, ...prev]);
              setCurrentVideoId(nv.id);
            }}
            onMoveVideo={() => {}}
            onPurgeAll={handlePurgeAll}
            activeTab={playlistTab}
            setActiveTab={setPlaylistTab}
            isAuthorized={isAuthorized} 
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onUpdateCategoryColor={handleUpdateCategoryColor}
          />
        </aside>

        <section className="flex-1 flex flex-col bg-[#020617] overflow-y-auto custom-scrollbar">
          <div className="w-full flex flex-col pt-8 gap-0">
            <div className="flex items-center justify-between px-8 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-blue-400 font-black uppercase text-[10px] tracking-[0.4em] italic flex items-center gap-3">
                  <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></span>
                  {currentVideo ? "Active Mission Stream" : "System Standby"}
                </h2>
                {isAuthorized && (
                  <button 
                    onClick={() => setShowGenerator(true)}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 transition-all cursor-pointer border border-blue-400/50"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                  </button>
                )}
              </div>

              <button 
                onClick={handleCopyArchive}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  isCopyingCode 
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400' 
                  : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                }`}
              >
                <i className={`fa-solid ${isCopyingCode ? 'fa-circle-check animate-bounce' : 'fa-code'}`}></i>
                {isCopyingCode ? 'Code Copied' : 'Copy Code'}
              </button>
            </div>

            <div className="px-8 w-full" ref={playerContainerRef}>
               <div className="w-full aspect-video bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
                {currentVideo && currentVideo.status === 'ready' ? (
                  <VideoPlayer 
                    key={currentVideo.id} 
                    video={currentVideo} 
                    isPlaying={isPlaying} 
                    onPlayStateChange={setIsPlaying}
                    onToggleLike={() => handleToggleLike(currentVideo.id)}
                    onToggleDislike={() => handleToggleDislike(currentVideo.id)}
                    onToggleFavorite={() => handleToggleFavorite(currentVideo.id)}
                    onViewIncrement={stableViewIncrement}
                  />
                ) : currentVideo && currentVideo.status === 'generating' ? (
                  <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-blue-500 uppercase font-black text-xs gap-6 p-12">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                      <i className="fa-solid fa-atom absolute inset-0 flex items-center justify-center text-3xl animate-pulse"></i>
                    </div>
                    <p className="tracking-[0.5em]">{currentVideo.progress}</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-800 uppercase font-black text-xs gap-4 bg-slate-950">
                    <i className="fa-solid fa-satellite fa-3x animate-pulse"></i>
                    Signal Offline
                  </div>
                )}
              </div>
            </div>

            {currentVideo && (
              <div className="w-full animate-fade-in mt-6">
                <div className="bg-[#0f172a]/60 backdrop-blur-xl border-y border-white/5 flex items-center justify-between px-8 py-4 w-full">
                  <div className="flex items-center gap-4">
                    <span 
                      className="px-3 py-1 border text-[10px] font-black uppercase rounded-full tracking-widest shrink-0"
                      style={getCategoryStyles(currentVideo.category)}
                    >
                      {currentVideo.category}
                    </span>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Viewed::</span>
                        <span className="text-[13px] font-black text-slate-400">{currentVideo.viewCount.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Liked::</span>
                        <span className="text-[13px] font-black text-slate-400">{currentVideo.likeCount.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Disliked::</span>
                        <span className="text-[13px] font-black text-slate-400">{currentVideo.dislikeCount.toLocaleString()}</span>
                      </div>

                      <button 
                        onClick={() => setActiveSecondaryView(v => v === 'reviews' ? 'none' : 'reviews')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-125 flex items-center gap-1.5 cursor-pointer ${activeSecondaryView === 'reviews' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'text-purple-500'}`}
                      >
                        <i className="fa-solid fa-comment-dots text-[11px]"></i>
                        <span>Reviews::</span>
                        <span className="text-[13px] font-black text-slate-400 ml-0.5">{(currentVideo.reviews?.length || 0).toLocaleString()}</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveSecondaryView(v => v === 'vault' ? 'none' : 'vault')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-125 flex items-center gap-1.5 cursor-pointer ${activeSecondaryView === 'vault' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-red-500'}`}
                      >
                        <i className="fa-solid fa-vault text-[11px]"></i>
                        <span>Vault::</span>
                        <span className="text-[13px] font-black text-slate-400 ml-0.5">{vaultCount.toLocaleString()}</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={toggleFullscreen}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group cursor-pointer"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Full Screen</span>
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <i className="fa-solid fa-expand text-[13px]"></i>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="px-8 w-full mt-4 pb-20">
              {activeSecondaryView === 'moderation' && (
                <ModerationPanel 
                  videos={videos} 
                  categories={categories}
                  categoryColors={categoryColors}
                  onApprove={(vidId, revId) => setVideos(p => p.map(v => v.id === vidId ? {...v, reviews: v.reviews?.map(r => r.id === revId ? {...r, isApproved: true} : r)} : v))}
                  onReject={(vidId, revId) => setVideos(p => p.map(v => v.id === vidId ? {...v, reviews: v.reviews?.filter(r => r.id !== revId)} : v))}
                  onResetStats={handleResetStats}
                  onClose={() => setActiveSecondaryView('none')} 
                />
              )}

              {activeSecondaryView === 'vault' && (
                <VaultGallery 
                  videos={videos.filter(v => v.isFavorite)} 
                  categoryColors={categoryColors}
                  currentVideo={currentVideo!} 
                  onSelect={(v) => { setCurrentVideoId(v.id); setActiveSecondaryView('none'); }}
                  onRemove={handleRemoveVideo}
                  onToggleFavorite={handleToggleFavorite}
                  isOpen={true}
                  onClose={() => setActiveSecondaryView('none')}
                  isAuthorized={isAuthorized}
                  onMoveVideo={() => {}}
                />
              )}

              {activeSecondaryView === 'reviews' && currentVideo && (
                <FloatingReviewHub video={currentVideo} isOpen={true} onClose={() => setActiveSecondaryView('none')} onSubmitReview={(r, t) => {
                  const review = { id: `r-${Date.now()}`, rating: r, text: t, user: 'NeuralClient', timestamp: Date.now(), isApproved: false };
                  setVideos(prev => prev.map(v => v.id === currentVideo.id ? { ...v, reviews: [review, ...(v.reviews || [])] } : v));
                }} />
              )}
            </div>
          </div>
        </section>
      </div>

      {showLoginOverlay && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
          <LoginGate onLogin={(p) => { if(p === ADMIN_PASSWORD) { setIsAuthorized(true); setShowLoginOverlay(false); return true; } return false; }} onClose={() => setShowLoginOverlay(false)} />
        </div>
      )}

      {showGenerator && (
        <GenerationModal 
          onClose={() => setShowGenerator(false)}
          onStart={handleGenerationStart}
          onUpdate={handleGenerationUpdate}
          onComplete={handleGenerationComplete}
          onFail={handleGenerationFail}
          categories={categories}
        />
      )}
    </div>
  );
};

export default App;
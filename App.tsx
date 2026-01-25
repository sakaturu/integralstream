import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VideoItem, VideoCategory, Review } from './types';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './components/Playlist';
import FloatingReviewHub from './components/FloatingReviewHub';
import VaultGallery from './components/VaultGallery';
import ModerationPanel from './components/ModerationPanel';
import LoginGate from './components/LoginGate';
import GenerationModal from './components/GenerationModal';
import { getSampleLibrary } from './services/sampleData';

const VAULT_KEY = 'integralstream_vault_v30'; 
const CATEGORIES_KEY = 'integralstream_categories_v30';
const SIDEBAR_WIDTH_KEY = 'integralstream_sidebar_width_v30';
const AUTH_KEY = 'integralstream_auth_session_v30';

const ADMIN_PASSWORD = 'ADMIN';

const DEFAULT_CATEGORIES: VideoCategory[] = [
  'Meditation', 
  'Tribal', 
  'Dance', 
  'Integral Serenity', 
  'Permia Community', 
  'Other'
];

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    const session = localStorage.getItem(AUTH_KEY);
    return session === 'true';
  });
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [showModeration, setShowModeration] = useState(false);

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem(VAULT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn("Vault recovery failed:", e);
      }
    }
    return [];
  });

  const [categories, setCategories] = useState<VideoCategory[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CATEGORIES;
  });

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : 570; 
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(() => videos[0]?.id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<VideoCategory | 'All' | 'Vault'>('All');
  const [hoveredTab, setHoveredTab] = useState<VideoCategory | 'All' | 'Vault' | null>(null);
  const [showQuickVault, setShowQuickVault] = useState(false);

  useEffect(() => {
    localStorage.setItem(VAULT_KEY, JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  const handleLogin = (pass: string, remember: boolean) => {
    if (pass === ADMIN_PASSWORD) {
      setIsAuthorized(true);
      setShowLoginOverlay(false);
      if (remember) localStorage.setItem(AUTH_KEY, 'true');
      else localStorage.removeItem(AUTH_KEY);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthorized(false);
    setShowLoginOverlay(false);
    setShowModeration(false);
  };

  const checkAuth = useCallback(() => {
    if (!isAuthorized) {
      setShowLoginOverlay(true);
      return false;
    }
    return true;
  }, [isAuthorized]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && mainRef.current) {
      const newWidth = e.clientX - mainRef.current.getBoundingClientRect().left;
      if (newWidth >= 300 && newWidth <= 900) setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const vaultedVideos = useMemo(() => videos.filter(v => v.isFavorite), [videos]);

  const filteredVideos = useMemo(() => {
    if (activeTab === 'All') return videos;
    if (activeTab === 'Vault') return vaultedVideos;
    return videos.filter(v => v.category === activeTab);
  }, [videos, vaultedVideos, activeTab]);

  const handleSelectVideo = useCallback((video: VideoItem, forcePlay: boolean = false) => {
    if (currentVideoId === video.id && !forcePlay) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentVideoId(video.id);
      setIsPlaying(true);
      if (currentVideoId !== video.id) {
        setVideos(prev => prev.map(v => 
          v.id === video.id ? { ...v, viewCount: v.viewCount + 1 } : v
        ));
      }
    }
  }, [currentVideoId]);

  const handleVideoEnded = useCallback(() => {
    const currentIndex = filteredVideos.findIndex(v => v.id === currentVideoId);
    if (currentIndex !== -1 && currentIndex < filteredVideos.length - 1) {
      const nextVideo = filteredVideos[currentIndex + 1];
      handleSelectVideo(nextVideo, true);
    } else {
      setIsPlaying(false);
    }
  }, [filteredVideos, currentVideoId, handleSelectVideo]);

  const handleRemoveVideo = useCallback((id: string) => {
    let nextToPlay: VideoItem | undefined;
    if (currentVideoId === id) {
      const currentFiltered = filteredVideos;
      const currentIndex = currentFiltered.findIndex(v => v.id === id);
      if (currentIndex !== -1) {
        if (currentFiltered.length > 1) {
          nextToPlay = currentFiltered[currentIndex + 1] || currentFiltered[currentIndex - 1];
        }
      }
    }
    setVideos(prev => prev.filter(v => v.id !== id));
    if (currentVideoId === id) {
      if (nextToPlay) { setCurrentVideoId(nextToPlay.id); setIsPlaying(true); }
      else { setCurrentVideoId(undefined); setIsPlaying(false); }
    }
  }, [currentVideoId, filteredVideos]);

  const handleMoveVideo = useCallback((id: string, direction: 'up' | 'down') => {
    setVideos(prev => {
      const list = [...prev];
      const idxA = list.findIndex(v => v.id === id);
      if (idxA === -1) return prev;
      const idxB = direction === 'up' ? idxA - 1 : idxA + 1;
      if (idxB < 0 || idxB >= list.length) return prev;
      [list[idxA], list[idxB]] = [list[idxB], list[idxA]];
      return list;
    });
  }, []);

  const handleAddSurprise = useCallback(() => {
    const samples = getSampleLibrary();
    const randomIndex = Math.floor(Math.random() * samples.length);
    const newVideo = { ...samples[randomIndex], id: `sur-${Date.now()}` };
    setVideos(prev => [newVideo, ...prev]);
    handleSelectVideo(newVideo, true);
  }, [handleSelectVideo]);

  const handleToggleFavorite = useCallback((id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, isFavorite: !v.isFavorite } : v));
  }, []);

  const handleToggleLike = useCallback((id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, isLiked: !v.isLiked, isDisliked: false, likeCount: !v.isLiked ? v.likeCount + 1 : Math.max(0, v.likeCount - 1) } : v));
  }, []);

  const handleToggleDislike = useCallback((id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, isDisliked: !v.isDisliked, isLiked: false, likeCount: v.isLiked ? Math.max(0, v.likeCount - 1) : v.likeCount } : v));
  }, []);

  const handleAddReview = useCallback((videoId: string, rating: number, text: string) => {
    const newReview: Review = { id: `rev-${Date.now()}`, rating, text, user: `Node_${Math.floor(Math.random() * 9999)}`, timestamp: Date.now(), isApproved: false };
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, reviews: [newReview, ...(v.reviews || [])] } : v));
  }, []);

  const handleApproveReview = useCallback((videoId: string, reviewId: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, reviews: v.reviews?.map(r => r.id === reviewId ? { ...r, isApproved: true } : r) } : v));
  }, []);

  const handleRejectReview = useCallback((videoId: string, reviewId: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, reviews: v.reviews?.filter(r => r.id !== reviewId) } : v));
  }, []);

  const handleAddManualVideo = useCallback((url: string, prompt: string, category: VideoCategory) => {
    const newVideo: VideoItem = { id: `man-${Date.now()}`, prompt, category, url, timestamp: Date.now(), status: 'ready', viewCount: 0, likeCount: 0, rating: 0, isFavorite: false, isLiked: false, reviews: [] };
    setVideos(prev => [newVideo, ...prev]);
    handleSelectVideo(newVideo, true);
  }, [handleSelectVideo]);

  const handleAddCategory = useCallback((name: string) => {
    if (!categories.includes(name)) setCategories(prev => [...prev, name]);
  }, [categories]);

  const handleToggleFullScreen = () => {
    const player = document.getElementById('v-player-root');
    if (player) {
      if (!document.fullscreenElement) player.requestFullscreen().catch(() => {});
      else document.exitFullscreen();
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const currentVideo = videos.find(v => v.id === currentVideoId) || null;
  const toggleReviews = () => { setIsReviewOpen(!isReviewOpen); if (!isReviewOpen) { setShowQuickVault(false); setShowModeration(false); } };
  const toggleQuickVault = () => { setShowQuickVault(!showQuickVault); if (!showQuickVault) { setIsReviewOpen(false); setShowModeration(false); } };
  const toggleModeration = () => { setShowModeration(!showModeration); if (!showModeration) { setIsReviewOpen(false); setShowQuickVault(false); } };

  return (
    <div className={`min-h-screen flex flex-col bg-[#020617] relative overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      <header className="glass sticky top-0 z-[60] border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 group/header cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-700 group-hover/header:scale-110 p-1.5">
               <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 5 C60 20 60 35 50 50 C40 35 40 20 50 5" fill="#1d4ed8" /><path d="M15 30 C20 40 35 50 45 45 C40 35 25 20 15 30" fill="#dc2626" /><path d="M85 30 C80 40 65 50 55 45 C60 35 75 20 85 30" fill="#ea580c" /><path d="M10 55 C10 90 45 95 50 95" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" /><path d="M90 55 C90 90 55 95 50 95" fill="none" stroke="#64748b" strokeWidth="8" strokeLinecap="round" /><circle cx="50" cy="72" r="12" fill="#64748b" /></svg>
            </div>
            <div><h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">INTEGRALSTREAM</h1><span className="text-[9px] text-blue-500 font-bold uppercase tracking-[0.3em]">SERENITY TERMINAL</span></div>
          </div>
          <div className="flex items-center gap-6">
            {isAuthorized && <button onClick={toggleModeration} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showModeration ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-purple-400 hover:text-white border border-purple-500/20 bg-purple-500/5'}`}>Moderate</button>}
            {isAuthorized ? <button onClick={handleLogout} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">Disconnect</button> : <button onClick={() => setShowLoginOverlay(true)} className="text-[10px] font-black text-blue-500 hover:text-white uppercase tracking-widest transition-all">Admin Entry</button>}
          </div>
        </div>
      </header>
      <main ref={mainRef} className="flex-1 max-w-[1800px] mx-auto w-full px-6 py-10 flex flex-col lg:flex-row gap-0 overflow-hidden relative z-10">
        <aside className="flex flex-col h-[calc(100vh-14rem)] flex-shrink-0 relative group/aside" style={{ width: `${sidebarWidth}px` }}>
          <section className="glass p-5 rounded-[2.5rem] flex-1 min-h-0 flex flex-col shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <Playlist videos={videos} categories={categories} currentVideo={currentVideo} onSelect={handleSelectVideo} onRemove={handleRemoveVideo} onToggleFavorite={handleToggleFavorite} onMoveVideo={handleMoveVideo} onAddRandom={handleAddSurprise} onAddManualVideo={handleAddManualVideo} onAddCategory={handleAddCategory} activeTab={activeTab} setActiveTab={setActiveTab} onHoverTab={setHoveredTab} isAuthorized={isAuthorized} />
          </section>
          <div onMouseDown={startResizing} className={`absolute -right-5 top-0 bottom-0 w-10 flex items-center justify-center cursor-col-resize z-50 transition-all ${isResizing ? 'opacity-100' : 'opacity-0 group-hover/aside:opacity-100'}`}><div className={`w-1 h-20 rounded-full ${isResizing ? 'bg-blue-500 shadow-[0_0_15px_#3b82f6]' : 'bg-white/20'}`}></div></div>
        </aside>
        <div className="flex-1 flex flex-col gap-4 relative overflow-y-auto custom-scrollbar pb-20 pl-10">
          {currentVideo && (
            <div className="animate-fade-in px-2 flex items-center justify-between">
               <h2 className="text-[12px] font-black text-white leading-tight tracking-[0.2em] uppercase italic flex items-center gap-3"><div className="w-1 h-5 rounded-full bg-blue-500 animate-pulse"></div>{currentVideo.prompt}</h2>
               <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">NODE ID: {currentVideo.id.split('-').pop()}</div>
            </div>
          )}
          <VideoPlayer video={currentVideo} isPlaying={isPlaying} onPlayStateChange={setIsPlaying} onEnded={handleVideoEnded} onToggleLike={() => handleToggleLike(currentVideoId!)} onToggleDislike={() => handleToggleDislike(currentVideoId!)} onToggleFavorite={() => handleToggleFavorite(currentVideoId!)} checkpointIndex={filteredVideos.findIndex(v => v.id === currentVideoId)} totalCheckpoints={filteredVideos.length} />
          {currentVideo && (
            <div className="glass p-5 rounded-[2.5rem] animate-fade-in relative shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pr-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl border border-blue-500/20 text-blue-400 bg-blue-500/5 whitespace-nowrap">{currentVideo.category}</span>
                <div className="flex items-center gap-4 px-3 py-2 bg-slate-900/50 rounded-xl border border-white/5 mx-1">
                   <div className="flex items-center gap-1.5"><span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">VIEWS</span><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{formatCount(currentVideo.viewCount)}</span></div>
                   <div className="w-px h-3 bg-white/10"></div>
                   <div className="flex items-center gap-1.5"><span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">LIKES</span><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{formatCount(currentVideo.likeCount)}</span></div>
                </div>
                <button onClick={toggleReviews} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 ${isReviewOpen ? 'bg-purple-600 border-purple-400 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}><span className="text-[10px] font-black uppercase tracking-widest">REVIEWS</span></button>
                <button onClick={toggleQuickVault} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shrink-0 ${showQuickVault ? 'bg-red-600 border-red-400 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}><span className="text-[10px] font-black uppercase tracking-widest">VAULT</span></button>
                <button onClick={handleToggleFullScreen} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all shrink-0 ml-auto"><i className="fa-solid fa-expand text-[10px]"></i><span className="text-[10px] font-black uppercase tracking-widest">FULL SCREEN</span></button>
              </div>
              <FloatingReviewHub video={currentVideo} isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} onSubmitReview={(rating, text) => handleAddReview(currentVideo.id, rating, text)} initialTab="Read" />
              <VaultGallery videos={vaultedVideos} currentVideo={currentVideo} onSelect={handleSelectVideo} isOpen={showQuickVault} onClose={() => setShowQuickVault(false)} onToggleFavorite={handleToggleFavorite} onRemove={handleRemoveVideo} onMoveVideo={handleMoveVideo} isAuthorized={isAuthorized} />
              {showModeration && isAuthorized && <ModerationPanel videos={videos} onApprove={handleApproveReview} onReject={handleRejectReview} onClose={() => setShowModeration(false)} />}
            </div>
          )}
        </div>
      </main>
      {showLoginOverlay && (
        <div 
          onClick={() => setShowLoginOverlay(false)} 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-xl animate-fade-in cursor-pointer"
        >
          <div onClick={(e) => e.stopPropagation()} className="cursor-default">
            <LoginGate onLogin={handleLogin} onForget={handleLogout} onClose={() => setShowLoginOverlay(false)} />
          </div>
        </div>
      )}
      <footer className="h-8 glass border-t border-white/5 px-6 flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] z-[70]"><div><span>Connection: Secure</span><span className="text-emerald-500 ml-4">Node Status: Active</span></div><span>IntegralStream OS v5.4.3</span></footer>
    </div>
  );
};

export default App;

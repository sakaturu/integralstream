import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VideoItem, VideoCategory, Review } from './types';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './components/Playlist';
import FloatingReviewHub from './components/FloatingReviewHub';
import { getSampleLibrary } from './services/sampleData';

const VAULT_KEY = 'integralstream_vault_v15'; 
const CATEGORIES_KEY = 'integralstream_categories_v2';
const SIDEBAR_WIDTH_KEY = 'integralstream_sidebar_width';

const DEFAULT_CATEGORIES: VideoCategory[] = [
  'Meditation', 
  'Tribal', 
  'Dance', 
  'Integral Serenity', 
  'Permia Community', 
  'Other'
];

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(VAULT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Vault recovery failed:", e);
    }
    return getSampleLibrary();
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
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      if (newWidth >= 300 && newWidth <= 900) {
        setSidebarWidth(newWidth);
      }
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

  const handleSelectVideo = useCallback((video: VideoItem) => {
    if (currentVideoId === video.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentVideoId(video.id);
      setIsPlaying(true);
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, viewCount: v.viewCount + 1 } : v
      ));
    }
  }, [currentVideoId]);

  const handleVideoEnded = useCallback(() => {
    const currentIndex = filteredVideos.findIndex(v => v.id === currentVideoId);
    if (currentIndex !== -1 && currentIndex < filteredVideos.length - 1) {
      const nextVideo = filteredVideos[currentIndex + 1];
      handleSelectVideo(nextVideo);
    } else {
      setIsPlaying(false);
    }
  }, [filteredVideos, currentVideoId, handleSelectVideo]);

  const handleRemoveVideo = useCallback((id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    if (currentVideoId === id) {
      setCurrentVideoId(undefined);
      setIsPlaying(false);
    }
  }, [currentVideoId]);

  const handleMoveVideo = useCallback((id: string, direction: 'up' | 'down') => {
    setVideos(prev => {
      const viewList = filteredVideos;
      const viewIndex = viewList.findIndex(v => v.id === id);
      if (viewIndex === -1) return prev;
      let neighborId: string | undefined;
      if (direction === 'up' && viewIndex > 0) neighborId = viewList[viewIndex - 1].id;
      else if (direction === 'down' && viewIndex < viewList.length - 1) neighborId = viewList[viewIndex + 1].id;
      if (!neighborId) return prev;
      const masterList = [...prev];
      const idxA = masterList.findIndex(v => v.id === id);
      const idxB = masterList.findIndex(v => v.id === neighborId);
      if (idxA !== -1 && idxB !== -1) [masterList[idxA], masterList[idxB]] = [masterList[idxB], masterList[idxA]];
      return masterList;
    });
  }, [filteredVideos]);

  const handleMoveVaultedVideo = useCallback((id: string, direction: 'up' | 'down') => {
    setVideos(prev => {
      const list = vaultedVideos;
      const viewIdx = list.findIndex(v => v.id === id);
      if (viewIdx === -1) return prev;
      let targetId: string | undefined;
      if (direction === 'up' && viewIdx > 0) targetId = list[viewIdx - 1].id;
      else if (direction === 'down' && viewIdx < list.length - 1) targetId = list[viewIdx + 1].id;
      if (!targetId) return prev;
      const master = [...prev];
      const idxA = master.findIndex(v => v.id === id);
      const idxB = master.findIndex(v => v.id === targetId);
      [master[idxA], master[idxB]] = [master[idxB], master[idxA]];
      return master;
    });
  }, [vaultedVideos]);

  const handleShuffleVault = useCallback(() => {
    if (vaultedVideos.length === 0) return;
    const randomIndex = Math.floor(Math.random() * vaultedVideos.length);
    const randomVideo = vaultedVideos[randomIndex];
    handleSelectVideo(randomVideo);
  }, [vaultedVideos, handleSelectVideo]);

  const handleAddSurprise = useCallback(() => {
    if (videos.length === 0) return;
    const randomIndex = Math.floor(Math.random() * videos.length);
    const randomVideo = videos[randomIndex];
    handleSelectVideo(randomVideo);
  }, [videos, handleSelectVideo]);

  const handleToggleFavorite = useCallback((id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, isFavorite: !v.isFavorite } : v));
  }, []);

  const handleToggleLike = useCallback((id: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === id) {
        const newIsLiked = !v.isLiked;
        return { ...v, isLiked: newIsLiked, isDisliked: false, likeCount: newIsLiked ? v.likeCount + 1 : Math.max(0, v.likeCount - 1) };
      }
      return v;
    }));
  }, []);

  const handleToggleDislike = useCallback((id: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === id) {
        const newIsDisliked = !v.isDisliked;
        const wasLiked = v.isLiked;
        return { ...v, isDisliked: newIsDisliked, isLiked: false, likeCount: wasLiked ? Math.max(0, v.likeCount - 1) : v.likeCount };
      }
      return v;
    }));
  }, []);

  const handleAddReview = useCallback((videoId: string, rating: number, text: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      rating,
      text,
      user: `Node_${Math.floor(Math.random() * 9999)}`,
      timestamp: Date.now(),
      isApproved: true // Auto-approve for the streamlined portal
    };
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, reviews: [newReview, ...(v.reviews || [])] } : v));
  }, []);

  const handleAddManualVideo = useCallback((url: string, prompt: string, category: VideoCategory) => {
    const newVideo: VideoItem = {
      id: `man-${Date.now()}`,
      prompt,
      category,
      url,
      timestamp: Date.now(),
      status: 'ready',
      viewCount: 0,
      likeCount: 0,
      rating: 0,
      isFavorite: false,
      isLiked: false,
      reviews: []
    };
    setVideos(prev => [newVideo, ...prev]);
    handleSelectVideo(newVideo);
  }, [handleSelectVideo]);

  const handleAddCategory = useCallback((name: string) => {
    if (!categories.includes(name)) {
      setCategories(prev => [...prev, name]);
    }
  }, [categories]);

  const handleRemoveCategory = useCallback((name: string) => {
    setCategories(prev => prev.filter(c => c !== name));
    setVideos(prev => prev.map(v => v.category === name ? { ...v, category: 'Other' } : v));
    if (activeTab === name) setActiveTab('All');
  }, [activeTab]);

  const toggleFullscreen = () => {
    const container = document.getElementById('v-player-root');
    if (!container) return;
    if (!document.fullscreenElement) { container.requestFullscreen().catch(() => {}); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const getAuraColor = (tab: VideoCategory | 'All' | 'Vault' | null) => {
    switch (tab) {
      case 'Meditation': return 'bg-emerald-500/10';
      case 'Tribal': return 'bg-orange-500/10';
      case 'Dance': return 'bg-pink-500/10';
      case 'Integral Serenity': return 'bg-teal-500/10';
      case 'Permia Community': return 'bg-indigo-500/10';
      case 'Vault': return 'bg-red-600/10';
      case 'All': return 'bg-blue-600/10';
      default: return 'bg-slate-500/5';
    }
  };

  const getCategoryHoverBg = (category: VideoCategory) => {
    switch (category) {
      case 'Meditation': return 'hover:bg-emerald-500/10 hover:border-emerald-500/30';
      case 'Tribal': return 'hover:bg-orange-500/10 hover:border-orange-500/30';
      case 'Dance': return 'hover:bg-pink-500/10 hover:border-pink-500/30';
      case 'Integral Serenity': return 'hover:bg-teal-500/10 hover:border-teal-500/30';
      case 'Permia Community': return 'hover:bg-indigo-500/10 hover:border-indigo-500/30';
      default: return 'hover:bg-blue-500/10 hover:border-blue-500/30';
    }
  };

  const effectiveTab = hoveredTab || activeTab;
  const currentVideo = videos.find(v => v.id === currentVideoId) || null;

  const getCategoryColorClasses = (category: VideoCategory) => {
    switch (category) {
      case 'Meditation': return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', glow: 'shadow-[0_0_12px_#10b981]' };
      case 'Tribal': return { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5', glow: 'shadow-[0_0_12px_#f59e0b]' };
      case 'Dance': return { text: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-500/5', glow: 'shadow-[0_0_12px_#ec4899]' };
      case 'Integral Serenity': return { text: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/5', glow: 'shadow-[0_0_12px_#14b8a6]' };
      case 'Permia Community': return { text: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', glow: 'shadow-[0_0_12px_#6366f1]' };
      default: return { text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', glow: 'shadow-[0_0_12px_#3b82f6]' };
    }
  };

  const toggleReviews = () => { setIsReviewOpen(!isReviewOpen); if (!isReviewOpen) setShowQuickVault(false); };
  const toggleQuickVault = () => { setShowQuickVault(!showQuickVault); if (!showQuickVault) setIsReviewOpen(false); };

  return (
    <div className={`min-h-screen flex flex-col bg-[#020617] relative overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      {/* Background Aura */}
      <div className={`absolute -top-1/4 -right-1/4 w-full h-full blur-[200px] rounded-full transition-all duration-1000 z-0 ${getAuraColor(effectiveTab)}`}></div>
      <div className={`absolute -bottom-1/4 -left-1/4 w-full h-full blur-[200px] rounded-full transition-all duration-1000 z-0 opacity-50 ${getAuraColor(effectiveTab)}`}></div>

      <header className="glass sticky top-0 z-[60] border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 group/header cursor-pointer" onClick={() => { setIsReviewOpen(false); }}>
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform group-hover/header:scale-105 p-1.5">
               <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M50 5 C60 20 60 35 50 50 C40 35 40 20 50 5" fill="#1d4ed8" />
                  <path d="M15 30 C20 40 35 50 45 45 C40 35 25 20 15 30" fill="#dc2626" />
                  <path d="M85 30 C80 40 65 50 55 45 C60 35 75 20 85 30" fill="#ea580c" />
                  <path d="M10 55 C10 90 45 95 50 95" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
                  <path d="M90 55 C90 90 55 95 50 95" fill="none" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                  <circle cx="50" cy="72" r="12" fill="#64748b" />
               </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">INTEGRALSTREAM</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.3em]">SERENITY TERMINAL</span>
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             {/* Header Right Content Removed as Requested */}
          </div>
        </div>
      </header>

      <main ref={mainRef} className="flex-1 max-w-[1800px] mx-auto w-full px-6 py-10 flex flex-col lg:flex-row gap-0 overflow-hidden relative z-10">
        <aside 
          className="flex flex-col h-[calc(100vh-14rem)] flex-shrink-0 relative group/aside"
          style={{ width: `${sidebarWidth}px` }}
        >
          <section className="glass p-5 rounded-[2.5rem] flex-1 min-h-0 flex flex-col shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <Playlist 
              videos={videos} 
              categories={categories}
              currentVideo={currentVideo} 
              onSelect={handleSelectVideo} 
              onRemove={handleRemoveVideo}
              onToggleFavorite={handleToggleFavorite} 
              onMoveVideo={handleMoveVideo} 
              onAddRandom={handleAddSurprise} 
              onAddManualVideo={handleAddManualVideo}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onHoverTab={setHoveredTab}
            />
          </section>
          
          <div 
            onMouseDown={startResizing}
            className={`absolute -right-5 top-0 bottom-0 w-10 flex items-center justify-center cursor-col-resize z-50 transition-all ${isResizing ? 'opacity-100' : 'opacity-0 group-hover/aside:opacity-100'}`}
          >
            <div className={`w-1 h-20 rounded-full transition-all duration-300 ${isResizing ? 'bg-blue-500 scale-y-110 shadow-[0_0_15px_#3b82f6]' : 'bg-white/20 hover:bg-white/40'}`}></div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col gap-4 relative overflow-y-auto custom-scrollbar pb-20 pl-10">
          {currentVideo && (
            <div className="animate-fade-in px-2 flex items-center justify-between">
               <h2 className="text-[12px] font-black text-white leading-tight tracking-[0.2em] uppercase italic flex items-center gap-3">
                  <div className={`w-1 h-5 rounded-full bg-current ${getCategoryColorClasses(currentVideo.category).text} ${getCategoryColorClasses(currentVideo.category).glow} animate-pulse`}></div>
                  {currentVideo.prompt}
               </h2>
               <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">SECURE FEED ID: {currentVideo.id.split('-').pop()}</div>
            </div>
          )}
          
          <div className="relative group/player transition-all duration-700">
             <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-[3.5rem] blur-xl opacity-0 group-hover/player:opacity-100 transition-opacity pointer-events-none"></div>
             <VideoPlayer video={currentVideo} isPlaying={isPlaying} onPlayStateChange={setIsPlaying} onEnded={handleVideoEnded} onToggleLike={() => handleToggleLike(currentVideoId!)} onToggleDislike={() => handleToggleDislike(currentVideoId!)} onToggleFavorite={() => handleToggleFavorite(currentVideoId!)} />
          </div>

          {currentVideo && (
            <>
              <div className="glass p-5 rounded-[2.5rem] animate-fade-in relative shadow-2xl ring-1 ring-white/10">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pr-4">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl border whitespace-nowrap shrink-0 transition-colors ${getCategoryColorClasses(currentVideo.category).border} ${getCategoryColorClasses(currentVideo.category).text} ${getCategoryColorClasses(currentVideo.category).bg}`}>{currentVideo.category}</span>
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl shrink-0">
                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">VIEWS:: {currentVideo.viewCount.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest border-l border-white/10 pl-3">LIKES:: {currentVideo.likeCount.toLocaleString()}</div>
                  </div>
                  <button onClick={toggleReviews} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 ${isReviewOpen ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'}`}><span className="text-[10px] font-black uppercase tracking-widest">REVIEWS</span></button>
                  <button onClick={toggleQuickVault} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shrink-0 ${showQuickVault ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'}`}><span className="text-[10px] font-black uppercase tracking-widest">VAULT</span></button>
                  <button onClick={toggleFullscreen} className="ml-auto px-5 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0 whitespace-nowrap min-w-fit">{isFullscreen ? 'COMPRESS' : 'FULLSCREEN'}</button>
                </div>
              </div>
              {showQuickVault && (
                <div className="glass p-8 rounded-[2.5rem] animate-fade-in shadow-2xl ring-1 ring-white/10 mt-4 border border-red-500/10">
                  <div className="flex items-center justify-between mb-6 px-2 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                       <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.4em]">Playlist Vault</h3>
                       <button onClick={handleShuffleVault} className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"><i className="fa-solid fa-shuffle"></i> SHUFFLE VAULT</button>
                    </div>
                    <button onClick={() => setShowQuickVault(false)} className="text-[9px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">DISMISS PANEL</button>
                  </div>
                  <div className="relative rounded-2xl bg-[#010410] border-2 border-slate-900 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="h-[400px] overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3">
                      {vaultedVideos.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">ZERO DATA IN VAULT</span><span className="text-[8px] font-bold text-slate-700 uppercase mt-2 tracking-widest">FAVORITE SIGNALS TO POPULATE THIS TERMINAL</span></div>
                      ) : (
                        vaultedVideos.map((v, idx) => (
                          <div 
                            key={v.id} 
                            onClick={() => handleSelectVideo(v)}
                            onMouseEnter={() => setHoveredTab(v.category)}
                            onMouseLeave={() => setHoveredTab(null)}
                            className={`group flex items-center gap-6 p-4 rounded-xl transition-all border cursor-pointer h-[96px] shrink-0 relative ${v.id === currentVideo?.id ? 'bg-red-600/10 border-red-500/40' : `bg-white/[0.02] border-white/5 ${getCategoryHoverBg(v.category)}`}`}
                          >
                            <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(v.id); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-500/20 z-10 group-hover:scale-110 opacity-0 group-hover:opacity-100" title="Remove from Vault"><i className="fa-solid fa-xmark text-[11px]"></i></button>
                            <div className="flex flex-col items-center justify-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity pr-1">
                                <button onClick={(e) => { e.stopPropagation(); handleMoveVaultedVideo(v.id, 'up'); }} className={`transition-all hover:scale-125 active:scale-90 text-slate-400 hover:text-red-400 ${idx === 0 ? 'invisible' : ''}`}><i className="fa-solid fa-chevron-up text-[10px]"></i></button>
                                <button onClick={(e) => { e.stopPropagation(); handleMoveVaultedVideo(v.id, 'down'); }} className={`transition-all hover:scale-125 active:scale-90 text-slate-400 hover:text-red-400 ${idx === vaultedVideos.length - 1 ? 'invisible' : ''}`}><i className="fa-solid fa-chevron-down text-[10px]"></i></button>
                            </div>
                            <div className="w-28 aspect-video rounded-lg overflow-hidden border border-white/5 shrink-0 transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] shadow-2xl">
                              <img src={v.thumbnail || `https://img.youtube.com/vi/${v.url.split('v=')[1]?.split('&')[0] || v.url}/mqdefault.jpg`} className={`w-full h-full object-cover transition-all duration-700 ${v.id === currentVideo?.id ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} />
                            </div>
                            <div className="flex-1 overflow-hidden flex flex-col justify-center">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black text-white uppercase truncate tracking-tight">{v.prompt}</span>
                                {v.id === currentVideo?.id && <span className="text-[7px] font-black text-red-400 uppercase tracking-widest animate-pulse border border-red-400/30 px-2 py-0.5 rounded-md">{isPlaying ? 'STREAMING' : 'PAUSED'}</span>}
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border inline-block ${getCategoryColorClasses(v.category).bg} ${getCategoryColorClasses(v.category).text} ${getCategoryColorClasses(v.category).border}`}>{v.category}</span>
                                <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                                   <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">VIEWS:: {v.viewCount.toLocaleString()}</span>
                                   <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">LIKES:: {v.likeCount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center"><div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.6em]">VAULT_SUBSYSTEM_SECURE</div></div>
                </div>
              )}
              <FloatingReviewHub video={currentVideo} isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} onSubmitReview={(rating, text) => handleAddReview(currentVideo.id, rating, text)} />
            </>
          )}
        </div>
      </main>

      <footer className="h-8 glass border-t border-white/5 px-6 flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] z-[70]">
        <div className="flex items-center gap-4"><span>Connection: Encrypted</span><span className="text-emerald-500">Latency: 12ms</span></div>
        <span>IntegralStream OS v5.4.3</span>
      </footer>
    </div>
  );
};

export default App;
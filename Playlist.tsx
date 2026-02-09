import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VideoItem, VideoCategory } from '../types';

interface PlaylistProps {
  videos: VideoItem[];
  categories: VideoCategory[];
  currentVideo?: VideoItem | null;
  onSelect: (video: VideoItem) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onMoveVideo: (id: string, direction: 'up' | 'down') => void;
  onAddRandom: () => void;
  isGeneratingRandom?: boolean;
  onAddManualVideo: (url: string, prompt: string, category: VideoCategory) => void;
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
  onPurgeAll: () => void;
  activeTab: VideoCategory | 'All' | 'Vault';
  setActiveTab: (tab: VideoCategory | 'All' | 'Vault') => void;
  onHoverTab?: (tab: VideoCategory | 'All' | 'Vault' | null) => void;
  isAuthorized: boolean;
}

const Playlist: React.FC<PlaylistProps> = ({ 
  videos, 
  categories,
  currentVideo, 
  onSelect, 
  onRemove, 
  onToggleFavorite, 
  onMoveVideo,
  onAddRandom,
  isGeneratingRandom = false,
  onAddManualVideo,
  onAddCategory,
  onRemoveCategory,
  onPurgeAll,
  activeTab, 
  setActiveTab, 
  onHoverTab,
  isAuthorized,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newCat, setNewCat] = useState<VideoCategory | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [purgeConfirmation, setPurgeConfirmation] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddForm && urlInputRef.current) {
      // Ensure the cursor is active in the URL field when the form is opened
      urlInputRef.current.focus();
    }
  }, [showAddForm]);

  // Reset purge confirmation automatically if not confirmed
  useEffect(() => {
    if (purgeConfirmation) {
      const timer = setTimeout(() => setPurgeConfirmation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [purgeConfirmation]);

  const filteredVideos = useMemo(() => {
    if (activeTab === 'All') return videos;
    if (activeTab === 'Vault') return videos.filter(v => v.isFavorite);
    return videos.filter(v => v.category === activeTab);
  }, [videos, activeTab]);

  const allTabs = useMemo(() => {
    const baseTabs = [
      { name: 'All' as const },
      { name: 'Vault' as const }
    ];
    const categoryTabs = categories.map(cat => ({
      name: cat
    }));
    return [...baseTabs, ...categoryTabs];
  }, [categories]);

  const firstRowTabs = useMemo(() => allTabs.slice(0, 4), [allTabs]);
  const overflowTabs = useMemo(() => allTabs.slice(4), [allTabs]);

  const getThumbnailUrl = (video: VideoItem) => {
    if (video.thumbnail) return video.thumbnail;
    const trimmed = video.url.trim();
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    const youtubeId = (match && match[1] && match[1].length === 11) ? match[1] : (trimmed.length === 11 ? trimmed : null);
    
    if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200';
  };

  const resetForm = () => {
    setNewUrl('');
    setNewPrompt('');
    setNewCat(null);
    setShowAddForm(false);
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newCat) return;
    onAddManualVideo(newUrl, newPrompt || "Neural Trace", newCat);
    resetForm();
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getTagColorClasses = (category: VideoCategory) => {
    switch (category) {
      case 'Meditation': return 'text-emerald-500 border-emerald-500/20 bg-emerald-400/5';
      case 'Tribal': return 'text-orange-500 border-orange-400/20 bg-orange-400/5';
      case 'Dance': return 'text-[#F5F5DC] border-[#F5F5DC]/20 bg-[#F5F5DC]/5';
      case 'Integral Serenity': return 'text-[#800020] border-[#800020]/20 bg-[#800020]/5';
      case 'Permia Community': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
      default: return 'text-slate-500 border-slate-700 bg-slate-400/5';
    }
  };

  const getCategoryHoverBg = (category: VideoCategory) => {
    switch (category) {
      case 'Meditation': return 'hover:bg-emerald-500/10 hover:border-emerald-500/30';
      case 'Tribal': return 'hover:bg-orange-500/10 hover:border-orange-500/30';
      case 'Dance': return 'hover:bg-[#F5F5DC]/10 hover:border-[#F5F5DC]/30';
      case 'Integral Serenity': return 'hover:bg-[#800020]/10 hover:border-[#800020]/30';
      case 'Permia Community': return 'hover:bg-yellow-500/10 hover:border-yellow-500/30';
      default: return 'hover:bg-blue-500/10 hover:border-blue-500/30';
    }
  };

  const handlePurgeClick = () => {
    if (purgeConfirmation) {
      onPurgeAll();
      setPurgeConfirmation(false);
    } else {
      setPurgeConfirmation(true);
    }
  };

  const renderTab = (tab: { name: string }) => {
    const isDeletable = isAuthorized && !['All', 'Vault', 'Other'].includes(tab.name);

    return (
      <div key={tab.name} className="relative group/tab">
        <button
          onClick={() => setActiveTab(tab.name as any)}
          onMouseEnter={() => onHoverTab?.(tab.name as any)}
          onMouseLeave={() => onHoverTab?.(null)}
          className={`w-full h-7 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center px-1 relative cursor-pointer ${
            activeTab === tab.name 
            ? 'bg-white text-slate-950 shadow-md scale-[1.02]' 
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span className="truncate w-full text-center px-1">{tab.name}</span>
        </button>

        {isDeletable && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemoveCategory(tab.name); }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/tab:opacity-100 transition-opacity z-10 hover:scale-125 shadow-lg border border-white/20 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-[8px]"></i>
          </button>
        )}
      </div>
    );
  };

  // Condition for form completeness
  const isFormComplete = !!newUrl && !!newCat;

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-none bg-[#0a0f1e] pb-4 z-20">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            Signal Archive
          </h3>
          
          <div className="flex items-center gap-4">
            {isAuthorized && (
              <button 
                onClick={handlePurgeClick}
                className={`text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${purgeConfirmation ? 'text-white bg-red-600 px-3 py-1 rounded-lg animate-pulse' : 'text-red-500 hover:text-white'}`}
              >
                <i className={`fa-solid ${purgeConfirmation ? 'fa-triangle-exclamation' : 'fa-trash-can'} text-[11px]`}></i>
                {purgeConfirmation ? 'Confirm Purge?' : 'Purge All'}
              </button>
            )}

            <button 
              onClick={onAddRandom}
              className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-brain text-[11px]"></i>
              Surprise
            </button>

            {isAuthorized && (
              <button 
                onClick={() => showAddForm ? resetForm() : setShowAddForm(true)}
                className={`w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all border border-white/10 z-30 cursor-pointer ${
                  showAddForm ? 'bg-red-600/20 text-red-500 border-red-500/40 rotate-45' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                }`}
              >
                <i className="fa-solid fa-plus text-sm"></i>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg p-1">
            <div className="flex items-center gap-1">
              <div className="grid grid-cols-4 gap-1 flex-1">
                {firstRowTabs.map(renderTab)}
              </div>
              
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-9 h-7 flex-shrink-0 flex items-center justify-center rounded-lg border border-white/5 transition-all duration-500 cursor-pointer ${
                  isExpanded ? 'bg-blue-600 text-white rotate-180 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-slate-500 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-chevron-down text-[10px]"></i>
              </button>
            </div>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[600px] mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="grid grid-cols-4 gap-1 border-t border-white/5 pt-1">
                {overflowTabs.map(renderTab)}
                
                {isAuthorized && (
                  <div className="col-span-1 h-7">
                    {isAddingCategory ? (
                      <form onSubmit={handleAddCategorySubmit} className="h-full animate-fade-in bg-blue-600/10 rounded-lg px-2 border border-blue-500/30 flex items-center overflow-hidden">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="..." 
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onBlur={() => !newCategoryName && setIsAddingCategory(false)}
                          className="bg-transparent border-none text-[10px] text-white w-full focus:outline-none font-black uppercase"
                        />
                      </form>
                    ) : (
                      <button 
                        onClick={() => setIsAddingCategory(true)}
                        className="w-full h-full flex items-center justify-center rounded-lg bg-white/5 border border-dashed border-white/20 text-slate-600 hover:text-blue-400 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <i className="fa-solid fa-plus text-[10px]"></i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {showAddForm && isAuthorized && (
            <div className="animate-fade-in bg-[#0f172a] border border-blue-500/20 rounded-3xl p-6 mt-2 shadow-2xl space-y-4">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Allocate New Signal</h4>
              <form onSubmit={handleInlineSubmit} className="space-y-4">
                <input 
                  ref={urlInputRef}
                  required 
                  type="text" 
                  placeholder="YouTube URL..." 
                  value={newUrl} 
                  onChange={(e) => setNewUrl(e.target.value)} 
                  className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Neural Prompt / Title..." 
                  value={newPrompt} 
                  onChange={(e) => setNewPrompt(e.target.value)} 
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none" 
                />
                <div className="space-y-2">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Target Category</span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button 
                        key={cat} 
                        type="button" 
                        onClick={() => setNewCat(cat)} 
                        className={`px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all cursor-pointer ${
                          newCat === cat ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={resetForm} className="flex-1 bg-white/5 border border-white/10 text-slate-400 py-3 rounded-xl text-[9px] font-black uppercase cursor-pointer">Abort</button>
                  <button 
                    type="submit" 
                    disabled={!isFormComplete} 
                    className={`flex-[2] py-3 rounded-xl text-[9px] font-black uppercase shadow-lg transition-all cursor-pointer ${
                      isFormComplete 
                      ? 'bg-white text-slate-950 hover:bg-blue-50' 
                      : 'bg-slate-700 text-slate-400 border border-white/5'
                    }`}
                  >
                    Add URL
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      <div ref={scrollContainerRef} className="flex-1 space-y-2 overflow-y-auto pr-1.5 custom-scrollbar mt-4 pb-10">
        {filteredVideos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4 opacity-40">
             <i className="fa-solid fa-folder-open text-4xl text-slate-700 mb-6"></i>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Zero Signals Detected</p>
          </div>
        ) : filteredVideos.map((video, idx) => (
          <div key={video.id} onClick={() => onSelect(video)} className={`group flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer border relative animate-fade-in pr-10 ${currentVideo?.id === video.id ? 'bg-white/10 border-white/20' : `bg-transparent border-transparent ${getCategoryHoverBg(video.category)}`}`}>
            <div className="absolute top-0 bottom-0 right-3 py-3 flex flex-col items-center justify-between z-30 opacity-30 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(video.id); }} className={`transition-all hover:scale-125 cursor-pointer ${video.isFavorite ? 'text-red-500 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                <i className={`fa-${video.isFavorite ? 'solid' : 'regular'} fa-heart text-[12px]`}></i>
              </button>
              {isAuthorized && (
                <button onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(video.id); }} className="text-slate-400 hover:text-red-500 transition-all hover:scale-125 cursor-pointer" data-tooltip="PURGE SIGNAL">
                  <i className="fa-solid fa-xmark text-[14px]"></i>
                </button>
              )}
            </div>

            {confirmingDeleteId === video.id && isAuthorized && (
              <div className="absolute inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm rounded-2xl flex items-center justify-between px-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">PURGE SIGNAL?</span>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmingDeleteId(null)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase text-slate-400 cursor-pointer">ABORT</button>
                  <button onClick={(e) => { e.stopPropagation(); onRemove(video.id); setConfirmingDeleteId(null); }} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[9px] font-black uppercase cursor-pointer">PURGE</button>
                </div>
              </div>
            )}

            <div className={`w-24 h-14 rounded-xl bg-slate-900 flex-shrink-0 overflow-hidden relative shadow-lg border transition-all duration-300 group-hover:scale-[1.03] ${currentVideo?.id === video.id ? 'border-blue-500/30' : 'border-white/5'}`}>
              {video.status === 'ready' ? (
                <img src={getThumbnailUrl(video)} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-300" alt="" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/80">
                  <i className={`fa-solid ${video.status === 'generating' ? 'fa-atom animate-spin text-blue-500' : 'fa-triangle-exclamation text-red-500'} text-lg mb-1`}></i>
                  <span className="text-[6px] font-black uppercase tracking-widest text-slate-600">{video.status}</span>
                </div>
              )}
              <div className={`absolute inset-0 flex items-center justify-center ${currentVideo?.id === video.id ? 'bg-blue-600/30' : 'bg-black/0 group-hover:bg-black/20'}`}>
                {video.status === 'ready' && (
                  <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg transition-transform ${currentVideo?.id === video.id ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}>
                     <i className="fa-solid fa-play text-blue-600 text-[10px] ml-0.5"></i>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col justify-center gap-1.5 pr-2">
              <p className={`text-[14px] font-bold leading-tight truncate ${currentVideo?.id === video.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{video.prompt}</p>
              <div className="flex items-center gap-1.5 w-full">
                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${getTagColorClasses(video.category)}`}>{video.category}</span>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest shrink-0 border-l border-white/5 pl-1.5 overflow-x-auto custom-scrollbar no-scrollbar">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-orange-500">Viewed</span>
                    <span className="text-slate-400">{formatCount(video.viewCount)}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-blue-500">Liked</span>
                    <span className="text-slate-400">{formatCount(video.likeCount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;

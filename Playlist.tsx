import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VideoItem, VideoCategory } from './types';

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
  activeTab: VideoCategory | 'All' | 'Vault';
  setActiveTab: (tab: VideoCategory | 'All' | 'Vault') => void;
  onHoverTab?: (tab: VideoCategory | 'All' | 'Vault' | null) => void;
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
  activeTab,
  setActiveTab,
  onHoverTab
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [newUrl, setNewUrl] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newCat, setNewCat] = useState<VideoCategory | null>(null);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredVideos = useMemo(() => {
    if (activeTab === 'All') return videos;
    if (activeTab === 'Vault') return videos.filter(v => v.isFavorite);
    return videos.filter(v => v.category === activeTab);
  }, [videos, activeTab]);

  const getTabIcon = (name: string) => {
    switch (name) {
      case 'All': return 'fa-grip';
      case 'Vault': return 'fa-shield-heart';
      case 'Meditation': return 'fa-spa';
      case 'Tribal': return 'fa-fire-alt';
      case 'Dance': return 'fa-compact-disc';
      case 'Integral Serenity': return 'fa-wind';
      case 'Permia Community': return 'fa-hands-holding-circle';
      default: return 'fa-folder';
    }
  };

  const tabs = useMemo(() => {
    const baseTabs = [
      { name: 'All' as const, icon: 'fa-grip' },
      { name: 'Vault' as const, icon: 'fa-shield-heart' }
    ];
    const categoryTabs = categories.map(cat => ({
      name: cat,
      icon: getTabIcon(cat)
    }));
    return [...baseTabs, ...categoryTabs];
  }, [categories]);

  const getThumbnailUrl = (video: VideoItem) => {
    if (video.thumbnail) return video.thumbnail;
    const trimmed = video.url.trim();
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    const youtubeId = (match && match[1] && match[1].length === 11) ? match[1] : (trimmed.length === 11 ? trimmed : null);
    
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    }
    
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200';
  };

  const resetForm = () => {
    setNewUrl('');
    setNewPrompt('');
    setNewCat(null);
    setAddStep(1);
    setShowAddForm(false);
    setIsFetchingTitle(false);
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

  useEffect(() => {
    const extractYouTubeId = (input: string) => {
      const trimmed = input.trim();
      const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
      const match = trimmed.match(regExp);
      if (match && match[1] && match[1].length === 11) return match[1];
      if (trimmed.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
      return null;
    };

    const vidId = extractYouTubeId(newUrl);
    if (vidId && addStep === 2) {
      const fetchTitle = async () => {
        setIsFetchingTitle(true);
        try {
          const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${vidId}`);
          const data = await response.json();
          if (data && data.title) {
            setNewPrompt(data.title);
          }
        } catch (err) {
          console.debug("YouTube metadata link interrupted.");
        } finally {
          setIsFetchingTitle(false);
        }
      };
      const timeoutId = setTimeout(fetchTitle, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [newUrl, addStep]);

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmingDeleteId(id);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingDeleteId(null);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onRemove(id);
    setConfirmingDeleteId(null);
  };

  const getTagColorClasses = (category: VideoCategory) => {
    switch (category) {
      case 'Meditation': return 'text-emerald-500 border-emerald-500/20 bg-emerald-400/5';
      case 'Tribal': return 'text-orange-500 border-orange-400/20 bg-orange-400/5';
      case 'Dance': return 'text-pink-500 border-pink-400/20 bg-pink-400/5';
      case 'Integral Serenity': return 'text-teal-500 border-teal-500/20 bg-teal-400/5';
      case 'Permia Community': return 'text-indigo-500 border-indigo-500/20 bg-indigo-400/5';
      default: return 'text-slate-500 border-slate-700 bg-slate-400/5';
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

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-none bg-[#0a0f1e] pb-4 z-20">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            Vault Explorer
          </h3>
          
          <div className="flex items-center gap-4">
            <button 
              disabled={isGeneratingRandom}
              onClick={onAddRandom}
              className={`text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group/btn ${
                isGeneratingRandom ? 'text-blue-400 animate-pulse' : 'text-blue-500 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-brain text-[11px]"></i>
              {isGeneratingRandom ? 'Dreaming...' : 'Surprise Me'}
            </button>

            <button 
              onClick={() => showAddForm ? resetForm() : setShowAddForm(true)}
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-90 transform border border-white/10 z-30 ${
                showAddForm 
                ? 'bg-red-600/20 text-red-500 border-red-500/40 rotate-45' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              }`}
            >
              <i className="fa-solid fa-plus text-sm"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar shadow-lg">
            {tabs.map(tab => (
              <div 
                key={tab.name} 
                className="relative group/tab"
                onMouseEnter={() => onHoverTab?.(tab.name)}
                onMouseLeave={() => onHoverTab?.(null)}
              >
                <button
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2.5 ${
                    activeTab === tab.name 
                    ? 'bg-white text-slate-950 shadow-lg' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} ${activeTab === tab.name ? 'text-blue-600' : 'text-slate-600'}`}></i>
                  {tab.name}
                </button>
              </div>
            ))}
            
            <div className="relative flex items-center h-full px-2">
              {isAddingCategory ? (
                <form onSubmit={handleAddCategorySubmit} className="flex items-center animate-fade-in">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="New Cat..." 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onBlur={() => !newCategoryName && setIsAddingCategory(false)}
                    className="bg-black/60 border border-blue-500/40 rounded-lg px-3 py-1.5 text-[10px] text-white w-24 focus:outline-none"
                  />
                  <button type="submit" className="ml-2 w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px]"><i className="fa-solid fa-check"></i></button>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAddingCategory(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-blue-400 hover:bg-white/10 transition-all shadow-md shrink-0"
                  title="Add Category"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                </button>
              )}
            </div>
          </div>

          {showAddForm && (
            <div className="animate-fade-in bg-[#0f172a] border border-blue-500/20 rounded-3xl p-6 mt-2 shadow-2xl">
              {addStep === 1 ? (
                <div className="space-y-4 text-center">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Select Classification</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => {setNewCat(cat); setAddStep(2);}} className="py-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/40 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInlineSubmit} className="space-y-4">
                  <input required autoFocus type="text" placeholder="YouTube URL..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none focus:border-blue-500/40" />
                  <input type="text" placeholder={isFetchingTitle ? "Scanning..." : "Title..."} value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setAddStep(1)} className="flex-1 bg-white/5 border border-white/10 text-slate-400 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">Back</button>
                    <button type="submit" className="flex-[2] bg-white text-slate-950 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Inject Signal</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div ref={scrollContainerRef} className="flex-1 space-y-2 overflow-y-auto pr-1.5 custom-scrollbar mt-4 pb-10">
        {filteredVideos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4 opacity-40">
             <i className="fa-solid fa-folder-open text-4xl text-slate-700 mb-6"></i>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Zero Signals Detected</p>
             <p className="text-[8px] font-bold uppercase tracking-widest text-slate-800 mt-2">Inject new data or use Surprise Me</p>
          </div>
        ) : filteredVideos.map((video, idx) => (
          <div 
            key={video.id}
            onClick={() => onSelect(video)}
            className={`group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border relative animate-fade-in pr-10 ${
              currentVideo?.id === video.id 
              ? 'bg-white/10 border-white/20 ring-1 ring-white/10' 
              : `bg-transparent border-transparent ${getCategoryHoverBg(video.category)}`
            }`}
          >
            {/* ACTION HUD: REORDER */}
            <div className="flex flex-col items-center justify-center gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity pr-1">
              <button
                onClick={(e) => { e.stopPropagation(); onMoveVideo(video.id, 'up'); }}
                className={`transition-all hover:scale-125 active:scale-90 text-slate-400 hover:text-blue-500 ${idx === 0 ? 'invisible' : ''}`}
                title="Move Up"
              >
                  <i className="fa-solid fa-chevron-up text-[10px]"></i>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveVideo(video.id, 'down'); }}
                className={`transition-all hover:scale-125 active:scale-90 text-slate-400 hover:text-blue-500 ${idx === filteredVideos.length - 1 ? 'invisible' : ''}`}
                title="Move Down"
              >
                  <i className="fa-solid fa-chevron-down text-[10px]"></i>
              </button>
            </div>

            {/* ACTION HUD: HEART + DELETE */}
            <div className="absolute top-0 bottom-0 right-3 py-3 flex flex-col items-center justify-between z-30 opacity-30 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(video.id); }}
                className={`transition-all hover:scale-125 active:scale-90 ${video.isFavorite ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-slate-400 hover:text-white'}`}
                title="Add to Vault"
              >
                  <i className={`fa-${video.isFavorite ? 'solid' : 'regular'} fa-heart text-[12px]`}></i>
              </button>

              <button
                onClick={(e) => requestDelete(e, video.id)}
                className="text-slate-400 hover:text-red-500 transition-all hover:scale-125 active:scale-90"
                title="Purge Signal"
              >
                <i className="fa-solid fa-xmark text-[14px]"></i>
              </button>
            </div>

            {/* DELETE CONFIRMATION OVERLAY */}
            {confirmingDeleteId === video.id && (
              <div 
                className="absolute inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm rounded-2xl flex items-center justify-between px-6 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">REMOVE SIGNAL?</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Data will be purged.</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={cancelDelete}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    ABORT
                  </button>
                  <button 
                    onClick={(e) => confirmDelete(e, video.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all"
                  >
                    PURGE
                  </button>
                </div>
              </div>
            )}

            {/* THUMBNAIL AREA */}
            <div className={`w-24 h-14 rounded-xl bg-slate-900 flex-shrink-0 overflow-hidden relative shadow-2xl border transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] ${currentVideo?.id === video.id ? 'border-blue-500/30' : 'border-white/5'}`}>
              <img src={getThumbnailUrl(video)} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt="" />
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${currentVideo?.id === video.id ? 'bg-blue-600/30' : 'bg-black/0 group-hover:bg-black/20'}`}>
                <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg transition-transform duration-300 ${currentVideo?.id === video.id ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}>
                   <i className="fa-solid fa-play text-blue-600 text-[10px] ml-0.5"></i>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col justify-center gap-1.5 pr-2">
              <p className={`text-[12px] font-bold leading-tight truncate ${currentVideo?.id === video.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {video.prompt}
              </p>
              
              <div className="flex items-center gap-2 w-full">
                <span className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md border shrink-0 ${getTagColorClasses(video.category)}`}>
                  {video.category}
                </span>

                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shrink-0 border-l border-white/5 pl-2">
                  <span className="flex items-center gap-1 text-amber-400">
                    <i className="fa-solid fa-eye text-[9px]"></i>
                    {formatCount(video.viewCount)}
                  </span>
                  <span className="flex items-center gap-1 text-blue-500">
                    <i className="fa-solid fa-thumbs-up text-[9px]"></i>
                    {formatCount(video.likeCount)}
                  </span>
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

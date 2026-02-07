import React, { useRef, useState, useEffect, useMemo } from 'react';
import { VideoItem } from '../types';

interface VideoPlayerProps {
  video: VideoItem | null;
  isPlaying: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
  onEnded?: () => void;
  onToggleLike?: () => void;
  onToggleDislike?: () => void;
  onToggleFavorite?: () => void;
  onViewIncrement?: () => void;
  onWriteReview?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  isPlaying, 
  onPlayStateChange, 
  onEnded, 
  onToggleLike, 
  onToggleDislike,
  onToggleFavorite,
  onViewIncrement,
  onWriteReview
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  const lastInteractionRef = useRef<number>(0);

  const getCleanId = (input: string) => {
    if (!input) return null;
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[1] && match[1].length === 11) return match[1];
    return null;
  };

  const youtubeId = useMemo(() => video ? getCleanId(video.url) : null, [video?.url]);
  const isYouTube = !!youtubeId;

  const videoId = video?.id;

  useEffect(() => {
    setIsSyncing(true);
    setViewCounted(false);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [videoId]);

  useEffect(() => {
    if (isPlaying && !viewCounted && videoId && video?.status === 'ready') {
      const timer = window.setTimeout(() => {
        onViewIncrement?.();
        setViewCounted(true);
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, [isPlaying, viewCounted, onViewIncrement, videoId, video?.status]);

  useEffect(() => {
    if (!isYouTube) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange') {
          if (data.info === 0) {
            onEnded?.();
          } else if (data.info === 1) { // Playing
            onPlayStateChange(true);
          } else if (data.info === 2) { // Paused
            onPlayStateChange(false);
          }
        }
      } catch (e) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, onEnded, onPlayStateChange]);

  const sendYoutubeCommand = (func: string, args: any = '') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: args
      }), '*');
    }
  };

  useEffect(() => {
    if (isYouTube) {
      sendYoutubeCommand(isPlaying ? 'playVideo' : 'pauseVideo');
      sendYoutubeCommand('unMute');
      sendYoutubeCommand('setVolume', 80);
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
      videoRef.current.volume = 0.8;
      videoRef.current.muted = false;
    }
  }, [isPlaying, isYouTube, videoId]);

  const handlePlayerClick = () => {
    const nextPlaying = !isPlaying;
    onPlayStateChange(nextPlaying);
    lastInteractionRef.current = Date.now();

    if (nextPlaying) {
      setShowControls(false);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    } else {
      setShowControls(true);
    }
  };

  const triggerControls = () => {
    if (Date.now() - lastInteractionRef.current < 300) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  if (!video) {
    return (
      <div className="w-full aspect-video rounded-[3rem] overflow-hidden relative border border-white/10 bg-[#020617] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <i className="fa-solid fa-signal text-blue-500 text-xl animate-pulse"></i>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Awaiting Primary Signal</p>
      </div>
    );
  }

  const youtubeUrl = isYouTube 
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1&controls=0&enablejsapi=1&origin=${window.location.origin}`
    : '';

  const isHUDVisible = !isPlaying || showControls;

  return (
    <div 
      ref={containerRef}
      id="v-player-root" 
      className="relative w-full aspect-video rounded-[3rem] overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 bg-black animate-fade-in"
      onMouseMove={triggerControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div 
        onClick={handlePlayerClick}
        className={`absolute inset-0 z-10 cursor-pointer transition-opacity duration-500 ${isHUDVisible ? 'opacity-100' : 'opacity-0'} bg-gradient-to-t from-black/80 via-transparent to-black/40`}
      >
      </div>

      <div className={`absolute top-8 left-8 z-20 flex flex-col gap-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isHUDVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0 pointer-events-none'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
          data-tooltip={video.isFavorite ? "Signal Vaulted" : "Allocate to Vault"}
          className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-90 ${
            video.isFavorite 
            ? 'bg-red-600/30 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
            : 'bg-white/5 border-white/10 text-white hover:bg-white/20'
          }`}
        >
          <i className={`fa-${video.isFavorite ? 'solid' : 'regular'} fa-heart text-lg`}></i>
        </button>

        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-black text-white uppercase tracking-tighter drop-shadow-lg max-w-xs line-clamp-2 leading-tight">
            {video.prompt}
          </span>
        </div>
      </div>

      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isHUDVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleLike?.(); }} 
            data-tooltip={video.isLiked ? "Unlike" : "Like"} 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-90 ${
              video.isLiked 
              ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]' 
              : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <i className="fa-solid fa-thumbs-up text-lg"></i>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleDislike?.(); }} 
            data-tooltip={video.isDisliked ? "Remove Dislike" : "Dislike"} 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-90 ${
              video.isDisliked 
              ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' 
              : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <i className="fa-solid fa-thumbs-down text-lg"></i>
          </button>

          <div className="w-px h-8 bg-white/10 mx-1"></div>

          <button 
            onClick={(e) => { e.stopPropagation(); onWriteReview?.(); }} 
            data-tooltip="WRITE NEURAL IMPRESSION" 
            className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-90 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          >
            <i className="fa-solid fa-comment-medical text-lg"></i>
          </button>
        </div>
      </div>

      {isYouTube ? (
        <div className="w-full h-full relative bg-black">
          {isSyncing && (
            <div className="absolute inset-0 z-30 bg-[#020617] flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Syncing Mission Data...</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            src={youtubeUrl}
            title={video.prompt}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full object-cover pointer-events-none"
          ></iframe>
        </div>
      ) : (
        <div className="w-full h-full relative bg-black">
          <video
            key={video.url}
            ref={videoRef}
            src={video.url}
            playsInline
            className="w-full h-full object-cover"
            onPlay={() => onPlayStateChange(true)}
            onPause={() => onPlayStateChange(false)}
            onEnded={onEnded}
          />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
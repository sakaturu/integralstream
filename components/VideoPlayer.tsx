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
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  isPlaying, 
  onPlayStateChange, 
  onEnded, 
  onToggleLike, 
  onToggleDislike,
  onToggleFavorite
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSyncing, setIsSyncing] = useState(true);

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

  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [video?.id]);

  // YouTube State Detection (Message Listener)
  useEffect(() => {
    if (!isYouTube) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange' && data.info === 0) {
          onEnded?.();
        }
      } catch (e) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, onEnded]);

  // Control playback for both HTML5 Video and YouTube Iframe
  useEffect(() => {
    if (isYouTube) {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const command = isPlaying ? 'playVideo' : 'pauseVideo';
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: command,
          args: ''
        }), '*');
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isYouTube, video?.id]);

  const handlePlayerClick = () => {
    onPlayStateChange(!isPlaying);
  };

  if (!video) {
    return (
      <div className="w-full aspect-video rounded-[3rem] overflow-hidden relative border border-white/10 bg-[#020617] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <i className="fa-solid fa-signal text-blue-500 text-xl animate-pulse"></i>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Awaiting Signal</p>
      </div>
    );
  }

  // youtubeUrl should NOT depend on isPlaying to avoid iframe reloads
  const youtubeUrl = isYouTube 
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1&controls=1&enablejsapi=1&origin=${window.location.origin}`
    : '';

  return (
    <div id="v-player-root" className="relative w-full aspect-video rounded-[3rem] overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 bg-black animate-fade-in">
      
      {isYouTube ? (
        <div className="w-full h-full relative bg-black">
          {/* Interaction Overlay - captures clicks to toggle play/pause */}
          <div 
            onClick={handlePlayerClick}
            className="absolute inset-0 z-10 cursor-pointer transition-opacity duration-500 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 via-transparent to-black/40"
          >
            {/* Play/Pause Center Indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-active:scale-90 duration-300">
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-2xl ml-1`}></i>
                </div>
            </div>

            <div className="absolute top-8 left-8 flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
                className={`w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                  video.isFavorite ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-black/40 border-white/10 text-white'
                }`}
              >
                <i className={`fa-${video.isFavorite ? 'solid' : 'regular'} fa-heart text-lg`}></i>
              </button>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
              <button onClick={(e) => { e.stopPropagation(); onToggleLike?.(); }} className={`w-14 h-14 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${video.isLiked ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/40 border-white/10 text-white'}`}>
                <i className="fa-solid fa-thumbs-up text-xl"></i>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onToggleDislike?.(); }} className={`w-14 h-14 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${video.isDisliked ? 'bg-red-600 border-red-400 text-white' : 'bg-black/40 border-white/10 text-white'}`}>
                <i className="fa-solid fa-thumbs-down text-xl"></i>
              </button>
            </div>
          </div>
          {isSyncing && (
            <div className="absolute inset-0 z-20 bg-[#020617] flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Syncing Signal...</p>
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
            allowFullScreen
            className="w-full h-full object-cover"
          ></iframe>
        </div>
      ) : (
        <div className="w-full h-full relative bg-black">
          <div 
            onClick={handlePlayerClick} 
            className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center group/native"
          >
             <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-active:scale-90 duration-300">
                 <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-2xl ml-1`}></i>
             </div>
          </div>
          <video
            key={video.url}
            ref={videoRef}
            src={video.url}
            playsInline
            controls
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
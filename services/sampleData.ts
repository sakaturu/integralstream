import { VideoItem, VideoCategory, Review } from '../types';

/**
 * LIBRARY_VERSION 3600: Forced Refresh + Build Fix.
 * This version bump ensures that the local storage is ignored in favor of the fresh video set.
 */
export const LIBRARY_VERSION = 3600;

/**
 * BASE LIBRARY DATA
 * The full curated playlist to be restored to the user interface.
 */
const INITIAL_VIDEO_DATA: any[] = [
  
  {
    "id": "v-int-007",
    "prompt": "Integral Tranquility",
    "category": "Integral Serenity",
    "url": "GdNF0AXZmKc",
    "thumbnail": "https://img.youtube.com/vi/GdNF0AXZmKc/mqdefault.jpg"
  }
];

export const getSampleLibrary = (): VideoItem[] => {
  return INITIAL_VIDEO_DATA.map((item, idx) => ({
    ...item,
    timestamp: Date.now() - (idx * 100000),
    status: 'ready',
    viewCount: 0,
    likeCount: 0,
    dislikeCount: 0,
    rating: 0,
    isFavorite: false, 
    isLiked: false,
    isDisliked: false,
    reviews: []
  }));
};

export const getSurpriseVideo = (): VideoItem => {
  const pool = ['dQw4w9WgXcQ', 'CHSnz0DQw68', '5Wn4M_9-H9I', 'X_JBFLs3vAk', 'LXO-jKksQkM'];
  const id = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: `surprise-${Date.now()}`,
    prompt: "Neural Surprise Signal",
    category: 'Fav. Pick',
    url: id,
    timestamp: Date.now(),
    status: 'ready',
    viewCount: 0,
    likeCount: 0,
    dislikeCount: 0,
    rating: 0,
    isFavorite: false,
    isLiked: false,
    isDisliked: false,
    reviews: []
  };
};

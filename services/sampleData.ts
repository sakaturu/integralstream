import { VideoItem, VideoCategory, Review } from '../types';

/**
 * LIBRARY_VERSION 3200: Public Access Update.
 * This version enables open access for management features by default.
 */
export const LIBRARY_VERSION = 3200;

/**
 * BASE LIBRARY DATA
 * Refined titles and categories for all primary signals.
 */
const INITIAL_VIDEO_DATA: any[] = [

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

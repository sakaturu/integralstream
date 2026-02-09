import { VideoItem, VideoCategory, Review } from '../types';

export const LIBRARY_VERSION = 503;

/**
 * BASE LIBRARY DATA
 * Initialized as empty to allow for a clean, user-driven library.
 * Use the 'Developer' tab in the Moderation Terminal to generate code 
 * for this array after adding videos in the UI.
 */
const INITIAL_VIDEO_DATA: any[] = [];

export const getSampleLibrary = (): VideoItem[] => {
  return INITIAL_VIDEO_DATA.map((item, idx) => ({
    ...item,
    timestamp: Date.now() - (idx * 100000),
    status: 'ready',
    viewCount: Math.floor(Math.random() * 5000) + 100,
    likeCount: Math.floor(Math.random() * 500) + 20,
    dislikeCount: Math.floor(Math.random() * 50),
    rating: 4.5,
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
    category: 'Other',
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

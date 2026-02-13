import { VideoItem, VideoCategory, Review } from '../types';

/**
 * LIBRARY_VERSION 4180: Synced with deployment metadata.
 */
export const LIBRARY_VERSION = 4180;

/**
 * BASE LIBRARY DATA
 * A high-end cinematic playlist designed for a world-class experience.
 */
const INITIAL_VIDEO_DATA: any[] = [
  // Cinematic / Meditation
  {
    "id": "v-cin-001",
    "prompt": "Celestial Horizons - 8K Cinematic Universe",
    "category": "Meditation",
    "url": "njX2bu-_Vw4",
    "thumbnail": "https://img.youtube.com/vi/njX2bu-_Vw4/mqdefault.jpg"
  },
  {
    "id": "v-cin-002",
    "prompt": "Deep Forest Serenity - 432Hz Ambient",
    "category": "Meditation",
    "url": "hX3j0sQ7ot8",
    "thumbnail": "https://img.youtube.com/vi/hX3j0sQ7ot8/mqdefault.jpg"
  },
  // Integral Serenity
  {
    "id": "v-int-001",
    "prompt": "The Flow State - Integral Resonance",
    "category": "Integral Serenity",
    "url": "92HFs_eWwqc",
    "thumbnail": "https://img.youtube.com/vi/92HFs_eWwqc/mqdefault.jpg"
  },
  {
    "id": "v-int-002",
    "prompt": "Ethereal Landscapes - Floating City",
    "category": "Integral Serenity",
    "url": "1-iLCH0vXp0",
    "thumbnail": "https://img.youtube.com/vi/1-iLCH0vXp0/mqdefault.jpg"
  },
  // Permia Community
  {
    "id": "v-permia-001",
    "prompt": "Permia Community - Future Living",
    "category": "Permia Community",
    "url": "0jxDFgNmRPg",
    "thumbnail": "https://img.youtube.com/vi/0jxDFgNmRPg/mqdefault.jpg"
  },
  {
    "id": "v-permia-002",
    "prompt": "Sandbag Dome Architecture - Permia Vision",
    "category": "Permia Community",
    "url": "CFuwwO9XgQA",
    "thumbnail": "https://img.youtube.com/vi/CFuwwO9XgQA/mqdefault.jpg"
  },
  // Spanish
  {
    "id": "v-span-001",
    "prompt": "Paraíso Natural - Belleza de la Tierra",
    "category": "Spanish",
    "url": "73_1N_X_k9U",
    "thumbnail": "https://img.youtube.com/vi/73_1N_X_k9U/mqdefault.jpg"
  },
  {
    "id": "v-span-002",
    "prompt": "Meditación Guiada - Relajación Total",
    "category": "Spanish",
    "url": "MqHhPApGM0Q",
    "thumbnail": "https://img.youtube.com/vi/MqHhPApGM0Q/mqdefault.jpg"
  },
  // Fav. Picks
  {
    "id": "v-fav-001",
    "prompt": "Cyberpunk 2077 - Night City Drive Cinematic",
    "category": "Fav. Pick",
    "url": "XqYvY7F8pYI",
    "thumbnail": "https://img.youtube.com/vi/XqYvY7F8pYI/mqdefault.jpg"
  },
  {
    "id": "v-fav-002",
    "prompt": "Earth from Space - ISS 4K Footage",
    "category": "Fav. Pick",
    "url": "FG0fTKAqZ5g",
    "thumbnail": "https://img.youtube.com/vi/FG0fTKAqZ5g/mqdefault.jpg"
  }
];

export const getSampleLibrary = (): VideoItem[] => {
  return INITIAL_VIDEO_DATA.map((item, idx) => ({
    ...item,
    timestamp: Date.now() - (idx * 100000),
    status: 'ready',
    viewCount: Math.floor(Math.random() * 5000),
    likeCount: Math.floor(Math.random() * 800),
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
import { VideoItem, VideoCategory, Review } from '../types';

export const LIBRARY_VERSION = 501;

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', rating: 5, text: "Absolutely breathtaking visuals. The neural transitions are seamless!", user: "NeuralVoyager", timestamp: Date.now() - 86400000, isApproved: true }
];

/**
 * BASE LIBRARY DATA
 * To update this permanently, use the 'Save to Codebase' tool 
 * in the app's Moderation Panel and replace this file's content.
 */
const INITIAL_VIDEO_DATA = [
  { id: 'v1', prompt: "Tree of life", category: "Integral Serenity", url: "-WlazEoSDLY" },
  { id: 'v2', prompt: "Digital Zen Garden", category: "Meditation", url: "-WlazEoSDLY" },
  { id: 'v3', prompt: "Digital Zen Garden", category: "Meditation", url: "-WlazEoSDLY" },
  { id: 'v4', prompt: "Digital Zen Garden", category: "Meditation", url: "-WlazEoSDLY" },
  { id: 'v5', prompt: "Digital Zen Garden", category: "Meditation", url: "-WlazEoSDLY" },
  { id: 'v6', prompt: "Digital Zen Garden", category: "Meditation", url: "-WlazEoSDLY" },
  { id: 'v7', prompt: "Digital Zen Garden", category: "Meditation", url: "-WlazEoSDLY" }
];

export const getSampleLibrary = (): VideoItem[] => {
  return INITIAL_VIDEO_DATA.map((item, idx) => ({
    ...item,
    timestamp: Date.now() - (idx * 100000),
    status: 'ready',
    viewCount: Math.floor(Math.random() * 5000),
    likeCount: Math.floor(Math.random() * 500),
    dislikeCount: Math.floor(Math.random() * 50),
    rating: 5,
    isFavorite: idx === 0, 
    isLiked: false,
    isDisliked: false,
    reviews: idx === 0 ? MOCK_REVIEWS : []
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
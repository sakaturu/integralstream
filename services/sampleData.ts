import { VideoItem, VideoCategory, Review } from '../types';

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', rating: 5, text: "Absolutely breathtaking visuals. The neural transitions are seamless!", user: "NeuralVoyager", timestamp: Date.now() - 86400000, isApproved: true },
  { id: 'r2', rating: 4, text: "Great energy and flow. Perfect for my morning routine.", user: "ZenMaster", timestamp: Date.now() - 172800000, isApproved: true }
];

const INITIAL_VIDEO_DATA = [
  { id: 'v1', prompt: "Digital Zen Garden", category: "Meditation", url: "X_JBFLs3vAk" },
  { id: 'v2', prompt: "Cybernetic Rainforest", category: "Meditation", url: "CHSnz0DQw68" },
  { id: 'v3', prompt: "Neon Samurai Ritual", category: "Tribal", url: "2Osq2Npy_No" },
  { id: 'v4', prompt: "Ancient Future Beats", category: "Dance", url: "LXO-jKksQkM" },
  { id: 'v5', prompt: "Starlight Flow State", category: "Integral Serenity", url: "5Wn4M_9-H9I" },
  { id: 'v6', prompt: "Nebula Dreams", category: "Integral Serenity", url: "lTRiuFIWV54" },
  { id: 'v7', prompt: "Techno Shamanic Dance", category: "Dance", url: "8h8_G_o-D1w" },
  { id: 'v8', prompt: "Solstice Convergence", category: "Tribal", url: "K6_w_R_V0vE" },
  { id: 'v9', prompt: "Permia Node Alpha", category: "Permia Community", url: "dQw4w9WgXcQ" },
  { id: 'v10', prompt: "Liquid Infinity", category: "Meditation", url: "nDsjV-uN_p0" },
  { id: 'v11', prompt: "Glitch Hop Reality", category: "Dance", url: "W3_O1Vn-JdI" },
  { id: 'v12', prompt: "Sacred Geometry Pulse", category: "Meditation", url: "X_JBFLs3vAk" }
];

/**
 * Returns a robust library of sample videos.
 * This ensures the 10-row sidebar is filled on initial visit.
 */
export const getSampleLibrary = (): VideoItem[] => {
  return INITIAL_VIDEO_DATA.map((item, idx) => ({
    ...item,
    timestamp: Date.now() - (idx * 100000),
    status: 'ready',
    viewCount: Math.floor(Math.random() * 50000) + 1000,
    likeCount: Math.floor(Math.random() * 2000) + 50,
    rating: 4.5,
    isFavorite: idx < 5, // Pre-vault items for immediate 4-row testing
    isLiked: false,
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
    viewCount: Math.floor(Math.random() * 10000),
    likeCount: Math.floor(Math.random() * 500),
    rating: 4,
    isFavorite: false,
    isLiked: true,
    reviews: []
  };
};
import { VideoItem, VideoCategory, Review } from '../types';

/**
 * LIBRARY_VERSION 4191: Restored and expanded with core Environment playlist.
 */
export const LIBRARY_VERSION = 4191;

/**
 * BASE LIBRARY DATA
 * A high-end cinematic playlist designed for a world-class experience.
 */
const INITIAL_VIDEO_DATA: any[] = [
  // Integral Serenity
  {
    "id": "v-int-001",
    "prompt": "Tree of Life.",
    "category": "Integral Serenity",
    "url": "-WlazEoSDLY",
    "thumbnail": "https://img.youtube.com/vi/-WlazEoSDLY/mqdefault.jpg"
  },
  {
    "id": "v-int-002",
    "prompt": "Zen Garden",
    "category": "Integral Serenity",
    "url": "pESW6LOmVLU",
    "thumbnail": "https://img.youtube.com/vi/pESW6LOmVLU/mqdefault.jpg"
  },
  {
    "id": "v-int-003",
    "prompt": "Fly Over",
    "category": "Integral Serenity",
    "url": "GdNF0AXZmKc",
    "thumbnail": "https://img.youtube.com/vi/GdNF0AXZmKc/mqdefault.jpg"
  },
  {
    "id": "v-int-004",
    "prompt": "Plant Pot",
    "category": "Integral Serenity",
    "url": "r_QUhGDxksI",
    "thumbnail": "https://img.youtube.com/vi/r_QUhGDxksI/mqdefault.jpg"
  },
  {
    "id": "v-int-005",
    "prompt": "Personal Soak Area",
    "category": "Integral Serenity",
    "url": "AcyxEMeBDt0",
    "thumbnail": "https://img.youtube.com/vi/AcyxEMeBDt0/mqdefault.jpg"
  },
  {
    "id": "v-int-006",
    "prompt": "Love Maze",
    "category": "Integral Serenity",
    "url": "4ogk-L0sXPE",
    "thumbnail": "https://img.youtube.com/vi/4ogk-L0sXPE/mqdefault.jpg"
  },
  {
    "id": "v-int-007",
    "prompt": "Fly aound the Lake",
    "category": "Integral Serenity",
    "url": "GdusK9RtBD0",
    "thumbnail": "https://img.youtube.com/vi/GdusK9RtBD0/mqdefault.jpg"
  },
  {
    "id": "v-int-008",
    "prompt": "Rising and Moving",
    "category": "Integral Serenity",
    "url": "lX88i0yiCTw",
    "thumbnail": "https://img.youtube.com/vi/lX88i0yiCTw/mqdefault.jpg"
  },
  {
    "id": "v-int-009",
    "prompt": "Viewing zen and soak",
    "category": "Integral Serenity",
    "url": "tN65biic-uU",
    "thumbnail": "https://img.youtube.com/vi/tN65biic-uU/mqdefault.jpg"
  },
  // Permia Community
  {
    "id": "v-permia-001",
    "prompt": "Dome Architecture",
    "category": "Permia Community",
    "url": "CFuwwO9XgQA",
    "thumbnail": "https://img.youtube.com/vi/CFuwwO9XgQA/mqdefault.jpg"
  },
  {
    "id": "v-permia-002",
    "prompt": "Permia Community - Neural Living Framework",
    "category": "Permia Community",
    "url": "0jxDFgNmRPg",
    "thumbnail": "https://img.youtube.com/vi/0jxDFgNmRPg/mqdefault.jpg"
  },
  {
    "id": "v-permia-003",
    "prompt": "Permia Intentional Community V3",
    "category": "Permia Community",
    "url": "BxDtPJgK7WE",
    "thumbnail": "https://img.youtube.com/vi/BxDtPJgK7WE/mqdefault.jpg"
  },
  {
    "id": "v-permia-004",
    "prompt": "Permia Community - Sustainable Living & Architecture",
    "category": "Permia Community",
    "url": "e-i5S4AbgpA",
    "thumbnail": "https://img.youtube.com/vi/e-i5S4AbgpA/mqdefault.jpg"
  },
  {
    "id": "v-permia-005",
    "prompt": "Dome Architecture",
    "category": "Permia Community",
    "url": "2jBiBvFH5sc",
    "thumbnail": "https://img.youtube.com/vi/2jBiBvFH5sc/mqdefault.jpg"
  },
  {
    "id": "v-permia-006",
    "prompt": "Permia - The Future of Living",
    "category": "Permia Community",
    "url": "xFb2h09gHzQ",
    "thumbnail": "https://img.youtube.com/vi/xFb2h09gHzQ/mqdefault.jpg"
  },
  {
    "id": "v-permia-007",
    "prompt": "Permia - A New Way of Living",
    "category": "Permia Community",
    "url": "2O4EcYV_Gdk",
    "thumbnail": "https://img.youtube.com/vi/2O4EcYV_Gdk/mqdefault.jpg"
  },
  // Environment Playlist
  {
    "id": "v-env-002",
    "prompt": "Let there be Peace on Earth",
    "category": "Environment",
    "url": "SmruzusGWTk",
    "thumbnail": "https://img.youtube.com/vi/SmruzusGWTk/mqdefault.jpg"
  },
  {
    "id": "v-env-001",
    "prompt": "Heal the Earth - Cinematic Nature",
    "category": "Environment",
    "url": "_5aA54MD4ho",
    "thumbnail": "https://img.youtube.com/vi/_5aA54MD4ho/mqdefault.jpg"
  },
  {
    "id": "v-env-003",
    "prompt": "Earth from Above - Our Planet",
    "category": "Environment",
    "url": "pESW6LOmVLU",
    "thumbnail": "https://img.youtube.com/vi/pESW6LOmVLU/mqdefault.jpg"
  },
  {
    "id": "v-env-004",
    "prompt": "Amazon Rainforest - Vital Breath",
    "category": "Environment",
    "url": "MqHhPApGM0Q",
    "thumbnail": "https://img.youtube.com/vi/MqHhPApGM0Q/mqdefault.jpg"
  },
  // Spanish
  {
    "id": "v-span-001",
    "prompt": "Meditación Guiada - Relajación Profunda",
    "category": "Spanish",
    "url": "MqHhPApGM0Q",
    "thumbnail": "https://img.youtube.com/vi/MqHhPApGM0Q/mqdefault.jpg"
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
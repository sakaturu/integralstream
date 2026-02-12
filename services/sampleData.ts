import { VideoItem, VideoCategory, Review } from '../types';

/**
 * LIBRARY_VERSION 3500: Forced Refresh.
 * This version bump ensures that the local storage is ignored in favor of the fresh video set.
 */
export const LIBRARY_VERSION = 3500;

/**
 * BASE LIBRARY DATA
 * The full curated playlist to be restored to the user interface.
 */
const INITIAL_VIDEO_DATA: any[] = [
  {
    "id": "v-permia-001",
    "prompt": "Permia Community Spotlight",
    "category": "Permia Community",
    "url": "0jxDFgNmRPg",
    "thumbnail": "https://img.youtube.com/vi/0jxDFgNmRPg/mqdefault.jpg"
  },
  {
    "id": "v-permia-002",
    "prompt": "Permia Community Legacy",
    "category": "Permia Community",
    "url": "BxDtPJgK7WE",
    "thumbnail": "https://img.youtube.com/vi/BxDtPJgK7WE/mqdefault.jpg"
  },
  {
    "id": "v-permia-003",
    "prompt": "Permia Community Insight",
    "category": "Permia Community",
    "url": "e-i5S4AbgpA",
    "thumbnail": "https://img.youtube.com/vi/e-i5S4AbgpA/mqdefault.jpg"
  },
  {
    "id": "v-permia-004",
    "prompt": "Permia Community Vision",
    "category": "Permia Community",
    "url": "Z4X39fuYgck",
    "thumbnail": "https://img.youtube.com/vi/Z4X39fuYgck/mqdefault.jpg"
  },
  {
    "id": "v-fav-001",
    "prompt": "Heal The Earth - 432Hz Healing Frequency",
    "category": "Fav. Pick",
    "url": "_5aA54MD4ho",
    "thumbnail": "https://img.youtube.com/vi/_5aA54MD4ho/mqdefault.jpg"
  },
  {
    "id": "v-span-001",
    "prompt": "Sandbag Dome - Permia Community Spanish",
    "category": "Spanish",
    "url": "CFuwwO9XgQA",
    "thumbnail": "https://img.youtube.com/vi/CFuwwO9XgQA/mqdefault.jpg"
  },
  {
    "id": "v-span-002",
    "prompt": "Meditación Guiada - Serenity Echo",
    "category": "Spanish",
    "url": "MqHhPApGM0Q",
    "thumbnail": "https://img.youtube.com/vi/MqHhPApGM0Q/mqdefault.jpg"
  },
  {
    "id": "v-int-001",
    "prompt": "Integral Flow",
    "category": "Integral Serenity",
    "url": "-WlazEoSDLY",
    "thumbnail": "https://img.youtube.com/vi/-WlazEoSDLY/mqdefault.jpg"
  },
  {
    "id": "v-int-002",
    "prompt": "Serenity Pulse",
    "category": "Integral Serenity",
    "url": "pW-7ZuMr6vc",
    "thumbnail": "https://img.youtube.com/vi/pW-7ZuMr6vc/mqdefault.jpg"
  },
  {
    "id": "v-int-003",
    "prompt": "Integral Essence",
    "category": "Integral Serenity",
    "url": "Y3Y-weistto",
    "thumbnail": "https://img.youtube.com/vi/Y3Y-weistto/mqdefault.jpg"
  },
  {
    "id": "v-int-004",
    "prompt": "Serenity Horizons",
    "category": "Integral Serenity",
    "url": "pESW6LOmVLU",
    "thumbnail": "https://img.youtube.com/vi/pESW6LOmVLU/mqdefault.jpg"
  },
  {
    "id": "v-int-005",
    "prompt": "Deep Integral Resonance",
    "category": "Integral Serenity",
    "url": "ykXx8BjE9Io",
    "thumbnail": "https://img.youtube.com/vi/ykXx8BjE9Io/mqdefault.jpg"
  },
  {
    "id": "v-int-006",
    "prompt": "Ethereal Serenity",
    "category": "Integral Serenity",
    "url": "r_QUhGDxksI",
    "thumbnail": "https://img.youtube.com/vi/r_QUhGDxksI/mqdefault.jpg"
  },
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

import React, { useState } from 'react';
import { generateVideo } from '../services/gemini';
import { VideoItem, VideoCategory } from '../types';

interface GenerationModalProps {
  onComplete: (video: VideoItem) => void;
  onClose: () => void;
  categories: VideoCategory[];
}

const GenerationModal: React.FC<GenerationModalProps> = ({ onComplete, onClose, categories }) => {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<VideoCategory>(categories[0] || 'Other');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isGenerating) return;

    setIsGenerating(true);
    setStatus('Initializing Gemini Veo...');

    try {
      const videoUrl = await generateVideo({
        prompt,
        category,
        aspectRatio: '16:9',
        resolution: '720p'
      }, (msg) => setStatus(msg));

      const newVideo: VideoItem = {
        id: `veo-${Date.now()}`,
        prompt,
        category,
        url: videoUrl,
        timestamp: Date.now(),
        status: 'ready',
        viewCount: 0,
        likeCount: 0,
        rating: 0,
        isFavorite: false,
        isLiked: false,
        reviews: []
      };

      onComplete(newVideo);
    } catch (error) {
      alert("Generation failed. Ensure you have selected a valid paid API key and have appropriate quota.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-xl glass p-10 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {isGenerating ? (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-24 h-24 mb-8 relative">
              <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-atom text-blue-500 text-2xl animate-pulse"></i>
              </div>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] mb-4">Synthesizing Signal</h3>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">{status}</p>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-12 max-w-xs leading-relaxed">
              Gemini Veo is processing your vision. <br/> This may take 1-3 minutes. Please do not disconnect.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">New Signal Injection</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Visual Prompt</label>
                <textarea 
                  autoFocus
                  required
                  placeholder="Describe your vision in detail (e.g., A cinematic shot of a neon cyberpunk city in the rain...)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-white/10 rounded-2xl p-4 text-[11px] text-white focus:outline-none focus:border-blue-500/50 resize-none transition-all placeholder:text-slate-800"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Classification</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      type="button" 
                      onClick={() => setCategory(cat)}
                      className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                        category === cat 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full py-5 bg-white text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] hover:bg-blue-50 hover:scale-[1.02] transition-all shadow-xl"
                >
                  Initiate Synthesis
                </button>
                <div className="text-center mt-6">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[8px] font-black text-slate-700 uppercase tracking-widest hover:text-blue-500 transition-colors">
                    Requires Paid API Project <i className="fa-solid fa-external-link text-[6px] ml-1"></i>
                  </a>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerationModal;
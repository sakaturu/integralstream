import React, { useState, useEffect } from 'react';

interface LoginGateProps {
  onLogin: (pass: string, remember: boolean) => boolean;
  onForget?: () => void;
}

const LoginGate: React.FC<LoginGateProps> = ({ onLogin, onForget }) => {
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(true); // Default to true for better UX in a recurring tool
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    
    setIsVerifying(true);
    setError(false);
    
    // Cinematic verification delay
    setTimeout(() => {
      const success = onLogin(pass, remember);
      if (!success) {
        setError(true);
        setIsVerifying(false);
        setPass('');
      }
    }, 1000);
  };

  const toggleRemember = () => {
    setRemember(!remember);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-white/10 p-4 shadow-[0_0_50px_rgba(255,255,255,0.15)] mx-auto mb-8 transition-transform hover:scale-110 duration-700">
             <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M50 5 C60 20 60 35 50 50 C40 35 40 20 50 5" fill="#1d4ed8" />
                <path d="M15 30 C20 40 35 50 45 45 C40 35 25 20 15 30" fill="#dc2626" />
                <path d="M85 30 C80 40 65 50 55 45 C60 35 75 20 85 30" fill="#ea580c" />
                <path d="M10 55 C10 90 45 95 50 95" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
                <path d="M90 55 C90 90 55 95 50 95" fill="none" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                <circle cx="50" cy="72" r="12" fill="#64748b" />
             </svg>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-[0.3em] mb-2 leading-none">INTEGRAL</h1>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.5em] animate-pulse">Terminal Handshake Required</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-12 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-key"></i>
                Security Token
              </label>
              {error && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-bounce">Verification Failed</span>}
            </div>
            <div className="relative">
              <input 
                autoFocus
                type="password" 
                placeholder="TOKEN ID..."
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                disabled={isVerifying}
                className={`w-full bg-slate-950/80 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl px-8 py-5 text-center text-lg tracking-[0.6em] text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:tracking-normal placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:text-slate-800`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div 
              onClick={toggleRemember}
              className="flex items-center cursor-pointer group/toggle select-none"
            >
              <div className="relative w-12 h-7">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={remember}
                  readOnly
                />
                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${remember ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-900'}`}></div>
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 transform ${remember ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
              <div className="flex flex-col ml-4">
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${remember ? 'text-blue-400' : 'text-slate-500 group-hover/toggle:text-slate-400'}`}>
                  Remember Identity
                </span>
                <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Bypass Login on Return</span>
              </div>
            </div>

            {onForget && (
              <button 
                type="button" 
                onClick={onForget}
                className="text-[8px] font-black text-slate-800 hover:text-red-500 transition-colors uppercase tracking-[0.2em] border-b border-slate-900 pb-0.5"
              >
                Clear Cache
              </button>
            )}
          </div>

          <button 
            type="submit"
            disabled={isVerifying || !pass}
            className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] transition-all relative overflow-hidden shadow-xl ${
              isVerifying 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 cursor-wait' 
              : 'bg-white text-slate-950 hover:bg-blue-50 hover:scale-[1.02] active:scale-95 disabled:opacity-30'
            }`}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-4">
                <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                Initializing...
              </span>
            ) : (
              'Access Dashboard'
            )}
          </button>
          
          <div className="text-center">
            <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.4em] leading-relaxed max-w-[250px] mx-auto">
              Secure Terminal Connection <br/>
              Node 0xAdmin-Restricted
            </p>
          </div>
        </form>
      </div>
      
      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] z-[100] bg-[length:100%_2px,2px_100%] opacity-10"></div>
    </div>
  );
};

export default LoginGate;
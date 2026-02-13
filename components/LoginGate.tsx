import React, { useState } from 'react';

interface LoginGateProps {
  onLogin: (pass: string, remember: boolean) => boolean;
  onForget?: () => void;
  onClose?: () => void;
}

const LoginGate: React.FC<LoginGateProps> = ({ onLogin, onForget, onClose }) => {
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(true); 
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    
    setIsVerifying(true);
    setError(false);
    
    setTimeout(() => {
      const success = onLogin(pass, remember);
      if (!success) {
        setError(true);
        setIsVerifying(false);
        setPass('');
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-md animate-fade-in relative z-10">
      <div className="text-center mb-6 relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10 z-20"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
        <h1 className="text-xl font-black text-white uppercase tracking-[0.3em] mb-1 leading-none">TERMINAL ACCESS</h1>
        <p className="text-[8px] font-bold text-blue-500 uppercase tracking-[0.5em] animate-pulse">Global Admin Handshake</p>
      </div>

      <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-key"></i>
                Security Token
              </label>
              {error && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest animate-bounce">Verification Failed</span>}
            </div>
            
            <div className="relative">
              <input 
                autoFocus
                required
                type="password"
                placeholder="ENTER ADMIN TOKEN..."
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                disabled={isVerifying}
                className={`w-full bg-slate-950/80 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-6 py-4 text-center text-base tracking-[0.4em] text-white focus:outline-none focus:border-blue-500 transition-all font-mono placeholder:tracking-normal placeholder:text-[9px] placeholder:font-black placeholder:uppercase placeholder:text-slate-800`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center cursor-pointer group/toggle select-none">
              <div className="relative w-10 h-6">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${remember ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)]' : 'bg-slate-900'}`}></div>
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 transform ${remember ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <div className="flex flex-col ml-3">
                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${remember ? 'text-blue-400' : 'text-slate-500 group-hover/toggle:text-slate-400'}`}>
                  Trust Node
                </span>
                <span className="text-[6px] font-bold text-slate-800 uppercase tracking-widest">Persist Session</span>
              </div>
            </label>

            {onForget && (
              <button 
                type="button" 
                onClick={onForget}
                className="text-[7px] font-black text-slate-700 hover:text-red-500 transition-colors uppercase tracking-[0.2em] border-b border-white/5 hover:border-red-500/20 pb-0.5"
              >
                Clear Data
              </button>
            )}
          </div>

          <button 
            type="submit"
            disabled={isVerifying || !pass}
            className={`w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.4em] transition-all relative overflow-hidden shadow-xl ${
              isVerifying 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 cursor-wait' 
              : 'bg-white text-slate-950 hover:bg-blue-50 active:scale-95 disabled:opacity-30'
            }`}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                Verifying Access...
              </span>
            ) : 'Authorize Terminal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginGate;
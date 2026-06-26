import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, Shield, Compass, Calendar, ArrowRight, UserCheck, Flame, CheckCircle, Smartphone, Eye } from 'lucide-react';

const SNEAK_PEEKS = [
  {
    title: 'Brookhaven RP: Exploding The Secret Federal Reserve Vault 🏦',
    date: 'Releasing July 2',
    tier: 'Early Access',
    desc: 'Unlocking a secret developer-only doorway using a hidden Brookhaven keycard!'
  },
  {
    title: 'Testing the 10,000 Damage VOID SWORD in Bedwars Season 12 ⚔️',
    date: 'Releasing July 6',
    tier: 'VIP Leak',
    desc: 'Skyzon tests the upcoming level 50 Battlepass relic weapon in custom match lobbies.'
  }
];

export default function Perks() {
  const [username, setUsername] = useState('');
  const [wallpaperLoading, setWallpaperLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [dlUrl, setDlUrl] = useState('');
  
  // Custom design elements selected
  const [selectedStyle, setSelectedStyle] = useState<'cyber' | 'nebula' | 'gold'>('cyber');

  // Generate wallpaper on an HTML5 canvas and convert to dataURL
  const handleGenerateWallpaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setWallpaperLoading(true);
    setIsGenerated(false);

    // Short timeout to simulate professional high-quality generation
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      // HD 1080p Desktop format
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // BACKGROUND GRADIENT
      const grad = ctx.createRadialGradient(960, 540, 100, 960, 540, 1100);
      if (selectedStyle === 'cyber') {
        grad.addColorStop(0, '#100b2e');
        grad.addColorStop(0.5, '#07041a');
        grad.addColorStop(1, '#020108');
      } else if (selectedStyle === 'nebula') {
        grad.addColorStop(0, '#2e0b54');
        grad.addColorStop(0.5, '#0a0314');
        grad.addColorStop(1, '#020108');
      } else {
        grad.addColorStop(0, '#291b05');
        grad.addColorStop(0.5, '#0a0501');
        grad.addColorStop(1, '#020100');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1920, 1080);

      // CYBER GRID
      ctx.strokeStyle = selectedStyle === 'cyber' 
        ? 'rgba(6, 182, 212, 0.08)' 
        : selectedStyle === 'nebula' 
        ? 'rgba(168, 85, 247, 0.08)'
        : 'rgba(234, 179, 8, 0.06)';
      ctx.lineWidth = 2;
      const gridSize = 80;
      for (let x = 0; x < 1920; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1080);
        ctx.stroke();
      }
      for (let y = 0; y < 1080; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1920, y);
        ctx.stroke();
      }

      // BACKGROUND DECORATIVE GLOWING CIRCLES (NEBULA SHADOWS)
      ctx.shadowBlur = 180;
      ctx.shadowColor = selectedStyle === 'cyber' ? '#3b82f6' : selectedStyle === 'nebula' ? '#a855f7' : '#eab308';
      ctx.fillStyle = selectedStyle === 'cyber' ? 'rgba(59, 130, 246, 0.15)' : selectedStyle === 'nebula' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(234, 179, 8, 0.1)';
      ctx.beginPath();
      ctx.arc(300, 300, 250, 0, Math.PI * 2);
      ctx.arc(1620, 780, 250, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // DECORATIVE NEON GEOMETRIC SHAPES
      ctx.strokeStyle = selectedStyle === 'cyber' ? '#06b6d4' : selectedStyle === 'nebula' ? '#ec4899' : '#facc15';
      ctx.lineWidth = 4;
      ctx.strokeRect(200, 150, 80, 80);
      
      ctx.beginPath();
      ctx.moveTo(1700, 200);
      ctx.lineTo(1750, 280);
      ctx.lineTo(1650, 280);
      ctx.closePath();
      ctx.stroke();

      // HEADER TEXT "SKYZON SQUAD"
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px Outfit, sans-serif';
      ctx.fillStyle = selectedStyle === 'cyber' ? '#22d3ee' : selectedStyle === 'nebula' ? '#f472b6' : '#fde047';
      ctx.fillText('S K Y Z O N   S Q U A D', 960, 410);

      // USER CUSTOM GAMER NAME
      ctx.font = 'black 120px Outfit, sans-serif';
      ctx.shadowColor = selectedStyle === 'cyber' ? '#06b6d4' : selectedStyle === 'nebula' ? '#a855f7' : '#eab308';
      ctx.shadowBlur = 45;
      
      const textGrad = ctx.createLinearGradient(400, 0, 1500, 0);
      if (selectedStyle === 'cyber') {
        textGrad.addColorStop(0, '#ffffff');
        textGrad.addColorStop(0.5, '#67e8f9');
        textGrad.addColorStop(1, '#a855f7');
      } else if (selectedStyle === 'nebula') {
        textGrad.addColorStop(0, '#ffffff');
        textGrad.addColorStop(0.5, '#f472b6');
        textGrad.addColorStop(1, '#6366f1');
      } else {
        textGrad.addColorStop(0, '#ffffff');
        textGrad.addColorStop(0.5, '#fde047');
        textGrad.addColorStop(1, '#ea580c');
      }
      ctx.fillStyle = textGrad;
      ctx.fillText(username.toUpperCase(), 960, 540);
      ctx.shadowBlur = 0; // reset

      // SUB-DETAILS
      ctx.font = '500 24px Outfit, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('O F F I C I A L   C O M M U N I T Y   M E M B E R', 960, 610);

      // VECTOR HUD ACCENTS
      ctx.strokeStyle = selectedStyle === 'cyber' ? 'rgba(6, 182, 212, 0.4)' : selectedStyle === 'nebula' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(234, 179, 8, 0.3)';
      ctx.lineWidth = 2;
      
      // Left bracket
      ctx.beginPath();
      ctx.moveTo(350, 480);
      ctx.lineTo(300, 480);
      ctx.lineTo(300, 560);
      ctx.lineTo(350, 560);
      ctx.stroke();

      // Right bracket
      ctx.beginPath();
      ctx.moveTo(1570, 480);
      ctx.lineTo(1620, 480);
      ctx.lineTo(1620, 560);
      ctx.lineTo(1570, 560);
      ctx.stroke();

      // Convert to image download URL
      const dataUrl = canvas.toDataURL('image/png');
      setDlUrl(dataUrl);
      setIsGenerated(true);
      setWallpaperLoading(false);
    }, 1500);
  };

  return (
    <section id="exclusive-perks" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative">
      {/* Decorative background gradients */}
      <div className="absolute top-1/3 left-10 w-96 h-96 nebula-blue pointer-events-none z-0 opacity-40" />
      <div className="absolute bottom-10 right-10 w-96 h-96 nebula-purple pointer-events-none z-0 opacity-40" />

      {/* Title */}
      <div className="text-center mb-16 relative z-10">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#bf00ff]/10 border border-[#bf00ff]/20 text-[#bf00ff] uppercase tracking-widest mb-3 inline-block">
          Subscriber Exclusives
        </span>
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mt-1">
          EXCLUSIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bf00ff] filter drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">SQUAD PERKS</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium mt-3 opacity-85">
          Special reward vaults reserved for the inner core of Skyzon fans. Claim wallpaper assets, design badges, and review secret upcoming video content.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Dynamic Wallpaper Generator (5 Columns) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between bg-white/5 relative overflow-hidden">
          {/* Subtle decorations */}
          <div className="absolute top-0 right-0 w-20 h-20 nebula-purple pointer-events-none opacity-20" />

          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#bf00ff] uppercase flex items-center gap-1 mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              Realtime Generator
            </span>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">
              Custom Gaming Wallpapers
            </h3>
            <p className="text-xs text-white/50 leading-relaxed mb-6 font-medium">
              Enter your gaming username to instantly render a custom HD 1080p desktop wallpaper with neon accents, Cyber-Nebula vectors, and your official squad credentials!
            </p>

            <form onSubmit={handleGenerateWallpaper} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Select Vibe Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStyle('cyber')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedStyle === 'cyber'
                        ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Neon Cyber
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStyle('nebula')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedStyle === 'nebula'
                        ? 'bg-[#bf00ff]/10 border-[#bf00ff] text-[#bf00ff]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Void Nebula
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStyle('gold')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedStyle === 'gold'
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Legend Gold
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Gamer Name</label>
                <input
                  type="text"
                  placeholder="e.g. ROBLOX_PRO99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={15}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00f2ff] transition-all font-sans"
                />
              </div>

              <button
                id="generate-wallpaper-btn"
                type="submit"
                disabled={wallpaperLoading || !username.trim()}
                className="w-full py-3 bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] hover:from-[#d866ff] hover:to-[#66f7ff] disabled:opacity-50 text-white font-bold rounded-xl text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(191,0,255,0.3)]"
              >
                <Sparkles className={`w-4 h-4 ${wallpaperLoading ? 'animate-spin' : ''}`} />
                {wallpaperLoading ? 'GENERATING HD ASSET...' : 'GENERATE WALLPAPER'}
              </button>
            </form>
          </div>

          {/* Generator Result Area */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <AnimatePresence mode="wait">
              {wallpaperLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center bg-white/5 rounded-xl border border-white/10 flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[#bf00ff] border-t-transparent animate-spin mb-3" />
                  <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Compiling HD Vector Grid...</p>
                </motion.div>
              )}

              {isGenerated && !wallpaperLoading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#00f2ff]/30 shadow-lg shadow-[#00f2ff]/20">
                    <img src={dlUrl} alt="Custom generated Skyzon wallpaper preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all backdrop-blur-[2px]">
                      <span className="text-[10px] font-bold uppercase bg-slate-950 text-[#00f2ff] px-3 py-1 rounded-full border border-[#00f2ff]/25">Preview Screen</span>
                    </div>
                  </div>

                  <a
                    id="download-wallpaper-btn"
                    href={dlUrl}
                    download={`Skyzon_Squad_${username}.png`}
                    className="w-full py-2.5 bg-[#00f2ff] hover:bg-[#66f7ff] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD HD PNG
                  </a>
                </motion.div>
              )}

              {!isGenerated && !wallpaperLoading && (
                <div className="p-8 text-center bg-white/5 rounded-xl border border-dashed border-white/5">
                  <p className="text-xs text-slate-500 font-medium">No custom wallpaper generated yet. Enter name to begin!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Discord Badges & Early Sneak peeks (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Sneak Peeks Block */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between bg-white/5 relative">
            <div className="absolute top-0 right-0 w-16 h-16 nebula-cyan pointer-events-none opacity-20" />
            
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#00f2ff] uppercase flex items-center gap-1.5 mb-2">
                <Compass className="w-3.5 h-3.5" />
                SECRET ARCHIVES
              </span>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-1">
                Upcoming Video Leaks
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-5 font-medium">
                Exclusive early look at upcoming YouTube videos in development. Learn about new Roblox exploits and Brookhaven secrets before anyone else!
              </p>

              <div className="space-y-4">
                {SNEAK_PEEKS.map((peek, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#00f2ff]/15 transition-all flex items-start gap-4"
                  >
                    <div className="p-2.5 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/20 text-[#00f2ff] flex items-center justify-center font-bold text-sm">
                      #{idx + 1}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-100">{peek.title}</h4>
                        <span className="px-2 py-0.5 rounded bg-[#bf00ff]/10 border border-[#bf00ff]/20 text-[9px] font-bold uppercase text-[#bf00ff]">
                          {peek.tier}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-medium">{peek.desc}</p>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00f2ff] font-semibold pt-1">
                        <Calendar className="w-3 h-3" />
                        {peek.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Discord Role Badge Previews */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5 relative">
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-1 flex items-center gap-1.5">
              <Shield className="w-5 h-5 text-[#bf00ff]" />
              Discord Squad Badges
            </h3>
            <p className="text-xs text-white/50 mb-5 font-medium">
              Earn highly desired premium role badges in the official Skyzon Discord by playing the browser game or being active in stream chat.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#00f2ff]/10 border-2 border-[#00f2ff] flex items-center justify-center shadow-lg shadow-[#00f2ff]/20">
                  <Flame className="w-5 h-5 text-[#00f2ff]" />
                </div>
                <p className="text-xs font-black text-slate-200">CHILL RUNNER</p>
                <p className="text-[10px] text-white/50 font-medium leading-snug">Reach score 15+ in Infinite Obby game</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#bf00ff]/10 border-2 border-[#bf00ff] flex items-center justify-center shadow-lg shadow-[#bf00ff]/20">
                  <Sparkles className="w-5 h-5 text-[#bf00ff]" />
                </div>
                <p className="text-xs font-black text-slate-200">VOID WARRIOR</p>
                <p className="text-[10px] text-white/50 font-medium leading-snug">Post first high upvoted topic suggestion</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <UserCheck className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-xs font-black text-slate-200">SQUAD VIP</p>
                <p className="text-[10px] text-white/50 font-medium leading-snug">Boost server or participate in community challenges</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

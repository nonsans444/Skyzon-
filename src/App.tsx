import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Gamepad2, Sparkles, Youtube, CheckCircle, Bell, ArrowUpRight, Users } from 'lucide-react';
import Hero from './components/Hero';
import SkyVault from './components/SkyVault';
import ChillZone from './components/ChillZone';
import Perks from './components/Perks';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
}

export default function App() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('home');

  // Confetti engine
  const triggerConfetti = () => {
    setShowAlert(true);
    setShowConfetti(true);

    const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#facc15'];
    const pieces: ConfettiPiece[] = [];
    
    // Spawn 80 confetti pieces with random angles
    for (let i = 0; i < 80; i++) {
      pieces.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + window.scrollY - 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5
      });
    }

    setConfettiPieces(pieces);

    // Fade out alert after 4 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 4000);
  };

  // Run physics frame for confetti
  useEffect(() => {
    if (!showConfetti) return;

    let animId: number;

    const updateConfetti = () => {
      setConfettiPieces((prev) => {
        const updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // gravity
          }))
          // keep them on screen or within bounds
          .filter((p) => p.y < window.scrollY + window.innerHeight + 50);

        if (updated.length === 0) {
          setShowConfetti(false);
        }

        return updated;
      });

      animId = requestAnimationFrame(updateConfetti);
    };

    updateConfetti();

    return () => cancelAnimationFrame(animId);
  }, [showConfetti]);

  // Sync scroll positions for navigation active anchors
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'skyvault', 'chill-zone', 'exclusive-perks'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveAnchor(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div id="home" className="min-h-screen bg-[#050012] text-slate-100 selection:bg-[#bf00ff]/30 selection:text-[#00f2ff] relative font-sans">
      
      {/* Real-time Toast Alert */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
          >
            <div className="glass-panel p-4 rounded-xl border border-white/10 shadow-2xl flex items-start gap-3 bg-white/5 backdrop-blur-md pointer-events-auto">
              <div className="p-2 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/20 text-[#00f2ff]">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Squad Request Transmitted!
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-ping" />
                </h4>
                <p className="text-xs text-slate-400">
                  You are now synced with the Skyzon discord grid. Welcome to the elite squad!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Canvas overlays */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                transform: `rotate(${p.y * 0.5}deg)`,
                boxShadow: `0 0 8px ${p.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header bar */}
      <header className="sticky top-0 w-full z-40 glass-panel border-b border-white/10 bg-[#050012]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#00f2ff] to-[#bf00ff] rounded-lg flex items-center justify-center font-black text-xl italic text-white shadow-[0_0_20px_rgba(191,0,255,0.5)] group-hover:scale-105 transition-transform">
              S
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
              Sky<span className="text-[#00f2ff]">zon</span>
            </h1>
          </a>

          {/* Desktop Anchor Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className={`text-xs font-bold uppercase tracking-widest transition-all ${
                activeAnchor === 'home' ? 'text-[#00f2ff] opacity-100 border-b-2 border-[#00f2ff] pb-0.5' : 'text-white/75 hover:text-[#00f2ff] hover:opacity-100'
              }`}
            >
              Base
            </a>
            <a
              href="#skyvault"
              className={`text-xs font-bold uppercase tracking-widest transition-all ${
                activeAnchor === 'skyvault' ? 'text-[#00f2ff] opacity-100 border-b-2 border-[#00f2ff] pb-0.5' : 'text-white/75 hover:text-[#00f2ff] hover:opacity-100'
              }`}
            >
              SkyVault
            </a>
            <a
              href="#chill-zone"
              className={`text-xs font-bold uppercase tracking-widest transition-all ${
                activeAnchor === 'chill-zone' ? 'text-[#00f2ff] opacity-100 border-b-2 border-[#00f2ff] pb-0.5' : 'text-white/75 hover:text-[#00f2ff] hover:opacity-100'
              }`}
            >
              Chill Zone
            </a>
            <a
              href="#exclusive-perks"
              className={`text-xs font-bold uppercase tracking-widest transition-all ${
                activeAnchor === 'exclusive-perks' ? 'text-[#00f2ff] opacity-100 border-b-2 border-[#00f2ff] pb-0.5' : 'text-white/75 hover:text-[#00f2ff] hover:opacity-100'
              }`}
            >
              Squad Perks
            </a>
          </nav>

          {/* Header Action CTA Button */}
          <div className="flex items-center gap-3">
            <a
              id="discord-header-btn"
              href="https://discord.gg/SFBkdypGY5"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#5865F2] to-[#7289da] px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(88,101,242,0.4)] hover:scale-105 transition-all text-white"
            >
              <Users className="w-4 h-4 text-white" />
              Join the Squad
            </a>
          </div>

        </div>
      </header>

      {/* Main landing screen views */}
      <main className="relative">
        <Hero onSquadJoined={triggerConfetti} />
        <SkyVault />
        <ChillZone />
        <Perks />
      </main>

      {/* Premium Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-white/10 bg-[#04000f] relative overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] nebula-blue pointer-events-none opacity-20" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 mb-8">
          
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00f2ff] to-[#bf00ff] flex items-center justify-center font-black text-white text-xs italic shadow-[0_0_15px_rgba(191,0,255,0.4)]">
                S
              </div>
              <span className="text-xl font-black italic uppercase tracking-tighter text-white">
                Sky<span className="text-[#00f2ff]">zon</span>
              </span>
            </div>
            <p className="text-xs text-white/50 max-w-sm font-medium">
              The premier immersive fan-base portal for YouTuber Skyzon. Join, play, level up, and conquer. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60 font-medium">
            <a href="#home" className="hover:text-[#00f2ff] transition-colors">Back to Top</a>
            <span className="text-white/20">•</span>
            <a href="#skyvault" className="hover:text-[#00f2ff] transition-colors">Video Vault</a>
            <span className="text-white/20">•</span>
            <a href="#chill-zone" className="hover:text-[#00f2ff] transition-colors">Obby Game</a>
            <span className="text-white/20">•</span>
            <a href="#exclusive-perks" className="hover:text-[#00f2ff] transition-colors">Wallpaper Maker</a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs text-white/40">Designed & Crafted for the Skyzon Fanbase</p>
            <p className="text-[10px] font-mono text-[#00f2ff]/80 mt-1 flex items-center justify-center md:justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff] animate-pulse" />
              GRID STATUS: OPERATIONAL
            </p>
          </div>

        </div>

        {/* Footer Ticker */}
        <div className="max-w-7xl mx-auto pt-4 border-t border-white/5 flex items-center justify-between overflow-hidden relative z-10">
          <div className="flex gap-8 whitespace-nowrap overflow-hidden">
            <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.3em] animate-pulse">
              System Status: Optimal // Subscribers: 450K+ // Online: 1,402 // Global Milestone: 50% reached
            </p>
          </div>
          <div className="flex gap-3 items-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]"></div>
            <span className="text-[10px] font-mono opacity-60 uppercase">Live Feed Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

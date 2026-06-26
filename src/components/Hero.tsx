import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Users, Flame, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface HeroProps {
  onSquadJoined: () => void;
}

export default function Hero({ onSquadJoined }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [squadCount, setSquadCount] = useState(48291);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch or increment the global "Join" counter to gamify the squad membership
  useEffect(() => {
    async function loadStats() {
      try {
        const statsRef = doc(db, 'stats', 'community');
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          if (data.totalClicks) {
            setSquadCount(48291 + data.totalClicks);
          }
        } else {
          await setDoc(statsRef, { totalClicks: 0, totalWins: 0 });
        }
      } catch (err) {
        console.warn("Failed to fetch community stats:", err);
      }
    }
    loadStats();
  }, []);

  const handleJoinSquad = async () => {
    // Open Discord in a new tab (using standard target="_blank")
    window.open('https://discord.gg/SFBkdypGY5', '_blank', 'noopener,noreferrer');
    
    // Increment total clicks count in Firebase
    try {
      const statsRef = doc(db, 'stats', 'community');
      const statsSnap = await getDoc(statsRef);
      let newClicks = 1;
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        newClicks = (data.totalClicks || 0) + 1;
        await updateDoc(statsRef, { totalClicks: newClicks });
      } else {
        await setDoc(statsRef, { totalClicks: 1, totalWins: 0 });
      }
      setSquadCount(48291 + newClicks);
    } catch (err) {
      console.warn("Could not increment stats:", err);
      setSquadCount(prev => prev + 1);
    }
    onSquadJoined();
  };

  // Cyber space matrix canvas backdrop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899'];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid overlay lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw lines between close particles
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16 px-4 md:px-8 border-b border-purple-900/40">
      {/* Background Matrix Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Cyber Nebulas */}
      <div className="absolute -top-40 -left-40 w-96 h-96 nebula-purple pointer-events-none z-0 opacity-60" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 nebula-blue pointer-events-none z-0 opacity-60" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] nebula-cyan pointer-events-none z-0 opacity-40" />

      {/* High-quality video highlight background of Roblox (YouTube Loop) */}
      <div className="absolute inset-0 w-full h-full opacity-15 pointer-events-none z-0 overflow-hidden mix-blend-screen">
        <iframe
          src={`https://www.youtube.com/embed/S2O6-LksnC4?autoplay=1&mute=1&controls=0&loop=1&playlist=S2O6-LksnC4&showinfo=0&rel=0&iv_load_policy=3&playsinline=1`}
          className="w-[100vw] h-[56.25vw] min-h-full min-w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Floating Status Badges */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-6"
        >
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase bg-purple-950/60 border border-purple-500/40 text-purple-300 backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
            Roblox Bedwars Pro
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase bg-blue-950/60 border border-blue-500/40 text-blue-300 backdrop-blur-md">
            <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
            Live Highlights Inside
          </span>
        </motion.div>

        {/* Massive Futuristic Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="relative mb-6 select-none"
        >
          {/* Neon shadow backing */}
          <div className="absolute inset-0 blur-2xl opacity-45 bg-gradient-to-r from-[#bf00ff] via-[#00f2ff]/80 to-[#bf00ff] rounded-full scale-90" />
          
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] via-white to-[#bf00ff] filter drop-shadow-[0_0_20px_rgba(191,0,255,0.5)] animate-glow relative font-sans leading-none">
            SKYZON
          </h1>
          
          <div className="absolute -top-3 -right-3 rotate-12 bg-[#00f2ff] text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00f2ff]/30">
            Official
          </div>
        </motion.div>

        {/* Subheading / YouTuber Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-2xl text-slate-300 max-w-2xl mb-10 font-light tracking-wide leading-relaxed"
        >
          Step into the ultimate <span className="text-[#00f2ff] font-semibold">Cyber-Nebula</span> hub. Join over{' '}
          <span className="text-[#bf00ff] font-bold animate-pulse">450K+ subscribers</span> for daily elite speedruns, obbys, and insane Bedwars trolls!
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center px-4"
        >
          {/* Main Discord Squad Button */}
          <button
            id="join-squad-btn"
            onClick={handleJoinSquad}
            className="group relative px-8 py-4 w-full sm:w-auto rounded-xl font-bold text-lg text-white bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] hover:from-[#d866ff] hover:to-[#66f7ff] transition-all duration-300 overflow-hidden shadow-lg shadow-[#bf00ff]/40 cursor-pointer"
          >
            {/* Glossy sheen */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-30deg] -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
            
            <span className="flex items-center justify-center gap-3">
              <Users className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              JOIN THE SQUAD
              <Sparkles className="w-4 h-4 text-white animate-bounce" />
            </span>
          </button>

          {/* Scroll to Obby Button */}
          <a
            id="play-obby-hero-btn"
            href="#chill-zone"
            className="px-8 py-4 w-full sm:w-auto rounded-xl font-bold text-lg text-slate-200 border border-white/10 hover:border-[#00f2ff] bg-white/5 hover:bg-white/10 transition-all duration-300 text-center backdrop-blur-md"
          >
            PLAY INFINITE OBBY
          </a>
        </motion.div>

        {/* Squad Counter Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 py-3 px-6 rounded-full glass-panel flex items-center gap-3 text-sm border border-white/10"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff] animate-ping" />
          <span className="text-slate-400">
            Squad Click Counter:{' '}
            <strong className="text-[#00f2ff] font-mono text-base font-semibold">
              {squadCount.toLocaleString()}
            </strong>
          </span>
        </motion.div>
      </div>
    </section>
  );
}

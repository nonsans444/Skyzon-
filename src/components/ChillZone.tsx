import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Award, Crown, Gamepad2, Zap } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, addDoc, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LeaderboardEntry } from '../types';

export default function ChillZone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  
  // User name entry
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalWins, setGlobalWins] = useState(13429);

  // Audio state
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalId = useRef<number | null>(null);

  // Load High Scores and Community Wins from Firestore
  const loadLeaderboard = async () => {
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(8));
      const querySnapshot = await getDocs(q);
      const items: LeaderboardEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          username: data.username,
          score: data.score,
          timestamp: data.timestamp,
        });
      });
      setLeaderboard(items);

      // Fetch global wins
      const statsRef = doc(db, 'stats', 'community');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        if (data.totalWins) {
          setGlobalWins(13429 + data.totalWins);
        }
      }
    } catch (err) {
      console.warn("Could not load high scores from Firestore:", err);
      // Fallback local leaderboard
      setLeaderboard([
        { id: 'lb_1', username: 'SkyFan_99', score: 42, timestamp: '' },
        { id: 'lb_2', username: 'NoobCrasher', score: 35, timestamp: '' },
        { id: 'lb_3', username: 'BedwarsGod', score: 28, timestamp: '' },
        { id: 'lb_4', username: 'LavaDodge', score: 19, timestamp: '' },
      ]);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Web Audio Procedural Lo-Fi Music Generator
  const startSynthMusic = () => {
    if (isMuted) return;
    try {
      // Create or resume AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Relaxing 4-chord progression progression: Cmaj7 - Am7 - Fmaj7 - G6
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 349.23], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G6
      ];

      let chordIdx = 0;
      let stepIdx = 0;

      const playLofiBeat = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        
        const now = audioCtxRef.current.currentTime;
        
        // Every 4 beats, switch chords
        if (stepIdx % 4 === 0) {
          const currentChord = chords[chordIdx];
          chordIdx = (chordIdx + 1) % chords.length;

          // Warm ambient pad notes
          currentChord.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            // Soft sine or triangle waves for lofi feel
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.04, now + 1); // Slow attack
            gainNode.gain.setValueAtTime(0.04, now + 3);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4); // Slow release
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 4);
          });
        }

        // Sub-bass soft kick drum
        if (stepIdx % 2 === 0) {
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          
          kickOsc.frequency.setValueAtTime(100, now);
          kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
          
          kickGain.gain.setValueAtTime(0.12, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          
          kickOsc.connect(kickGain);
          kickGain.connect(ctx.destination);
          
          kickOsc.start(now);
          kickOsc.stop(now + 0.3);
        }

        // Lo-fi high-hat tick
        if (stepIdx % 2 === 1) {
          const hatGain = ctx.createGain();
          // Simulating noise with a high-pass filtered wave
          const bufferSize = ctx.sampleRate * 0.05;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          
          hatGain.gain.setValueAtTime(0.01, now);
          hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          
          noise.connect(hatGain);
          hatGain.connect(ctx.destination);
          
          noise.start(now);
          noise.stop(now + 0.05);
        }

        stepIdx++;
      };

      // Set beat interval
      const beatInterval = 1200; // ~50 BPM for lo-fi zen relaxation
      playLofiBeat(); // initial play
      const intervalId = window.setInterval(playLofiBeat, beatInterval);
      audioIntervalId.current = intervalId;

    } catch (err) {
      console.warn("Synth audio creation failed:", err);
    }
  };

  const stopSynthMusic = () => {
    if (audioIntervalId.current) {
      clearInterval(audioIntervalId.current);
      audioIntervalId.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // Toggle mute button
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
      stopSynthMusic();
    }
  };

  // Start music when unmuted
  useEffect(() => {
    if (!isMuted && isPlaying) {
      startSynthMusic();
    } else {
      stopSynthMusic();
    }
    return () => stopSynthMusic();
  }, [isMuted, isPlaying]);

  // Handle high score submission
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage("Enter your gamertag first!");
      return;
    }
    if (username.length < 2 || username.length > 15) {
      setErrorMessage("Gamertag must be 2 to 15 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const entryId = 'lb_' + Math.random().toString(36).substring(2, 9);
      
      // Submit entry to Firestore
      await addDoc(collection(db, 'leaderboard'), {
        username: username.trim(),
        score: score,
        timestamp: new Date().toISOString()
      });

      // Increment community wins count as a reward
      const statsRef = doc(db, 'stats', 'community');
      const statsSnap = await getDoc(statsRef);
      let winsToSave = 1;
      if (statsSnap.exists()) {
        winsToSave = (statsSnap.data().totalWins || 0) + 1;
        await updateDoc(statsRef, {
          totalWins: winsToSave
        });
      } else {
        await setDoc(statsRef, {
          totalClicks: 0,
          totalWins: 1
        });
      }

      setGlobalWins(13429 + winsToSave);
      setHasSubmitted(true);
      loadLeaderboard();
    } catch (err) {
      console.error("Failed to upload score:", err);
      setErrorMessage("Failed to submit score. Try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Game canvas runtime engine
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas scaling
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    let animationFrameId: number;

    // Game Objects
    const player = {
      x: 80,
      y: height - 100,
      width: 28,
      height: 28,
      vy: 0,
      gravity: 0.55,
      jumpForce: -11.5,
      isGrounded: false,
      doubleJumpsLeft: 1,
      dashCooldown: 0,
      dashActiveTicks: 0,
      dashSpeed: 12,
      rotation: 0
    };

    let gameSpeed = 4.2;
    let scoreStars = 0;
    let frameCount = 0;

    interface Star {
      x: number;
      y: number;
      size: number;
      collected: boolean;
      pulse: number;
    }

    interface Obstacle {
      x: number;
      y: number;
      width: number;
      height: number;
      type: 'spike' | 'laser' | 'box';
    }

    let stars: Star[] = [];
    let obstacles: Obstacle[] = [];

    // Trigger double jump
    const jump = () => {
      if (player.isGrounded) {
        player.vy = player.jumpForce;
        player.isGrounded = false;
        player.doubleJumpsLeft = 1;
      } else if (player.doubleJumpsLeft > 0) {
        player.vy = player.jumpForce * 0.9;
        player.doubleJumpsLeft = 0;
      }
    };

    // Trigger dash
    const dash = () => {
      if (player.dashCooldown === 0) {
        player.dashActiveTicks = 8;
        player.dashCooldown = 60; // cooldown ticks
      }
    };

    // Inputs hook
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'KeyD' || e.code === 'ShiftLeft' || e.code === 'KeyX') {
        e.preventDefault();
        dash();
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      e.preventDefault();
      // Click on canvas triggers a jump
      jump();
    };

    const handleCanvasTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasTouch);

    // Main Game Loop
    const gameLoop = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Increase speed very slowly
      if (frameCount % 600 === 0) {
        gameSpeed += 0.4;
      }

      // BACKGROUND DECORATIVE GRID & NEBULAS
      ctx.fillStyle = '#0a0521';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid lines rolling back
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.lineWidth = 1;
      const gridScroll = (frameCount * (gameSpeed * 0.5)) % 40;
      for (let x = -gridScroll; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Floor ground bar
      const groundY = height - 50;
      ctx.fillStyle = '#1e114d';
      ctx.fillRect(0, groundY, width, 50);
      
      // Floor glow line
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // UPDATE PLAYER PHYSICS
      if (player.dashActiveTicks > 0) {
        // Active Dashing
        player.vy = 0; // suspend gravity
        player.dashActiveTicks--;
        player.rotation += 0.3;

        // Spawn beautiful trail particles
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fillRect(player.x - 15, player.y + Math.random() * player.height, 10, 10);
      } else {
        // Standard gravity updates
        player.vy += player.gravity;
        player.y += player.vy;
        
        if (!player.isGrounded) {
          player.rotation += 0.08;
        } else {
          // Align rotation slightly to floor
          player.rotation = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
        }
      }

      // Ground bounds collision
      if (player.y + player.height >= groundY) {
        player.y = groundY - player.height;
        player.vy = 0;
        player.isGrounded = true;
        player.doubleJumpsLeft = 1;
      } else {
        player.isGrounded = false;
      }

      if (player.dashCooldown > 0) {
        player.dashCooldown--;
      }

      // DRAW PLAYER (Neon Box)
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.rotate(player.rotation);
      
      // Cyber-Nebula Player glow styling
      ctx.shadowColor = player.dashActiveTicks > 0 ? '#06b6d4' : '#8b5cf6';
      ctx.shadowBlur = 15;
      ctx.fillStyle = player.dashActiveTicks > 0 ? '#06b6d4' : '#a78bfa';
      ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
      
      // Roblox Face inside box
      ctx.fillStyle = '#030014';
      ctx.fillRect(-8, -6, 4, 4); // eye
      ctx.fillRect(4, -6, 4, 4);  // eye
      ctx.fillRect(-6, 2, 12, 3);  // mouth
      
      ctx.restore();

      // SPAWN ELEMENTS (Stars & Obstacles)
      // Stars spawning
      if (frameCount % 90 === 0 && Math.random() > 0.3) {
        stars.push({
          x: width + 50,
          y: groundY - 60 - Math.random() * 100,
          size: 14,
          collected: false,
          pulse: 0
        });
      }

      // Obstacles spawning
      if (frameCount % 120 === 0) {
        const randType = Math.random() > 0.55 ? 'spike' : 'box';
        const obsHeight = randType === 'box' ? 32 + Math.random() * 20 : 35;
        obstacles.push({
          x: width + 50,
          y: groundY - obsHeight,
          width: 25,
          height: obsHeight,
          type: randType
        });
      }

      // UPDATE & DRAW STARS
      stars.forEach((star) => {
        star.x -= gameSpeed;
        star.pulse += 0.15;

        if (star.collected) return;

        // Collision Check with player
        const starCenterX = star.x;
        const starCenterY = star.y;
        
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        const dist = Math.sqrt(
          (starCenterX - playerCenterX) ** 2 + (starCenterY - playerCenterY) ** 2
        );

        if (dist < 28) {
          star.collected = true;
          scoreStars += 1;
          setScore(scoreStars);
        }

        // Render Star
        if (!star.collected) {
          ctx.save();
          ctx.translate(star.x, star.y);
          ctx.rotate(star.pulse * 0.2);
          
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#facc15';
          
          // Draw star polygon
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 8, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 8);
            ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 4, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 4);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // UPDATE & DRAW OBSTACLES
      let triggerGameOver = false;

      obstacles.forEach((obs) => {
        obs.x -= gameSpeed;

        // Draw obstacle
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#f87171';

        if (obs.type === 'spike') {
          // Draw low poly triangle spike
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
        } else {
          // Box brick
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeStyle = '#b91c1c';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }
        ctx.restore();

        // Collision check (Bounding Box)
        const padX = 4;
        const padY = 4;
        if (
          player.x + padX < obs.x + obs.width &&
          player.x + player.width - padX > obs.x &&
          player.y + padY < obs.y + obs.height &&
          player.y + player.height - padY > obs.y
        ) {
          // If dashing, break the brick box without taking damage! (Except spikes!)
          if (player.dashActiveTicks > 0 && obs.type === 'box') {
            // Smash box effect
            obs.x = -500; // instant despawn
            scoreStars += 1; // get point for smashing obstacle!
            setScore(scoreStars);
          } else {
            triggerGameOver = true;
          }
        }
      });

      // Cleanup offscreen objects
      stars = stars.filter((s) => s.x > -50);
      obstacles = obstacles.filter((o) => o.x > -50);

      // GAME OVER HANDLE
      if (triggerGameOver) {
        setIsGameOver(true);
        setIsPlaying(false);
        if (scoreStars > highScore) {
          setHighScore(scoreStars);
        }
        stopSynthMusic();
        return;
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Begin loop
    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('touchstart', handleCanvasTouch);
      }
    };
  }, [isPlaying, isGameOver]);

  const handleStartGame = () => {
    setScore(0);
    setIsGameOver(false);
    setHasSubmitted(false);
    setIsPlaying(true);
    if (!isMuted) {
      startSynthMusic();
    }
  };

  return (
    <section id="chill-zone" className="py-24 px-4 md:px-8 border-t border-b border-white/10 relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 left-10 w-80 h-80 nebula-cyan pointer-events-none z-0 opacity-40" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 nebula-purple pointer-events-none z-0 opacity-40" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8 items-start relative z-10">
        
        {/* Game Area (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-1.5 flex items-center gap-2 text-white">
                <Gamepad2 className="w-8 h-8 text-[#00f2ff]" />
                THE CHILL ZONE
              </h2>
              <p className="text-xs text-white/50 font-mono uppercase tracking-widest">
                COLLECT SKYSTARS • AVOID THE VOID
              </p>
            </div>

            {/* Quick Controls Info */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-white/70 uppercase bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10">
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-slate-200">SPACE / CLICK</span>
              <span>Jump</span>
              <span className="text-[#00f2ff]">•</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-slate-200">D KEY</span>
              <span>Dash Smash</span>
            </div>
          </div>

          {/* Main Obby Stage Screen */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-[#060318]">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Game Screen Overlays */}
            <AnimatePresence mode="wait">
              {/* Menu start overlay */}
              {!isPlaying && !isGameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#bf00ff] to-[#00f2ff] flex items-center justify-center mb-4 animate-bounce shadow-[0_0_20px_rgba(191,0,255,0.4)]">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Infinite Obby</h3>
                  <p className="text-xs text-white/60 max-w-sm mb-6 mt-1 font-medium leading-relaxed">
                    A physics obby test. Grab SkyStars, dodge incoming lasers, and power the global squad milestone!
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      id="start-obby-btn"
                      onClick={handleStartGame}
                      className="px-6 py-3 bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] hover:from-[#d866ff] hover:to-[#66f7ff] text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#bf00ff]/35 transition-all transform hover:scale-105 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      PLAY NOW
                    </button>

                    <button
                      onClick={handleToggleMute}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-all cursor-pointer"
                      title={isMuted ? "Unmute Lo-Fi synth" : "Mute music"}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[#00f2ff]" />}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Game HUD Overlay */}
              {isPlaying && (
                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none select-none">
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-slate-200">
                      STARS:{' '}
                      <strong className="text-yellow-400 font-mono text-base ml-1">
                        {score}
                      </strong>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-slate-300">
                      HI SCORE:{' '}
                      <strong className="text-[#00f2ff] font-mono text-sm ml-1">
                        {highScore}
                      </strong>
                    </div>
                  </div>

                  {/* Volume Button during gameplay */}
                  <button
                    onClick={handleToggleMute}
                    className="p-2.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white pointer-events-auto cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00f2ff]" />}
                  </button>
                </div>
              )}

              {/* Game Over Screen Overlay */}
              {isGameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30"
                >
                  <h3 className="text-3xl font-black text-[#bf00ff] italic uppercase tracking-tighter mb-2">RUN COMPLETED</h3>
                  
                  <div className="mb-6 flex gap-6">
                    <div className="text-center">
                      <p className="text-xs text-white/50 uppercase tracking-widest font-mono mb-1">Stars Collected</p>
                      <p className="text-4xl font-black text-yellow-400 font-mono">{score}</p>
                    </div>
                    <div className="border-r border-white/10" />
                    <div className="text-center">
                      <p className="text-xs text-white/50 uppercase tracking-widest font-mono mb-1">Your Personal Best</p>
                      <p className="text-4xl font-black text-[#00f2ff] font-mono">{highScore}</p>
                    </div>
                  </div>

                  {/* Upload Score Form if high score is saved */}
                  {!hasSubmitted ? (
                    <form onSubmit={handleSubmitScore} className="w-full max-w-sm bg-white/5 p-4 rounded-xl border border-white/10 mb-6 space-y-3">
                      <p className="text-xs text-white/70 font-medium">
                        Submit score to the <strong className="text-[#00f2ff]">Global Top Chiller</strong> board!
                      </p>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Your GamerTag"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={isSubmitting}
                          className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00f2ff] transition-all font-sans"
                        />
                        <button
                          id="submit-score-btn"
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] hover:from-[#d866ff] hover:to-[#66f7ff] disabled:opacity-50 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                          {isSubmitting ? 'Posting...' : 'Submit'}
                        </button>
                      </div>
                      {errorMessage && <p className="text-[11px] text-red-400 font-semibold">{errorMessage}</p>}
                    </form>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-xs px-4 py-2.5 rounded-xl font-bold mb-6 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      Score submitted! Look at your position on the Leaderboard!
                    </motion.div>
                  )}

                  {/* Action row */}
                  <div className="flex gap-4">
                    <button
                      id="retry-obby-btn"
                      onClick={handleStartGame}
                      className="px-6 py-3 bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] hover:from-[#d866ff] hover:to-[#66f7ff] text-white font-bold rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(191,0,255,0.4)]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      TRY AGAIN
                    </button>
                    
                    <button
                      onClick={handleToggleMute}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-all cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[#00f2ff]" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick instructions bar */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Stars Score</p>
              <p className="text-lg font-black text-yellow-400 font-mono">{score}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Speed Multiplier</p>
              <p className="text-lg font-black text-[#00f2ff] font-mono">x1.2</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Best Star Run</p>
              <p className="text-lg font-black text-[#bf00ff] font-mono">{highScore}</p>
            </div>
          </div>
        </div>

        {/* Community Leaderboard & Milestones (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestone gamification card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden bg-white/5">
            {/* Pulsing beacon decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 nebula-purple pointer-events-none opacity-20" />
            
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-1.5 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00f2ff]" />
              SQUAD MILESTONES
            </h3>
            <p className="text-xs text-white/50 mb-5 leading-relaxed font-medium">
              When you submit your highscore, you increase the collective wins and unlock awesome subscriber tiers.
            </p>

            <div className="space-y-4">
              {/* Progress bar to next goal */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Squad Wins Milestone: Tier 4</span>
                  <span className="text-[#00f2ff] font-mono">{globalWins.toLocaleString()} / 20,000</span>
                </div>
                
                <div className="w-full h-3 rounded-full bg-black/40 border border-white/5 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] rounded-full shadow-[0_0_10px_rgba(0,242,255,0.4)]"
                    style={{ width: `${(globalWins / 20000) * 100}%` }}
                  />
                </div>
              </div>

              {/* Perks rewards tiers list */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase text-[#bf00ff]">Tier 3 (10K Wins)</p>
                  <p className="text-xs text-white/80 font-bold mt-1">Unlocked Wallpapers 🔓</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Tier 4 (20K Wins)</p>
                  <p className="text-xs text-white/40 font-bold mt-1">Custom Character Maker 🔒</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden bg-white/5 h-[362px] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-1 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400/10" />
                TOP CHILLERS PODIUM
              </h3>
              <p className="text-xs text-white/50 mb-4 font-medium">
                Real-time leaderboard of gamers who conquered the Obby.
              </p>

              {/* Leaders list */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {leaderboard.map((entry, idx) => {
                  const isTopOne = idx === 0;

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isTopOne
                          ? 'bg-gradient-to-r from-purple-950/30 to-yellow-950/20 border-yellow-500/30 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                          : 'bg-black/30 border-white/5 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center font-mono text-xs font-bold">
                          {isTopOne ? (
                            <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/10 animate-pulse" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span className="text-sm font-bold truncate max-w-[120px]">
                          @{entry.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-xs text-slate-400">score:</span>
                        <strong className={`text-sm ${isTopOne ? 'text-yellow-400' : 'text-[#00f2ff]'}`}>
                          {entry.score}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total community count footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-semibold">
              <span className="flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                Leaderboard Active
              </span>
              <span className="text-[#00f2ff]">Auto-updates dynamically</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

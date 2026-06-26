import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Flame, Sparkles, Filter, Plus, ArrowUp, ThumbsUp, Calendar, Eye, Clock } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SkyVideo, VideoSuggestion } from '../types';

// Static Premium Curated Videos
const PRESET_VIDEOS: SkyVideo[] = [
  {
    id: 'vid_1',
    title: 'I Trapped 100 Players in the IMPOSSIBLE Glass Obby! 😱',
    views: '342,810 views',
    duration: '14:20',
    date: '2 days ago',
    category: 'Obby',
    youtubeId: 'S2O6-LksnC4',
    thumbnail: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=640&auto=format&fit=crop' // Roblox vibe gameplay style image
  },
  {
    id: 'vid_2',
    title: 'Using ILLEGAL Hacks in Roblox Bedwars (Trolling) 🤫',
    views: '512,044 views',
    duration: '18:05',
    date: '5 days ago',
    category: 'Trolling',
    youtubeId: 'S2O6-LksnC4',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=640&auto=format&fit=crop'
  },
  {
    id: 'vid_3',
    title: 'The New NEBULA Update in Bedwars is INSANE! 🌌',
    views: '280,120 views',
    duration: '12:15',
    date: '1 week ago',
    category: 'Update',
    youtubeId: 'S2O6-LksnC4',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640&auto=format&fit=crop'
  },
  {
    id: 'vid_4',
    title: 'My FASTEST Speedrun Ever (Top 1% Obby) 🏆',
    views: '195,430 views',
    duration: '10:45',
    date: '2 weeks ago',
    category: 'Highlights',
    youtubeId: 'S2O6-LksnC4',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=640&auto=format&fit=crop'
  },
  {
    id: 'vid_5',
    title: 'I Pretended to be a NOOB in Brookhaven RP... 😭',
    views: '670,900 views',
    duration: '22:10',
    date: '3 weeks ago',
    category: 'Trolling',
    youtubeId: 'S2O6-LksnC4',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=640&auto=format&fit=crop'
  },
  {
    id: 'vid_6',
    title: 'Infinite Void Glitch in Bedwars Season 12! 💀',
    views: '411,000 views',
    duration: '15:30',
    date: '1 month ago',
    category: 'Bedwars',
    youtubeId: 'S2O6-LksnC4',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=640&auto=format&fit=crop'
  }
];

export default function SkyVault() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  
  // Suggestions Board State
  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [votedIds, setVotedIds] = useState<string[]>([]);

  // Categories list
  const categories = ['All', 'Bedwars', 'Obby', 'Trolling', 'Update', 'Highlights'];

  // Load user-submitted ideas from Firestore
  const loadSuggestions = async () => {
    try {
      const q = query(collection(db, 'suggestions'), orderBy('votes', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const items: VideoSuggestion[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title,
          username: data.username,
          votes: data.votes,
          timestamp: data.timestamp,
        });
      });
      setSuggestions(items);
    } catch (err) {
      console.warn("Could not load suggestions from Firestore:", err);
      // Fallback local mock data
      setSuggestions([
        { id: 'mock_s_1', title: '100 Speedrunners vs 1 Lava Floor Obby', username: 'GamerKid4', votes: 124, timestamp: '' },
        { id: 'mock_s_2', title: 'Trolling Roblox Admins with Fake Hack Client', username: 'BloxLord', votes: 98, timestamp: '' },
        { id: 'mock_s_3', title: 'I survived Bedwars without buying any items challenge', username: 'SkyFan3', votes: 65, timestamp: '' }
      ]);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleCreateSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUsername.trim()) {
      setErrorMsg('Please fill in both the title and username!');
      return;
    }
    if (newTitle.length < 5 || newTitle.length > 80) {
      setErrorMsg('Title must be between 5 and 80 characters!');
      return;
    }
    if (newUsername.length < 2 || newUsername.length > 15) {
      setErrorMsg('Username must be between 2 and 15 characters!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const tempId = 'id_' + Math.random().toString(36).substring(2, 9);
      const payload = {
        title: newTitle.trim(),
        username: newUsername.trim(),
        votes: 1,
        timestamp: new Date().toISOString()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'suggestions'), payload);
      
      setVotedIds(prev => [...prev, docRef.id]);
      setNewTitle('');
      setNewUsername('');
      loadSuggestions();
    } catch (err) {
      console.error("Error creating suggestion:", err);
      setErrorMsg("Failed to post suggestion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string) => {
    if (votedIds.includes(id)) return; // Prevent double voting

    try {
      // Optimistic update
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, votes: s.votes + 1 } : s));
      setVotedIds(prev => [...prev, id]);

      // Save to Firestore
      const docRef = doc(db, 'suggestions', id);
      await updateDoc(docRef, {
        votes: increment(1)
      });
    } catch (err) {
      console.warn("Vote failed on server:", err);
    }
  };

  const filteredVideos = PRESET_VIDEOS.filter(
    (video) => selectedCategory === 'All' || video.category === selectedCategory
  );

  return (
    <section id="skyvault" className="py-24 px-4 md:px-8 max-w-7xl mx-auto cyber-grid relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 right-10 w-80 h-80 nebula-blue pointer-events-none z-0 opacity-40" />
      <div className="absolute bottom-10 left-10 w-80 h-80 nebula-purple pointer-events-none z-0 opacity-40" />

      {/* Header Info */}
      <div className="text-center mb-16 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#00f2ff] uppercase bg-[#00f2ff]/10 px-3 py-1 rounded-full border border-[#00f2ff]/20">
            Vault Archives
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
          THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bf00ff] filter drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">SKYVAULT</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium mt-3 opacity-85">
          Access the archives of Skyzon's ultimate gaming footage. Check latest stats, filter by series, and upvote the next video topic!
        </p>
      </div>

      {/* Embedded Dynamic Video Player Modal or Showcase */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setActiveVideoId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl glass-panel rounded-2xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideoId(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center font-bold border border-purple-500/30 transition-all cursor-pointer"
              >
                ✕
              </button>
              
              <div className="aspect-video w-full bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Videos Feed (2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            <span className="text-slate-400 text-sm font-semibold flex items-center gap-1.5 mr-2">
              <Filter className="w-4 h-4" />
              Filter Series:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] text-white shadow-md shadow-[#bf00ff]/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Videos Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group rounded-2xl overflow-hidden glass-panel glass-panel-hover flex flex-col h-full border border-white/10 relative bg-white/5"
                >
                  {/* Thumbnail Wrapper with Hover-Pop */}
                  <div 
                    className="relative aspect-video w-full overflow-hidden cursor-pointer bg-slate-900"
                    onClick={() => setActiveVideoId(video.youtubeId)}
                  >
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity" />
                    
                    {/* Thumbnail Image */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Video Badge */}
                    <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded bg-[#bf00ff]/90 text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                      {video.category}
                    </span>

                    {/* Duration Counter */}
                    <span className="absolute bottom-3 right-3 z-20 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </span>

                    {/* Large Play Icon that pops on hover */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <div className="w-14 h-14 rounded-full bg-[#00f2ff]/90 text-slate-950 flex items-center justify-center shadow-lg shadow-[#00f2ff]/50">
                        <Play className="w-6 h-6 fill-slate-950 translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-[#00f2ff] transition-colors">
                        {video.title}
                      </h3>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/50 font-medium">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#00f2ff]" />
                        {video.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#bf00ff]" />
                        {video.date}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Squad Idea Board Sidebar (1 column) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col h-full bg-white/5 relative">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-16 h-16 nebula-cyan pointer-events-none opacity-20" />

          <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 mb-2 text-white">
            <Sparkles className="w-5 h-5 text-[#00f2ff] fill-[#00f2ff]/20" />
            SQUAD IDEA BOARD
          </h3>
          <p className="text-xs text-white/50 mb-6 font-medium">
            Suggest a video topic you want Skyzon to make! Fans upvote the best ideas. Top ideas get a pinned comment!
          </p>

          {/* Submissions form */}
          <form onSubmit={handleCreateSuggestion} className="space-y-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#bf00ff]">Submit Idea</h4>
            
            <input
              type="text"
              placeholder="Gamer Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00f2ff] transition-all font-sans"
            />

            <input
              type="text"
              placeholder="What video should Skyzon film next?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00f2ff] transition-all font-sans"
            />

            {errorMsg && <p className="text-[11px] text-red-400 font-semibold">{errorMsg}</p>}

            <button
              id="submit-suggestion-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-gradient-to-r from-[#bf00ff] to-[#00f2ff] hover:from-[#d866ff] hover:to-[#66f7ff] disabled:opacity-50 text-white font-bold rounded-lg text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(191,0,255,0.3)]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              {isSubmitting ? 'Posting...' : 'Post To Board'}
            </button>
          </form>

          {/* Suggestions List */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px] pr-1">
            <AnimatePresence initial={false}>
              {suggestions.map((sug) => {
                const alreadyVoted = votedIds.includes(sug.id);
                return (
                  <motion.div
                    key={sug.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3 hover:border-white/10 transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-200 leading-snug">
                        "{sug.title}"
                      </p>
                      <p className="text-[10px] font-mono text-[#00f2ff]">
                        by @{sug.username}
                      </p>
                    </div>

                    <button
                      id={`vote-${sug.id}`}
                      onClick={() => handleVote(sug.id)}
                      disabled={alreadyVoted}
                      className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg border transition-all ${
                        alreadyVoted
                          ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white cursor-pointer'
                      }`}
                    >
                      <ArrowUp className={`w-4 h-4 ${alreadyVoted ? 'animate-bounce' : ''}`} />
                      <span className="text-xs font-mono font-bold">{sug.votes}</span>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {suggestions.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-8">
                No suggestions yet. Be the first to post!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

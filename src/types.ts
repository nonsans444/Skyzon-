export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  timestamp: string;
}

export interface GlobalStats {
  totalClicks: number;
  totalWins: number;
}

export interface VideoSuggestion {
  id: string;
  title: string;
  username: string;
  votes: number;
  timestamp: string;
  isVoted?: boolean;
}

export interface SkyVideo {
  id: string;
  title: string;
  views: string;
  thumbnail: string;
  duration: string;
  date: string;
  category: 'Bedwars' | 'Obby' | 'Trolling' | 'Update' | 'Highlights';
  youtubeId: string;
}

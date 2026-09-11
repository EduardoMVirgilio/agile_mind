import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WordSearchGame = {
  id: string;
  timeMs: number;
  wordCount: number;
  gridSize: number;
  playedAt: string;
};

type WordSearchRankingState = {
  games: WordSearchGame[];
  addGame: (game: Omit<WordSearchGame, 'id' | 'playedAt'>) => void;
};

export const useWordSearchRanking = create<WordSearchRankingState>()(
  persist(
    (set) => ({
      games: [],
      addGame: (game) =>
        set((state) => ({
          games: [...state.games, {
            ...game,
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            playedAt: new Date().toISOString(),
          }].sort((a, b) => a.timeMs - b.timeMs),
        })),
    }),
    { name: 'agile-mind-word-search-ranking' },
  ),
);

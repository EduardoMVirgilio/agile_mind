import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NumberConnectGame = {
  id: string;
  timeMs: number;
  numberCount: number;
  cells: number;
  playedAt: string;
};

type NumberConnectRankingState = {
  games: NumberConnectGame[];
  addGame: (game: Omit<NumberConnectGame, 'id' | 'playedAt'>) => void;
};

export const useNumberConnectRanking = create<NumberConnectRankingState>()(
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
    { name: 'agile-mind-number-connect-ranking' },
  ),
);

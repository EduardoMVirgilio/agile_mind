import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EulerPatternGame = {
  id: string;
  timeMs: number;
  level: number;
  errors: number;
  playedAt: string;
};

type EulerPatternRankingState = {
  games: EulerPatternGame[];
  addGame: (game: Omit<EulerPatternGame, 'id' | 'playedAt'>) => void;
};

export const useEulerPatternRanking = create<EulerPatternRankingState>()(
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
    { name: 'agile-mind-euler-pattern-ranking' },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SudokuGame = {
  id: string;
  timeMs: number;
  size: 4 | 9;
  playedAt: string;
};

type SudokuRankingState = {
  games: SudokuGame[];
  addGame: (game: Omit<SudokuGame, 'id' | 'playedAt'>) => void;
};

export const useSudokuRanking = create<SudokuRankingState>()(
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
    { name: 'agile-mind-sudoku-ranking' },
  ),
);

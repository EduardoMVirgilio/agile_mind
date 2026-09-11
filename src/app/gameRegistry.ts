import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { GameProps, GameType } from '../types/game';

type PlayableGameType = Exclude<GameType, 'menu'>;

const NumberConnect = lazy(() =>
  import('../games/NumberConnect').then(({ NumberConnect: component }) => ({
    default: component,
  })),
);

const WordSearch = lazy(() =>
  import('../games/WordSearch').then(({ WordSearch: component }) => ({
    default: component,
  })),
);

const MiniSudoku = lazy(() =>
  import('../games/MiniSudoku').then(({ MiniSudoku: component }) => ({
    default: component,
  })),
);

const EulerPattern = lazy(() =>
  import('../games/EulerPattern').then(({ EulerPattern: component }) => ({
    default: component,
  })),
);

export const gameComponents: Record<
  PlayableGameType,
  LazyExoticComponent<ComponentType<GameProps>>
> = {
  'number-connect': NumberConnect,
  'word-search': WordSearch,
  sudoku: MiniSudoku,
  euler: EulerPattern,
};

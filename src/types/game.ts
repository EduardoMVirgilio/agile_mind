export type GameType = 'menu' | 'number-connect' | 'word-search' | 'sudoku' | 'euler';

export type GameProps = {
  onMenu?: () => void;
};

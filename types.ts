import { LETTER_STATUS, GAME_PHASES } from "./constants";

export interface WordleBoardProps {
  guesses: string[];
  currentGuess?: string;
  targetWord?: string;
  size?: "normal" | "mini";
  showCurrentGuess?: boolean;
  className?: string;
  results?: LetterResult[][];
}

export interface GameSession {
  gameId: string;
  targetWord: string;
  guesses: string[];
  gameOver: boolean;
  won: boolean;
  createdAt: string;
  lastUpdated: string;
}

// Letter result type for game logic
export interface LetterResult {
  letter: string;
  status: typeof LETTER_STATUS[keyof typeof LETTER_STATUS];
}

// Player state interface used across all game modes
export interface PlayerState {
  guesses: string[];
  currentGuess: string;
  gameOver: boolean;
  won: boolean;
  targetWord: string;
  score: number;
}

// Game score interface for multiplayer
export interface GameScore {
  player: number;
  bot: number;
  rounds: number;
}

// Game phase types
export type GamePhase = typeof GAME_PHASES[keyof typeof GAME_PHASES];

// Word selection mode for multiplayer
export type WordSelectionMode = "custom" | "auto";

// Custom stat interface for GameStats component
export interface CustomStat {
  label: string;
  value: string;
}

// Shared component prop types
export interface GameHeaderProps {
  title: string;
  subtitle: string;
  gameId?: string;
}

export interface GameStatsProps {
  guessCount: number;
  mode?: string;
  targetWord?: string;
  showDebugTarget?: boolean;
  customStats?: CustomStat[];
}

export interface GameOverModalProps {
  gameOver: boolean;
  won: boolean;
  guessCount: number;
  targetWord?: string;
  gameId?: string;
  onPlayAgain: () => void;
  playAgainText?: string;
  customVictoryIcon?: string;
  customVictoryTitle?: string;
  customVictoryMessage?: string;
  customDefeatIcon?: string;
  customDefeatTitle?: string;
  customDefeatMessage?: string;
}

export interface LoadingSpinnerProps {
  message?: string;
}

export interface GuessInputProps {
  currentGuess: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  gameOver: boolean;
  loading: boolean;
  disabled?: boolean;
  submitButtonText?: string;
  placeholder?: string;
}

// Keyboard handler utilities types
export interface KeyboardHandlerProps {
  currentGuess: string;
  setCurrentGuess: (value: string | ((prev: string) => string)) => void;
  gameOver: boolean;
  loading: boolean;
  onEnter: () => void;
}
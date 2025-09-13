// Game Configuration Constants
export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

// Word Lists
export const WORDS = [
  "HELLO", "WORLD", "QUITE", "FANCY", "FRESH", "PANIC", "CRAZY", "BUGGY",
  "BRAVE", "GHOST", "CHAIR", "MAGIC", "PHONE", "QUICK", "SMILE", "DANCE",
  "LIGHT", "WATER", "BEACH", "MUSIC", "PEACE", "HAPPY", "DREAM", "STORY",
  "CLOUD", "FRUIT", "SPACE", "HEART", "BLOOM", "STONE", "RIVER", "FOREST"
];

// Game Phase Types (for multiplayer)
export const GAME_PHASES = {
  SETUP: "setup",
  WORD_SELECTION: "wordSelection", 
  PLAYING: "playing",
  ROUND_END: "roundEnd"
} as const;

// Timing Constants
export const WORD_SELECTION_TIME = 10; // seconds for user to select word
export const ROUND_END_COUNTDOWN = 8; // seconds between rounds

// Letter Status Types
export const LETTER_STATUS = {
  CORRECT: "correct",
  PRESENT: "present", 
  ABSENT: "absent"
} as const;

// CSS Classes for letter statuses
export const LETTER_STATUS_CLASSES = {
  [LETTER_STATUS.CORRECT]: "letter-correct",
  [LETTER_STATUS.PRESENT]: "letter-present",
  [LETTER_STATUS.ABSENT]: "letter-absent"
} as const;

// Game Phase Types (for multiplayer)
export const GAME_PHASES = {
  SETUP: "setup",
  WORD_SELECTION: "wordSelection",
  PLAYING: "playing",
  ROUND_END: "roundEnd"
} as const;

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
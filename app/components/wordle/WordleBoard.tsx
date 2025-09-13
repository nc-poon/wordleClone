"use client";
import {
  LetterResult,
  checkGuess,
  MAX_GUESSES,
  WORD_LENGTH,
} from "../../../utils/wordleUtils";
import "./wordle.css";

interface WordleBoardProps {
  guesses: string[];
  currentGuess?: string;
  targetWord?: string;
  size?: "normal" | "mini";
  showCurrentGuess?: boolean;
  className?: string;
  results?: LetterResult[][];
}

// size = "normal" for single board, "mini" for 2 board / multiplayer
export default function WordleBoard({
  guesses,
  currentGuess = "",
  targetWord = "",
  size = "normal",
  showCurrentGuess = true,
  className = "",
  results = [],
}: WordleBoardProps) {
  // Get letter result for a specific guess and position
  const getLetterResult = (
    guess: string,
    guessIndex: number
  ): LetterResult[] => {
    // Use pre-computed results if available
    if (results[guessIndex]) {
      return results[guessIndex];
    }
    // Compute result if we have the target word
    if (targetWord) {
      return checkGuess(guess, targetWord);
    }
    // Return empty array if no target word (for server mode)
    return [];
  };

  // Get CSS classes for a letter box
  const getLetterBoxClasses = (
    letter: string,
    hasResult: boolean,
    status?: LetterResult["status"]
  ): string => {
    const baseClass = size === "mini" ? "mini-letter-box" : "letter-box";
    let statusClass = "";

    if (hasResult && status) {
      statusClass = status;
    } else if (letter) {
      statusClass = "filled";
    } else {
      statusClass = "empty";
    }

    return `${baseClass} ${statusClass}`;
  };

  // Render single row, iterate rowIndex 0,1,2 ....
  const renderGuessRow = (rowIndex: number) => {
    const guess = guesses[rowIndex];
    const isCurrentRow = showCurrentGuess && rowIndex === guesses.length;
    const isCompletedRow = guess && targetWord;

    return (
      <div
        key={rowIndex}
        className={`guess-row flex gap-${size === "mini" ? "1" : "2"} mb-${
          size === "mini" ? "1" : "2"
        } ${isCurrentRow ? "current-row" : ""} ${
          isCompletedRow ? "completed-row" : ""
        }`}
      >
        {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
          const letter = isCurrentRow
            ? currentGuess[colIndex] || ""
            : guess?.[colIndex] || "";

          const result = guess ? getLetterResult(guess, rowIndex) : [];
          const hasResult = result.length > 0;
          const status = result[colIndex]?.status; // correct,present,absent

          return (
            <div
              key={colIndex}
              className={getLetterBoxClasses(letter, hasResult, status)}
              style={{
                animationDelay: hasResult ? `${colIndex * 0.1}s` : undefined,
              }}
            >
              <span className="letter-content">{letter}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`wordle-board ${
        size === "mini" ? "mini-game-board" : "game-board"
      } ${className}`}
    >
      {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) =>
        renderGuessRow(rowIndex)
      )}
    </div>
  );
}

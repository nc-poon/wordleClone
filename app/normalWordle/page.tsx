"use client";
import { useState, useEffect } from "react";
import WordleBoard from "../components/wordle/WordleBoard";
import {
  getRandomWord,
  isGameOver,
  hasWon,
  MAX_GUESSES,
  WORD_LENGTH,
} from "../../utils/wordleUtils";
import ".././wordle.css";

export default function NormalWordle() {
  const [targetWord, setTargetWord] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize game
  const initializeGame = () => {
    setLoading(true);
    const word = getRandomWord();
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setLoading(false);
  };

  // Make a guess
  const makeGuess = () => {
    if (currentGuess.length !== WORD_LENGTH || gameOver || loading) return;

    // add to list of guesses
    const newGuesses = [...guesses, currentGuess];
    // check guess
    const playerWon = hasWon(currentGuess, targetWord);
    // check if game over, player win or max tries
    const gameEnded = isGameOver(newGuesses, playerWon);

    setGuesses(newGuesses);
    setCurrentGuess("");
    setWon(playerWon);
    setGameOver(gameEnded);
  };

  // Handle keyboard input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    e.preventDefault(); // prevent double firing, maybe only in dev mode...
    if (gameOver || loading) return;

    if (e.key === "Enter") {
      makeGuess();
    } else if (e.key === "Backspace") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      // only alphabet both lower and upper then we convert all to upper
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + e.key.toUpperCase());
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGuess(e.target.value.toUpperCase().slice(0, WORD_LENGTH));
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Render game over content
  const renderGameOverContent = () => {
    if (won) {
      return (
        <div className="victory-content">
          <div className="victory-icon animate-bounce">🎉</div>
          <h3 className="victory-title">Congratulations!</h3>
          <p className="victory-text">
            You guessed "<span className="word-highlight">{targetWord}</span>"
            in <span className="attempts-highlight">{guesses.length}</span>{" "}
            attempts!
          </p>
        </div>
      );
    } else {
      return (
        <div className="gameover-content">
          <div className="gameover-icon">💭</div>
          <h3 className="gameover-title">Game Over</h3>
          <p className="gameover-text">
            The word was: <span className="word-highlight">{targetWord}</span>
          </p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8 animate-pulse">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-slate-500">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="game-container" onKeyDown={handleKeyPress} tabIndex={0}>
      {/* Game Header */}
      <div className="text-center mb-6 game-header">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 animate-slide-down">
          Normal Wordle
        </h2>
        <p className="text-sm text-slate-500 animate-fade-in">
          Classic wordle gameplay - guess the 5-letter word!
        </p>
      </div>

      {/* Game Board */}
      <div className="mb-6">
        <WordleBoard
          guesses={guesses}
          currentGuess={currentGuess}
          targetWord={targetWord}
          showCurrentGuess={true}
        />
      </div>

      {/* Input Section */}
      <div className="input-section mb-6">
        <div className="current-guess-input mb-4">
          <input
            type="text"
            value={currentGuess}
            onChange={handleInputChange}
            maxLength={WORD_LENGTH}
            className="guess-input"
            placeholder="Enter your guess..."
            disabled={gameOver || loading}
            autoFocus
          />
        </div>

        <button
          onClick={makeGuess}
          disabled={currentGuess.length !== WORD_LENGTH || gameOver || loading}
          className={`submit-button ${
            currentGuess.length === WORD_LENGTH && !gameOver && !loading
              ? "active"
              : "disabled"
          }`}
        >
          <span className="button-content">Submit Guess</span>
        </button>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal animate-scale-in">
            <div className="modal-content">
              {renderGameOverContent()}

              <button
                onClick={initializeGame}
                className="play-again-button animate-pulse-subtle"
              >
                <span>🔄 Play Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Stats */}
      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Guesses:</span>
          <span className="stat-value">
            {guesses.length}/{MAX_GUESSES}
          </span>
        </div>
        {/* Debug Section */}
        <div className="stat-item debug-info">
          <span className="stat-label">Target:</span>
          <span className="stat-value debug-target">{targetWord}</span>
        </div>
      </div>
    </div>
  );
}

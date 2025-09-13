"use client";
import { useState, useEffect } from "react";
import WordleBoard from "../components/wordle/WordleBoard";
import {
  LetterResult,
  MAX_GUESSES,
  WORD_LENGTH,
} from "../../utils/wordleUtils";
import ".././wordle.css";

interface GameSession {
  gameId: string;
  targetWord: string;
  guesses: string[];
  gameOver: boolean;
  won: boolean;
}

export default function ServerWordle() {
  const [gameId, setGameId] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // Change this to store ALL results, not just the last one
  const [allResults, setAllResults] = useState<LetterResult[][]>([]);

  // create new game session
  const createGameSession = async (): Promise<GameSession> => {
    const response = await fetch("/wordle_api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create" }),
    });

    if (!response.ok) {
      throw new Error("Failed to create game session");
    }

    return response.json();
  };

  // check result with server
  const submitGuess = async (
    gameId: string,
    guess: string
  ): Promise<{
    result: LetterResult[];
    isCorrect: boolean;
    gameOver: boolean;
    won: boolean;
  }> => {
    const response = await fetch("/wordle_api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "guess",
        gameId,
        guess,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit guess");
    }

    return response.json();
  };

  // Initialize game
  const initializeGame = async () => {
    setLoading(true);
    try {
      const session = await createGameSession();
      setGameId(session.gameId);
      setGuesses([]);
      setCurrentGuess("");
      setGameOver(false);
      setWon(false);
      setAllResults([]); // Reset all results
      setLoading(false);
    } catch (error) {
      console.error("Failed to initialize server:", error);
      setLoading(false);
    }
  };

  // Make a guess
  const makeGuess = async () => {
    if (currentGuess.length !== WORD_LENGTH || gameOver || loading || !gameId)
      return;
    setLoading(true);
    try {
      const result = await submitGuess(gameId, currentGuess);
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      // APPEND the new result to all results instead of replacing
      setAllResults((prevResults) => [...prevResults, result.result]);

      setWon(result.won);
      setGameOver(result.gameOver);
    } catch (error) {
      console.error("Failed to make guess:", error);
    }

    setLoading(false);
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

  // Now you have all results stored in allResults
  // No need to prepare boardResults - just use allResults directly

  // Render game over content
  const renderGameOverContent = () => {
    if (won) {
      return (
        <div className="victory-content">
          <div className="victory-icon animate-bounce">🎉</div>
          <h3 className="victory-title">Congratulations!</h3>
          <p className="victory-text">
            You won in{" "}
            <span className="attempts-highlight">{guesses.length}</span>{" "}
            attempts!
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Game ID:{" "}
            <code className="bg-slate-100 px-2 py-1 rounded">{gameId}</code>
          </p>
        </div>
      );
    } else {
      return (
        <div className="gameover-content">
          <div className="gameover-icon">💭</div>
          <h3 className="gameover-title">Game Over</h3>
          <p className="gameover-text">Better luck next time!</p>
          <p className="text-sm text-slate-500 mt-2">
            Game ID:{" "}
            <code className="bg-slate-100 px-2 py-1 rounded">{gameId}</code>
          </p>
        </div>
      );
    }
  };

  if (loading && !gameId) {
    return (
      <div className="text-center p-8 animate-pulse">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-slate-500">Creating game session...</p>
      </div>
    );
  }

  return (
    <div
      className="wordle-game game-container"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Game Header */}
      <div className="text-center mb-6 game-header">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 animate-slide-down">
          Server/Client Wordle
        </h2>
        <p className="text-sm text-slate-500 animate-fade-in">
          All validation happens on the server. You won't know the target word!
        </p>
        {gameId && (
          <p className="text-xs text-slate-400 mt-2">
            Session:{" "}
            <code className="bg-slate-100 px-2 py-1 rounded text-xs">
              {gameId}
            </code>
          </p>
        )}
      </div>

      {/* Game Board */}
      <div className="mb-6">
        <WordleBoard
          guesses={guesses}
          currentGuess={currentGuess}
          showCurrentGuess={true}
          results={allResults} // Use allResults instead of boardResults
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
          disabled={
            currentGuess.length !== WORD_LENGTH ||
            gameOver ||
            loading ||
            !gameId
          }
          className={`submit-button ${
            currentGuess.length === WORD_LENGTH &&
            !gameOver &&
            !loading &&
            gameId
              ? "active"
              : "disabled"
          }`}
        >
          <span className="button-content">
            {loading ? (
              <>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </>
            ) : (
              "Submit to Server"
            )}
          </span>
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
                <span>🔄 New Game Session</span>
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
        <div className="stat-item">
          <span className="stat-label">Mode:</span>
          <span className="stat-value">Server</span>
        </div>
      </div>
    </div>
  );
}

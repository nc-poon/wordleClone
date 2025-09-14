"use client";
import { useState, useEffect } from "react";
import WordleBoard from "@/app/components/wordle/WordleBoard";
import GameHeader from "@/app/components/shared/GameHeader";
import GameStats from "@/app/components/shared/GameStats";
import GameOverModal from "@/app/components/shared/GameOverModal";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import GuessInput from "@/app/components/shared/GuessInput";
import BackToHome from "@/app/components/shared/BackToHome";
import { WORD_LENGTH } from "@/gameConfigs";
import { LetterResult, GameSession } from "@/types";
import { isValidWord } from "@/utils/wordleUtils";
import {
  createKeyboardHandler,
  createInputChangeHandler,
} from "@/utils/shared/keyboardUtils";

export default function ServerWordle() {
  const [gameId, setGameId] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [allResults, setAllResults] = useState<LetterResult[][]>([]);
  const [targetWord, setTargetWord] = useState<string>("");

  // create new game session
  const createGameSession = async (): Promise<GameSession> => {
    const response = await fetch("/game/wordle_api/game", {
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
    targetWord?: string;
  }> => {
    const response = await fetch("/game/wordle_api/game", {
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
      setAllResults([]);
      setTargetWord("");
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
    
    // Validate word first
    const wordIsValid = await isValidWord(currentGuess);
    if (!wordIsValid) {
      alert("Not a valid word!");
      return;
    }
    
    setLoading(true);
    try {
      const result = await submitGuess(gameId, currentGuess);
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");
      setAllResults((prevResults) => [...prevResults, result.result]);

      setWon(result.won);
      setGameOver(result.gameOver);
      
      // Set target word if game is over
      if (result.gameOver && result.targetWord) {
        setTargetWord(result.targetWord);
      }
    } catch (error) {
      console.error("Failed to make guess:", error);
    }

    setLoading(false);
  };

  // Handle keyboard input
  const handleKeyPress = createKeyboardHandler({
    currentGuess,
    setCurrentGuess,
    gameOver,
    loading,
    onEnter: makeGuess,
  });

  // Handle input change
  const handleInputChange = createInputChangeHandler(setCurrentGuess);

  useEffect(() => {
    initializeGame();
  }, []);

  if (loading && !gameId) {
    return <LoadingSpinner message="Creating game session..." />;
  }

  return (
    <div
      className="wordle-game game-container"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="mb-4">
        <BackToHome />
      </div>
      <GameHeader
        title="Server/Client Wordle"
        subtitle="All validation happens on the server."
        gameId={gameId}
      />
      <div className="mb-6">
        <WordleBoard
          guesses={guesses}
          currentGuess={currentGuess}
          showCurrentGuess={true}
          results={allResults}
        />
      </div>
      <GuessInput
        currentGuess={currentGuess}
        onInputChange={handleInputChange}
        onSubmit={makeGuess}
        gameOver={gameOver}
        loading={loading}
        disabled={!gameId}
        submitButtonText="Submit to Server"
      />
      <GameOverModal
        gameOver={gameOver}
        won={won}
        guessCount={guesses.length}
        targetWord={targetWord}
        gameId={gameId}
        onPlayAgain={initializeGame}
        playAgainText="🔄 New Game Session"
      />
      <GameStats guessCount={guesses.length} mode="Server" />
    </div>
  );
}

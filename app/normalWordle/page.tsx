"use client";
import { useState, useEffect } from "react";
import WordleBoard from "@/app/components/wordle/WordleBoard";
import GameHeader from "@/app/components/shared/GameHeader";
import GameStats from "@/app/components/shared/GameStats";
import GameOverModal from "@/app/components/shared/GameOverModal";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import GuessInput from "@/app/components/shared/GuessInput";
import { getRandomWord, isGameOver, hasWon } from "@/utils/wordleUtils";
import { WORD_LENGTH } from "@/constants";
import {
  createKeyboardHandler,
  createInputChangeHandler,
} from "@/utils/shared/keyboardUtils";

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

  if (loading) {
    return <LoadingSpinner message="Loading game..." />;
  }

  return (
    <div className="game-container" onKeyDown={handleKeyPress} tabIndex={0}>
      <GameHeader title="Normal Wordle" subtitle="Classic wordle" />
      <div className="mb-6">
        <WordleBoard
          guesses={guesses}
          currentGuess={currentGuess}
          targetWord={targetWord}
          showCurrentGuess={true}
        />
      </div>
      <GuessInput
        currentGuess={currentGuess}
        onInputChange={handleInputChange}
        onSubmit={makeGuess}
        gameOver={gameOver}
        loading={loading}
        submitButtonText="Submit Guess"
      />
      <GameOverModal
        gameOver={gameOver}
        won={won}
        guessCount={guesses.length}
        targetWord={targetWord}
        onPlayAgain={initializeGame}
        playAgainText="🔄 Play Again"
      />
      <GameStats
        guessCount={guesses.length}
        targetWord={targetWord}
        showDebugTarget={true}
      />
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import WordleBoard from "@/app/components/wordle/WordleBoard";
import GameHeader from "@/app/components/shared/GameHeader";
import GameStats from "@/app/components/shared/GameStats";
import GameOverModal from "@/app/components/shared/GameOverModal";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import GuessInput from "@/app/components/shared/GuessInput";
import BackToHome from "@/app/components/shared/BackToHome";
import {
  getRandomWord,
  isGameOver,
  hasWon,
  findAbsurdleCandidates,
} from "@/utils/wordleUtils";
import {
  createKeyboardHandler,
  createInputChangeHandler,
} from "@/utils/shared/keyboardUtils";
import { WORDS, WORD_LENGTH, DEBUG } from "@/gameConfigs";

export default function Absurdle() {
  const [targetWord, setTargetWord] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<string[]>(WORDS);

  // Initialize game
  const initializeGame = () => {
    setLoading(true);
    const word = getRandomWord();
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setCandidates([...WORDS]);
    setLoading(false);
  };

  // Make a guess with absurdle logic
  const makeGuess = () => {
    if (currentGuess.length !== WORD_LENGTH || gameOver || loading) return;

    // Find candidates that give least helpful feedback
    const candidatesResult = findAbsurdleCandidates(currentGuess, candidates);
    setCandidates(candidatesResult);

    let playerWon = false;
    let newTargetWord = targetWord;

    if (candidatesResult.length === 1) {
      // Only one candidate left, set it as target
      newTargetWord = candidatesResult[0];
      setTargetWord(newTargetWord);
      playerWon = hasWon(currentGuess, newTargetWord);
    } else if (candidatesResult.length === 0) {
      // No candidates left, player wins
      playerWon = true;
    } else {
      // Multiple candidates, keep current target
      playerWon = hasWon(currentGuess, targetWord);
    }

    const newGuesses = [...guesses, currentGuess];
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
    <div
      className="wordle-game game-container"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="mb-4">
        <BackToHome />
      </div>
      <GameHeader
        title="Absurdle (Host Cheating)"
        subtitle="The word changes to avoid your guesses! Can you beat the cheating host?"
      />
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
        playAgainText="🔄 Challenge Again"
        customVictoryIcon="🎉"
        customVictoryTitle="Amazing!"
        customVictoryMessage={`You beat the cheating host! Final word was "${targetWord}" in ${guesses.length} attempts!`}
        customDefeatIcon="😈"
        customDefeatTitle="Host Wins!"
        customDefeatMessage={`The cheating host got you! The final word was: ${targetWord}`}
      />
      <GameStats
        guessCount={guesses.length}
        targetWord={
          candidates.length === 1 ? targetWord : candidates.join(", ")
        }
        showDebugTarget={DEBUG}
        customStats={[
          {
            label: "Candidates",
            value: candidates.length.toString(),
          },
        ]}
      />
    </div>
  );
}

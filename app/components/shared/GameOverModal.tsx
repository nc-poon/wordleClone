import React from "react";
import "./GameOverModal.css";
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

export default function GameOverModal({
  gameOver,
  won,
  guessCount,
  targetWord,
  gameId,
  onPlayAgain,
  playAgainText = "🔄 Play Again",
  customVictoryIcon,
  customVictoryTitle,
  customVictoryMessage,
  customDefeatIcon,
  customDefeatTitle,
  customDefeatMessage,
}: GameOverModalProps) {
  if (!gameOver) return null;

  const renderGameOverContent = () => {
    if (won) {
      return (
        <div className="victory-content">
          <div className="victory-icon animate-bounce">
            {customVictoryIcon || "🎉"}
          </div>
          <h3 className="victory-title">
            {customVictoryTitle || "Congratulations!"}
          </h3>
          <p className="victory-text">
            {customVictoryMessage || (targetWord ? (
              <>
                You guessed "
                <span className="word-highlight">{targetWord}</span>" in{" "}
                <span className="attempts-highlight">{guessCount}</span>{" "}
                attempts!
              </>
            ) : (
              <>
                You won in{" "}
                <span className="attempts-highlight">{guessCount}</span>{" "}
                attempts!
              </>
            ))}
          </p>
          {gameId && (
            <p className="text-sm text-slate-500 mt-2">
              Game ID:{" "}
              <code className="bg-slate-100 px-2 py-1 rounded">{gameId}</code>
            </p>
          )}
        </div>
      );
    } else {
      return (
        <div className="gameover-content">
          <div className="gameover-icon">
            {customDefeatIcon || "💭"}
          </div>
          <h3 className="gameover-title">
            {customDefeatTitle || "Game Over"}
          </h3>
          <p className="gameover-text">
            {customDefeatMessage || (targetWord ? (
              <>
                The word was: <span className="word-highlight">{targetWord}</span>
              </>
            ) : (
              "Hmmmm........"
            ))}
          </p>
          {gameId && (
            <p className="text-sm text-slate-500 mt-2">
              Game ID:{" "}
              <code className="bg-slate-100 px-2 py-1 rounded">{gameId}</code>
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal animate-scale-in">
        <div className="modal-content">
          {renderGameOverContent()}
          <button
            onClick={onPlayAgain}
            className="play-again-button animate-pulse-subtle"
          >
            <span>{playAgainText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

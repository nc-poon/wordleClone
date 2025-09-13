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
}

export default function GameOverModal({
  gameOver,
  won,
  guessCount,
  targetWord,
  gameId,
  onPlayAgain,
  playAgainText = "🔄 Play Again",
}: GameOverModalProps) {
  if (!gameOver) return null;

  const renderGameOverContent = () => {
    if (won) {
      return (
        <div className="victory-content">
          <div className="victory-icon animate-bounce">🎉</div>
          <h3 className="victory-title">Congratulations!</h3>
          <p className="victory-text">
            {targetWord ? (
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
            )}
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
          <div className="gameover-icon">💭</div>
          <h3 className="gameover-title">Game Over</h3>
          {targetWord ? (
            <p className="gameover-text">
              The word was: <span className="word-highlight">{targetWord}</span>
            </p>
          ) : (
            <p className="gameover-text">Hmmmm........</p>
          )}
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

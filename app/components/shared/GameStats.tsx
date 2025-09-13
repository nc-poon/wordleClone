import React from "react";
import { MAX_GUESSES } from "../../../utils/wordleUtils";
import "./GameStats.css";
export interface GameStatsProps {
  guessCount: number;
  mode?: string;
  targetWord?: string;
  showDebugTarget?: boolean;
}

export default function GameStats({
  guessCount,
  mode,
  targetWord,
  showDebugTarget = false,
}: GameStatsProps) {
  return (
    <div className="game-stats">
      <div className="stat-item">
        <span className="stat-label">Guesses:</span>
        <span className="stat-value">
          {guessCount}/{MAX_GUESSES}
        </span>
      </div>

      {mode && (
        <div className="stat-item">
          <span className="stat-label">Mode:</span>
          <span className="stat-value">{mode}</span>
        </div>
      )}

      {showDebugTarget && targetWord && (
        <div className="stat-item debug-info">
          <span className="stat-label">Target:</span>
          <span className="stat-value debug-target">{targetWord}</span>
        </div>
      )}
    </div>
  );
}

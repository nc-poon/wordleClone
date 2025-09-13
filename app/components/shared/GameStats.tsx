import React from "react";
import { MAX_GUESSES } from "@/constants";
import { GameStatsProps } from "@/types";
import "./GameStats.css";

export default function GameStats({
  guessCount,
  mode,
  targetWord,
  showDebugTarget = false,
  customStats = [],
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

      {customStats.map((stat, index) => (
        <div key={index} className="stat-item">
          <span className="stat-label">{stat.label}:</span>
          <span className="stat-value">{stat.value}</span>
        </div>
      ))}

      {showDebugTarget && targetWord && (
        <div className="stat-item debug-info">
          <span className="stat-label">Target:</span>
          <span className="stat-value debug-target">{targetWord}</span>
        </div>
      )}
    </div>
  );
}

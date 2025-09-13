import React from "react";
import { GameHeaderProps } from "@/types";
import "./GameHeader.css";

export default function GameHeader({
  title,
  subtitle,
  gameId,
}: GameHeaderProps) {
  return (
    <div className="text-center mb-6 game-header">
      <h2 className="text-3xl font-bold text-slate-800 mb-2 animate-slide-down">
        {title}
      </h2>
      <p className="text-sm text-slate-500 animate-fade-in">{subtitle}</p>
      {gameId && (
        <p className="text-xs text-slate-400 mt-2">
          Session:{" "}
          <code className="bg-slate-100 px-2 py-1 rounded text-xs">
            {gameId}
          </code>
        </p>
      )}
    </div>
  );
}

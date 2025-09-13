"use client";
import { useState, useEffect } from "react";

interface GameScore {
  player: number;
  bot: number;
  rounds: number;
}

export default function HighscoreTable() {
  const [gameScore, setGameScore] = useState<GameScore>({
    player: 0,
    bot: 0,
    rounds: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load score from localStorage after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScore = localStorage.getItem("wordleMultiplayerScore");
      if (savedScore) {
        try {
          const parsedScore = JSON.parse(savedScore);
          setGameScore(parsedScore);
        } catch (e) {
          console.warn("Failed to parse saved score:", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Don't show anything if no games have been played
  if (!isLoaded || gameScore.rounds === 0) {
    return null;
  }

  const playerWinRate =
    gameScore.rounds > 0
      ? ((gameScore.player / gameScore.rounds) * 100).toFixed(1)
      : "0.0";
  const botWinRate =
    gameScore.rounds > 0
      ? ((gameScore.bot / gameScore.rounds) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="highscore-table card p-6 max-w-md mx-auto mb-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">
        🏆 Multiplayer Stats
      </h3>

      <div className="stats-grid space-y-4">
        {/* Overall Score */}
        <div className="score-summary text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-slate-800 mb-2">
            You {gameScore.player} - {gameScore.bot} Bot
          </div>
          <div className="text-sm text-slate-500">
            Total Rounds: {gameScore.rounds}
          </div>
        </div>

        {/* Win Rates */}
        <div className="win-rates grid grid-cols-2 gap-4">
          <div className="player-stats text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">👤 You</div>
            <div className="text-2xl font-bold text-blue-800">
              {playerWinRate}%
            </div>
            <div className="text-xs text-blue-600">{gameScore.player} wins</div>
          </div>

          <div className="bot-stats text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-semibold text-orange-700">🤖 Bot</div>
            <div className="text-2xl font-bold text-orange-800">
              {botWinRate}%
            </div>
            <div className="text-xs text-orange-600">{gameScore.bot} wins</div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="performance-indicator text-center">
          {gameScore.player > gameScore.bot ? (
            <div className="text-green-600 font-semibold">
              🎉 You're winning!
            </div>
          ) : gameScore.bot > gameScore.player ? (
            <div className="text-red-600 font-semibold">🤖 Bot is ahead</div>
          ) : (
            <div className="text-slate-600 font-semibold">🤝 It's a tie!</div>
          )}
        </div>
      </div>
    </div>
  );
}

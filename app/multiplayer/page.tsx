"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import WordleBoard from "@/app/components/wordle/WordleBoard";
import GameHeader from "@/app/components/shared/GameHeader";
import GuessInput from "@/app/components/shared/GuessInput";
import BackToHome from "@/app/components/shared/BackToHome";
import {
  SmartBot,
  calculateScore,
  checkGuess,
  getRandomWord,
  isValidWord,
  isCorrectLength,
  BotDifficulty,
} from "@/utils/wordleUtils";
import { createKeyboardHandler } from "@/utils/shared/keyboardUtils";
import {
  WORD_LENGTH,
  WORD_SELECTION_TIME,
  ROUND_END_COUNTDOWN,
  MAX_GUESSES,
} from "@/gameConfigs";
import { PlayerState, GameScore, GamePhase, WordSelectionMode } from "@/types";
import "./multiplayer.css";

export default function MultiplayerWordle() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("setup");
  const [wordSelectionMode, setWordSelectionMode] =
    useState<WordSelectionMode>("auto");
  const [customWord, setCustomWord] = useState("");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    guesses: [],
    currentGuess: "",
    gameOver: false,
    won: false,
    targetWord: "",
    score: 0,
  });
  const [botState, setBotState] = useState<PlayerState>({
    guesses: [],
    currentGuess: "",
    gameOver: false,
    won: false,
    targetWord: "",
    score: 0,
  });
  const [gameScore, setGameScore] = useState<GameScore>({
    player: 0,
    bot: 0,
    rounds: 0,
  });
  const [isScoreLoaded, setIsScoreLoaded] = useState(false);
  const [countdown, setCountdown] = useState(WORD_SELECTION_TIME);
  const [nextRoundCountdown, setNextRoundCountdown] = useState(0);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const customWordRef = useRef("");
  const smartBot = useRef(new SmartBot('medium'));
  const lastKeyPressRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const timersRef = useRef<{
    wordSelection?: NodeJS.Timeout;
    roundEnd?: NodeJS.Timeout;
  }>({});

  // Update custom word ref
  useEffect(() => {
    customWordRef.current = customWord;
  }, [customWord]);

  // Load score from localStorage on mount
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
      setIsScoreLoaded(true);
    }
  }, []);

  // Save score to localStorage when it changes
  useEffect(() => {
    if (isScoreLoaded && typeof window !== "undefined") {
      localStorage.setItem("wordleMultiplayerScore", JSON.stringify(gameScore));
    }
  }, [gameScore, isScoreLoaded]);

  // Handle game phase transitions, setting up/playing
  useEffect(() => {
    if (gamePhase === "playing") {
      initializeRound();
    }
  }, [gamePhase]);

  // Handle bot moves
  useEffect(() => {
    if (
      gamePhase === "playing" &&
      !isPlayerTurn &&
      !botState.gameOver &&
      !playerState.gameOver &&
      botState.targetWord &&
      !loading
    ) {
      makeBotMove();
    }
  }, [
    isPlayerTurn,
    gamePhase,
    botState.targetWord,
    botState.gameOver,
    playerState.gameOver,
    loading,
  ]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => {
        if (timer) clearInterval(timer);
      });
    };
  }, []);

  // Initialize a new round
  const initializeRound = useCallback(async () => {
    let playerTarget = "";
    let botTarget = "";

    const currentCustomWord = customWordRef.current;
    if (wordSelectionMode === "custom" && await isValidWord(currentCustomWord)) {
      botTarget = currentCustomWord; // Player gives word to bot
      playerTarget = await getRandomWord(); // Bot gives random word to player
    } else {
      botTarget = await getRandomWord();
      playerTarget = await getRandomWord();
    }

    setPlayerState({
      guesses: [],
      currentGuess: "",
      gameOver: false,
      won: false,
      targetWord: playerTarget,
      score: 0,
    });

    setBotState({
      guesses: [],
      currentGuess: "",
      gameOver: false,
      won: false,
      targetWord: botTarget,
      score: 0,
    });

    smartBot.current.reset();
    setIsPlayerTurn(true);
    setLoading(false);
  }, [wordSelectionMode]);

  // Reset entire game
  const resetGame = useCallback(() => {
    // Clear any running timers
    Object.values(timersRef.current).forEach((timer) => {
      if (timer) clearInterval(timer);
    });
    timersRef.current = {};

    const newScore = { player: 0, bot: 0, rounds: 0 };
    setGameScore(newScore);
    setGamePhase("setup");
    setCustomWord("");
    setCountdown(WORD_SELECTION_TIME);
    setNextRoundCountdown(0);
    setIsPlayerTurn(true);
    setLoading(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem("wordleMultiplayerScore");
    }
  }, []);

  // Start word selection phase
  const startWordSelection = useCallback(() => {
    if (wordSelectionMode === "auto") {
      setGamePhase("playing");
    } else {
      setGamePhase("wordSelection");
      setCountdown(WORD_SELECTION_TIME);

      // Clear any existing timer
      if (timersRef.current.wordSelection) {
        clearInterval(timersRef.current.wordSelection);
      }

      timersRef.current.wordSelection = setInterval(() => {
        // 10,9,8,7...
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timersRef.current.wordSelection!);
            timersRef.current.wordSelection = undefined;

            const currentCustomWord = customWordRef.current;
            if (!isValidWord(currentCustomWord)) {
              setCustomWord(getRandomWord());
            }
            setGamePhase("playing");
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // every 1 second
    }
  }, [wordSelectionMode]);

  // Make bot move
  const makeBotMove = useCallback(() => {
    if (botState.gameOver || !botState.targetWord || loading) return;

    setLoading(true);
    setTimeout(() => {
      // make bot guess
      const botGuess = smartBot.current.getNextGuess(botState.guesses.length);

      if (!botGuess || !botState.targetWord) {
        console.error("Invalid guess or target word:", {
          botGuess,
          targetWord: botState.targetWord,
        });
        setLoading(false);
        return;
      }

      const result = checkGuess(botGuess, botState.targetWord);
      // improve bot next move
      smartBot.current.updateConstraints(botGuess, result);

      const newBotGuesses = [...botState.guesses, botGuess];
      const won = botGuess === botState.targetWord;
      const gameOver = won || newBotGuesses.length >= MAX_GUESSES;
      const score = calculateScore(newBotGuesses, botState.targetWord);

      setBotState((prev) => ({
        ...prev,
        guesses: newBotGuesses,
        won,
        gameOver,
        score,
      }));

      setLoading(false);
      setIsPlayerTurn(true);

      // Check if round should end
      if (gameOver || playerState.gameOver) {
        const currentPlayerStats = {
          won: playerState.won,
          score: playerState.score,
          guesses: playerState.guesses,
        };
        const currentBotStats = { won, score, guesses: newBotGuesses };

        setTimeout(() => {
          checkRoundEnd(
            playerState.gameOver,
            gameOver,
            currentPlayerStats,
            currentBotStats
          );
        }, 500);
      }
    }, 1500);
  }, [
    botState.gameOver,
    botState.targetWord,
    botState.guesses,
    playerState.gameOver,
    playerState.won,
    playerState.score,
    playerState.guesses,
    loading,
  ]);

  // Check if round has ended
  const checkRoundEnd = useCallback(
    (
      playerDone: boolean,
      botDone: boolean,
      currentPlayerState?: { won: boolean; score: number; guesses: string[] },
      currentBotState?: { won: boolean; score: number; guesses: string[] }
    ) => {
      if (!playerDone && !botDone) return;

      const playerStats = currentPlayerState || {
        won: playerState.won,
        score: playerState.score,
        guesses: playerState.guesses,
      };

      const botStats = currentBotState || {
        won: botState.won,
        score: botState.score,
        guesses: botState.guesses,
      };

      // Determine round winner
      let roundWinner = "";
      if (playerStats.won && !botStats.won) {
        roundWinner = "player";
      } else if (botStats.won && !playerStats.won) {
        roundWinner = "bot";
      } else if (playerStats.won && botStats.won) {
        roundWinner =
          playerStats.guesses.length <= botStats.guesses.length
            ? "player"
            : "bot";
        // player and bot failed to guess, resort to score
      } else {
        roundWinner = playerStats.score >= botStats.score ? "player" : "bot";
      }

      // Update game score
      setGameScore((prev) => ({
        ...prev,
        player: prev.player + (roundWinner === "player" ? 1 : 0),
        bot: prev.bot + (roundWinner === "bot" ? 1 : 0),
        rounds: prev.rounds + 1,
      }));

      setGamePhase("roundEnd");

      // Start countdown for next round
      setNextRoundCountdown(ROUND_END_COUNTDOWN);

      // Clear any existing timer
      if (timersRef.current.roundEnd) {
        clearInterval(timersRef.current.roundEnd);
      }

      timersRef.current.roundEnd = setInterval(() => {
        setNextRoundCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timersRef.current.roundEnd!);
            timersRef.current.roundEnd = undefined;
            setGamePhase("setup");
            setCustomWord("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [
      playerState.won,
      playerState.score,
      playerState.guesses,
      botState.won,
      botState.score,
      botState.guesses,
    ]
  );

  // Make player guess
  const makePlayerGuess = useCallback(async () => {
    if (
      playerState.currentGuess.length !== WORD_LENGTH ||
      playerState.gameOver ||
      !isPlayerTurn
    )
      return;

    const guess = playerState.currentGuess.toUpperCase();
    
    // Validate word first
    const wordIsValid = await isValidWord(guess);
    if (!wordIsValid) {
      alert("Not a valid word!");
      return;
    }

    const newGuesses = [...playerState.guesses, guess];
    const won = guess === playerState.targetWord;
    const gameOver = won || newGuesses.length >= MAX_GUESSES;
    const score = calculateScore(newGuesses, playerState.targetWord);

    setPlayerState((prev) => ({
      ...prev,
      guesses: newGuesses,
      currentGuess: "",
      won,
      gameOver,
      score,
    }));

    setIsPlayerTurn(false);

    // Check if round should end
    if (gameOver || botState.gameOver) {
      const currentPlayerStats = { won, score, guesses: newGuesses };
      const currentBotStats = {
        won: botState.won,
        score: botState.score,
        guesses: botState.guesses,
      };

      setTimeout(() => {
        checkRoundEnd(
          gameOver,
          botState.gameOver,
          currentPlayerStats,
          currentBotStats
        );
      }, 500);
    } else {
      setTimeout(() => setIsPlayerTurn(false), 1000);
    }
  }, [
    playerState.currentGuess,
    playerState.gameOver,
    playerState.guesses,
    playerState.targetWord,
    isPlayerTurn,
    botState.gameOver,
    botState.won,
    botState.score,
    botState.guesses,
    checkRoundEnd,
  ]);

  // Handle keyboard input with debounce
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      const currentTime = Date.now();

      // Debounce rapid duplicate key presses
      if (
        lastKeyPressRef.current === e.key &&
        currentTime - lastKeyTimeRef.current < 50
      ) {
        e.preventDefault();
        return;
      }

      lastKeyPressRef.current = e.key;
      lastKeyTimeRef.current = currentTime;

      if (gamePhase !== "playing" || !isPlayerTurn || playerState.gameOver)
        return;

      const sharedHandler = createKeyboardHandler({
        currentGuess: playerState.currentGuess,
        setCurrentGuess: (value) => {
          setPlayerState((prev) => ({
            ...prev,
            currentGuess:
              typeof value === "function" ? value(prev.currentGuess) : value,
          }));
        },
        gameOver: playerState.gameOver,
        loading: false,
        onEnter: makePlayerGuess,
      });

      sharedHandler(e);
    },
    [
      gamePhase,
      isPlayerTurn,
      playerState.gameOver,
      playerState.currentGuess,
      makePlayerGuess,
    ]
  );

  // Handle custom word input
  const handleCustomWordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase().slice(0, WORD_LENGTH);
      setCustomWord(value);
    },
    []
  );

  // Skip to next round immediately
  const skipToNextRound = useCallback(() => {
    if (timersRef.current.roundEnd) {
      clearInterval(timersRef.current.roundEnd);
      timersRef.current.roundEnd = undefined;
    }
    setNextRoundCountdown(0);
    setGamePhase("setup");
    setCustomWord("");
  }, []);

  // Handle difficulty change
  const handleDifficultyChange = useCallback((difficulty: BotDifficulty) => {
    setBotDifficulty(difficulty);
    smartBot.current.setDifficulty(difficulty);
  }, []);

  // Skip word selection and start playing
  const skipWordSelection = useCallback(() => {
    if (timersRef.current.wordSelection) {
      clearInterval(timersRef.current.wordSelection);
      timersRef.current.wordSelection = undefined;
    }
    setCountdown(0);
    setGamePhase("playing");
  }, []);

  // Render game board for a player
  const renderGameBoard = useCallback(
    (state: PlayerState, isPlayer: boolean) => {
      return (
        <div
          className={`player-board ${isPlayer ? "player-board" : "bot-board"}`}
        >
          <div className="board-header">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {isPlayer ? "👤 You" : "🤖 Smart Bot"}
            </h3>
            <div className="flex justify-between text-sm text-slate-500 mb-4">
              <span>Score: {state.score}</span>
              <span>
                Guesses: {state.guesses.length}/{MAX_GUESSES}
              </span>
            </div>
          </div>

          <WordleBoard
            guesses={state.guesses}
            currentGuess={isPlayer ? state.currentGuess : ""}
            targetWord={state.targetWord}
            size="mini"
            showCurrentGuess={isPlayer}
            className="mb-3"
          />

          <div className="board-status">
            {state.won && (
              <div className="text-green-600 font-semibold">🎉 Won!</div>
            )}
            {state.gameOver && !state.won && (
              <div className="text-red-600 font-semibold">💔 Lost</div>
            )}
            {!state.gameOver && isPlayer && isPlayerTurn && (
              <div className="text-blue-600 font-semibold">Your turn</div>
            )}
            {!state.gameOver && !isPlayer && !isPlayerTurn && loading && (
              <div className="text-orange-600 font-semibold">
                🤔 Thinking...
              </div>
            )}
          </div>
        </div>
      );
    },
    [isPlayerTurn, loading]
  );

  return (
    <div className="two-player-wordle" onKeyDown={handleKeyPress} tabIndex={0}>
      <div className="mb-4">
        <BackToHome />
      </div>
      <GameHeader
        title="Two Player Wordle"
        subtitle={`You ${gameScore.player} - ${gameScore.bot} Bot | Round ${
          gameScore.rounds + 1
        }`}
      />
      {/* Setup Phase */}
      {gamePhase === "setup" && (
        <div className="setup-phase card p-6 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Game Setup</h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Choose word selection mode:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="auto"
                  checked={wordSelectionMode === "auto"}
                  onChange={(e) =>
                    setWordSelectionMode(e.target.value as WordSelectionMode)
                  }
                  className="mr-2"
                />
                Auto-select random words
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="custom"
                  checked={wordSelectionMode === "custom"}
                  onChange={(e) =>
                    setWordSelectionMode(e.target.value as WordSelectionMode)
                  }
                  className="mr-2"
                />
                I choose a word for the bot
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Bot Difficulty:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="easy"
                  checked={botDifficulty === "easy"}
                  onChange={(e) => handleDifficultyChange(e.target.value as BotDifficulty)}
                  className="mr-2"
                />
                Easy (30% random moves)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="medium"
                  checked={botDifficulty === "medium"}
                  onChange={(e) => handleDifficultyChange(e.target.value as BotDifficulty)}
                  className="mr-2"
                />
                Medium (20% random moves)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="hard"
                  checked={botDifficulty === "hard"}
                  onChange={(e) => handleDifficultyChange(e.target.value as BotDifficulty)}
                  className="mr-2"
                />
                Hard (always strategic)
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={startWordSelection} className="btn-primary w-full">
              Start Round
            </button>

            {(gameScore.player > 0 || gameScore.bot > 0) && (
              <button onClick={resetGame} className="btn-secondary w-full">
                New Game (Reset Score)
              </button>
            )}
          </div>
        </div>
      )}
      {/* Word Selection Phase */}
      {gamePhase === "wordSelection" && (
        <div className="word-selection-phase card p-6 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Word Selection</h3>

          <div className="countdown-timer text-center mb-6">
            <div className="text-3xl font-bold text-blue-600">{countdown}</div>
            <div className="text-sm text-slate-500">seconds remaining</div>
          </div>

          {wordSelectionMode === "custom" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter a 5-letter word for the bot to guess:
              </label>
              <input
                type="text"
                value={customWord}
                onChange={handleCustomWordChange}
                maxLength={5}
                className="w-full p-3 border rounded-lg text-center uppercase font-mono text-lg"
                placeholder="ENTER WORD"
                autoFocus
              />
              {isCorrectLength(customWord) && (
                <div className="text-green-600 text-sm mt-2">✓ Valid format!</div>
              )}
            </div>
          )}

          <button
            onClick={skipWordSelection}
            disabled={
              wordSelectionMode === "custom" && !isCorrectLength(customWord)
            }
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Playing
          </button>
        </div>
      )}
      {/* Playing Phase */}
      {gamePhase === "playing" && (
        <div className="playing-phase">
          <div className="dual-boards mb-6">
            {renderGameBoard(playerState, true)}
            {renderGameBoard(botState, false)}
          </div>

          {!playerState.gameOver && isPlayerTurn && (
            <div className="max-w-md mx-auto">
              <GuessInput
                currentGuess={playerState.currentGuess}
                onInputChange={(e) =>
                  setPlayerState((prev) => ({
                    ...prev,
                    currentGuess: e.target.value
                      .toUpperCase()
                      .slice(0, WORD_LENGTH),
                  }))
                }
                onSubmit={makePlayerGuess}
                gameOver={playerState.gameOver}
                loading={false}
                submitButtonText="Submit Guess"
              />
            </div>
          )}
        </div>
      )}
      {/* Round End Phase */}
      {gamePhase === "roundEnd" && (
        <div className="round-end-phase card p-6 max-w-md mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4">Round Complete!</h3>

          <div className="round-summary mb-6">
            <div className="mb-2">
              Your word: <strong>{playerState.targetWord}</strong>
            </div>
            <div className="mb-2">
              Bot&apos;s word: <strong>{botState.targetWord}</strong>
            </div>
            <div className="mb-2">
              Your score: <strong>{playerState.score}</strong>
            </div>
            <div className="mb-4">
              Bot&apos;s score: <strong>{botState.score}</strong>
            </div>

            <div className="text-lg font-semibold">
              {playerState.score >= botState.score
                ? "🎉 You won this round!"
                : "🤖 Bot won this round!"}
            </div>
          </div>

          {nextRoundCountdown > 0 && (
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-600">
                {nextRoundCountdown}
              </div>
              <div className="text-sm text-slate-500">
                Next round starting...
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button onClick={skipToNextRound} className="btn-primary w-full">
              Next Round Now
            </button>

            <button onClick={resetGame} className="btn-secondary w-full">
              New Game (Reset Score)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

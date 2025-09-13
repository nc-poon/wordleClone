import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';


interface GameSession {
  gameId: string;
  targetWord: string;
  guesses: string[];
  gameOver: boolean;
  won: boolean;
  createdAt: string;
  lastUpdated: string;
}

interface LetterResult {
  letter: string;
  status: "correct" | "present" | "absent";
}

const GAMES_FILE = path.join(process.cwd(), 'data', 'games.json');
const WORDS = [
  "HELLO", "WORLD", "QUITE", "FANCY", "FRESH", "PANIC", "CRAZY", "BUGGY"
];


// Read games data from JSON file
async function readGames(): Promise<{ games: GameSession[] }> {
  try {
    const data = await fs.readFile(GAMES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { games: [] };
  }
}

// Write games data to JSON file
async function writeGames(data: { games: GameSession[] }): Promise<void> {
  await fs.writeFile(GAMES_FILE, JSON.stringify(data, null, 2));
}

// Check a guess against the target word
function checkGuess(guess: string, target: string): LetterResult[] {
  const result: LetterResult[] = [];
  const targetLetters = target.split("");
  const guessLetters = guess.split("");
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result.push({ letter: guessLetters[i], status: "correct" });
    } else if (targetLetters.includes(guessLetters[i])) {
      result.push({ letter: guessLetters[i], status: "present" });
    } else {
      result.push({ letter: guessLetters[i], status: "absent" });
    }
  }

  return result;
}

// Clean up old game sessions (older than 1 hour)
async function cleanupOldGames(): Promise<void> {
  const data = await readGames();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  data.games = data.games.filter(game => game.lastUpdated > oneHourAgo);
  await writeGames(data);
}


// GET - Retrieve game session by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const data = await readGames();
    const game = data.games.find(g => g.gameId === gameId);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json({
      gameId: game.gameId,
      guesses: game.guesses,
      gameOver: game.gameOver,
      won: game.won,
      createdAt: game.createdAt,
      lastUpdated: game.lastUpdated
    });
  } catch (error) {
    console.error('Error retrieving game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new game or submit guess
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, gameId, guess } = body;

    // Clean up old games periodically
    await cleanupOldGames();

    if (action === 'create') {
      const newGame: GameSession = {
        gameId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        targetWord: WORDS[Math.floor(Math.random() * WORDS.length)],
        guesses: [],
        gameOver: false,
        won: false,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const data = await readGames();
      data.games.push(newGame);
      await writeGames(data);

      // Return game session info without target word
      return NextResponse.json({
        gameId: newGame.gameId,
        guesses: newGame.guesses,
        gameOver: newGame.gameOver,
        won: newGame.won,
        createdAt: newGame.createdAt
      });

    } else if (action === 'guess') {
      // ===== SUBMIT GUESS =====
      if (!gameId || !guess) {
        return NextResponse.json({
          error: 'Game ID and guess are required'
        }, { status: 400 });
      }

      const data = await readGames();
      const gameIndex = data.games.findIndex(g => g.gameId === gameId);

      if (gameIndex === -1) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }

      const game = data.games[gameIndex];

      // Check if game is already over
      if (game.gameOver) {
        return NextResponse.json({ error: 'Game is already over' }, { status: 400 });
      }

      // Validate guess format
      const guessUpper = guess.toString().toUpperCase();
      if (guessUpper.length !== 5 || !/^[A-Z]{5}$/.test(guessUpper)) {
        return NextResponse.json({
          error: 'Guess must be exactly 5 letters'
        }, { status: 400 });
      }

      // Process the guess
      const result = checkGuess(guessUpper, game.targetWord);
      const isCorrect = guessUpper === game.targetWord;

      // Update game state
      game.guesses.push(guessUpper);
      game.lastUpdated = new Date().toISOString();

      // Check win condition
      if (isCorrect) {
        game.won = true;
        game.gameOver = true;
      }
      // Check lose condition (6 guesses used)
      else if (game.guesses.length >= 6) {
        game.gameOver = true;
      }

      // Save updated game
      data.games[gameIndex] = game;
      await writeGames(data);

      // Return guess result
      return NextResponse.json({
        result,
        isCorrect,
        gameOver: game.gameOver,
        won: game.won,
        guessesRemaining: 6 - game.guesses.length,
        // Only reveal target word when game is over
        ...(game.gameOver && { targetWord: game.targetWord })
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing game request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
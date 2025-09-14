# 🎯 WordleClone

**Note**: This project is not affiliated with or endorsed by The New York Times Company or the original Wordle game.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd wordleClone

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

The application will be available at `http://localhost:3000/game` (or `http://localhost:3001/game` if port 3000 is in use).

# You can now play the game at https://tobyverse.app/game

## 🎮 Game Modes

### Debugging is disabled by default, enable it by setting DEBUG = true in gameConfigs.ts, it will hide the target words during the game

### 1. Classic Mode

**Traditional 5-letter word guessing**

- Guess a 5-letter word in 6 attempts or change it in gameConfigs.ts, max rounds could be 99999... (it will take some time to render... or discard the first half and move the rest of the guesses up to limit the number of rows rendered)
- Color-coded feedback for each guess, similar to original Wordle, more intuitive than '0', '?', '\_' but less accessible (color blind etc... could add secondary visual that is not color)

### 2. Server/Client Mode

**Server-validated gameplay**

- All validation happens on the server
- Client never knows the target word
- Every guess is sent to the server and server returns the result

### 3. Adaptive Mode

**Dynamic difficulty adjustment**

- The word changes strategically to avoid your guesses
- Keeps a list of candidates that do not match, if match, prioritize less hit

### 4. Multiplayer Mode

**Compete against SmartBot**

- Side-by-side dual board gameplay
- Player can choose their own words for their opponents or randomly chosen. (Might need to validate the words as user can enter any 5 letter strings, giving user option to choose their own word can personalize the game)
- When choosing the word, there is a time limit to reduce the amount of waiting time for the opponent.
- Bot opponent, assume multiplayer over a network instead of on the same device. Bot to simulate another player.
- Score tracking with localStorage

## 🤖 Bot Behavior

### Strategy Overview

1. **Vowel-Heavy First Guess**: Always starts with (4 vowels) for maximum information
2. **Position Memory**: Uses HashMap to track tried positions for each letter
3. **Constraint-Based Logic**: Maintains separate sets for correct, present, and absent letters
4. **Strategic Construction**: Builds guesses by placing known letters optimally

## 📊 Database Design

**File-Based JSON Storage**

- Use JSON for prototyping (fast and easy, good for small scale and fast development). RDB (PostgreSQL) as main db and Redis for caching things like sessions, user profile, high scores etc.

```json
// Game Sessions (server mode)
{
  "gameId": "game_1735819200_abc123def",
  "targetWord": "WORDS",
  "guesses": ["ADIEU", "STORY"],
  "gameOver": false,
  "won": false,
  "createdAt": "2025-01-02T12:00:00Z"
}

// Multiplayer Scores (localStorage)
{
  "player": 5,
  "bot": 3,
  "rounds": 8
}
```

### Frontend

- Responsive Design, set breakpoints for different devices.
- Use Tailwind for general styling, separate CSS file for more complex styling/animations

## 🏗️ Repository Structure

```
wordle_clone/
├── app/                          # Next.js App Router
│   ├── components/               # Reusable components
│   │   ├── shared/               # Shared UI components
│   │   │   ├── GameHeader.tsx    # Game title and subtitle
│   │   │   ├── GameStats.tsx     # Score and statistics display
│   │   │   ├── GameOverModal.tsx # Win/lose modal with customization
│   │   │   ├── LoadingSpinner.tsx # Loading state component
│   │   │   ├── GuessInput.tsx    # Input field for guesses
│   │   │   └── *.css             # Component-specific styles
│   │   ├── wordle/               # Game-specific components
│   │   │   ├── WordleBoard.tsx   # Main game board with grid
│   │   │   └── WordleBoard.css   # Board styling
│   │   └── Highscore/            # Score tracking components
│   │       └── HighscoreTable.tsx # Multiplayer score display
│   ├── normalWordle/             # Classic game mode
│   │   └── page.tsx
│   ├── serverWordle/             # Server-validated mode
│   │   └── page.tsx
│   ├── absurdle/                 # Adaptive difficulty mode
│   │   └── page.tsx
│   ├── multiplayer/              # Two-player mode vs bot
│   │   ├── page.tsx
│   │   └── multiplayer.css       # Mode-specific styling
│   ├── wordle_api/               # API Routes
│   │   └── game/                 # Game session management
│   │       └── route.ts          # REST endpoints for server mode
│   ├── globals.css               # Global styles
│   ├── wordle.css                # Shared game styling
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── utils/                        # Utility functions
│   ├── wordleUtils.ts            # Game logic and SmartBot class
│   └── shared/                   # Shared utility functions
│       └── keyboardUtils.ts      # Keyboard handling utilities
├── gameConfigs.ts                # Centralized game constants
├── types.ts                      # Centralized TypeScript types
├── data/                         # Data storage
│   └── games.json                # Game sessions storage
├── public/                       # Static assets
├── README.md                     # This file
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config with @ path alias
├── tailwind.config.ts            # Tailwind configuration
└── next.config.mjs               # Next.js configuration
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚖️ Legal Disclaimer

This project is an educational implementation of word-guessing game mechanics. It is **not affiliated with, endorsed by, or connected to**:

- The New York Times Company
- The original Wordle game or trademark
- Any trademarked word-guessing games

All game mechanics implemented here are based on common word puzzle concepts that are not subject to copyright protection. The specific implementation, code, and design are original works licensed under the MIT License.

**Built using Next.js 15, TypeScript, and Tailwind CSS**

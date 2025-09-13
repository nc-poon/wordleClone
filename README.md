# 🎯 Five-Letter Word Game

**Note**: This project is not affiliated with or endorsed by The New York Times Company or the original Wordle game.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd five-letter-word-game

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

The application will be available at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use).

## 🎮 Game Modes

### Debugging is enable by default, disable it be setting debug = false in gameConfig.ts, it will hide the target words during the game

### 1. Classic Mode (Task 1)

**Traditional 5-letter word guessing**

- Guess a 5-letter word in 6 attempts or change it in constants.ts, max round could be 99999... (it will take some time to render... or discard the first halve and move the rest of the guesses up to limit the number of rows rendered)
- Color-coded feedback for each guess, similar to original wordle , more intuitive than '0', '?', '\_' but less accessible (color blind etc... could add secondary visual that is not color)

### 2. Server/Client Mode (Task 2)

**Server-validated gameplay**

- All validation happens on the server
- Client never knows the target word
- Every guess is sent to the server and server returns the result

### 3. Adaptive Mode (Task 3)

**Dynamic difficulty adjustment**

- The word changes strategically to avoid your guesses
- Keeps a list of candidates that do not match, if match , prioritize less hit

### 4. Multiplayer Mode (Task 4)

**Compete against SmartBot**

- Side-by-side dual board gameplay
- Player can choose their own words for their opponents or randomly choosen. (Might need to validate the words as user can enter any 5 letter strings, giving user option to choose their own word can personalised the game)
- When choosing the word, there is a time limit to reduce the amount of waiting time for the opponent.
- Bot opponent, Assume multiplayer over a network instead on the same device. Bot to simulate another player.
- Score tracking with localStorage

## 🤖 Bot Behavior

### Strategy Overview

1. **Vowel-Heavy First Guess**: Always starts with (4 vowels) for maximum information
2. **Position Memory**: Uses HashMap to track tried positions for each letter
3. **Constraint-Based Logic**: Maintains separate sets for correct, present, and absent letters
4. **Strategic Construction**: Builds guesses by placing known letters optimally

## 📊 Database Design

**File-Based JSON Storage**

- Use json for prototyping (fast and easy, good for small scale and fast development). RDB (psql) as main db and redis for caching things like sessions, user profile, high scores etc..

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

### FrontEnd

- Responsive Design, set breakpoints for different devices.
- Use tailwind for general styling, seperate css file for more complex styling/animations


## 🏗️ Repository Structure

```

wordle_clone/
├── app/
│ ├── components/
│ │ ├── shared/ # Shared UI components
│ │ │ ├── GameHeader.tsx # Game title and subtitle
│ │ │ ├── GameStats.tsx # Score and statistics
│ │ │ ├── GameOverModal.tsx # Win/lose modal
│ │ │ ├── LoadingSpinner.tsx # Loading state
│ │ │ ├── GuessInput.tsx # Input field for guesses
│ │ │ └── \*.css
│ │ ├── wordle/ # Game-specific components
│ │ │ ├── WordleBoard.tsx # Main game board with grid
│ │ │ └── WordleBoard.css
│ │ └── Highscore/ # Score tracking components
│ │ └── HighscoreTable.tsx
│ ├── normalWordle/ # Classic game mode
│ │ └── page.tsx
│ ├── serverWordle/ # Server-validated mode
│ │ └── page.tsx
│ ├── absurdle/ # Host Cheating mode
│ │ └── page.tsx
│ ├── multiplayer/ # Multiplayer
│ │ ├── page.tsx
│ │ └── multiplayer.css
│ ├── wordle_api/ # API Routes
│ │ └── game/
│ │ └── route.ts # endpoints for server mode
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page
├── utils/
│ ├── wordleUtils.ts # Game logic and SmartBot class
│ └── shared/
│ └── keyboardUtils.ts # Keyboard handling utilities
├── constants.ts # Game constants
├── types.ts # TypeScript types
├── data/ # Data storage
│ └── games.json # Game sessions storage
├── public/
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs

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
```

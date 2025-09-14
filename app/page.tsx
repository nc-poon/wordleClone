import HighscoreTable from "./components/Highscore/HighscoreTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Wordle</h1>
        </div>
        <HighscoreTable />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <a
            href="/game/normalWordle"
            className="card cursor-pointer hover:scale-[1.02] active:scale-[0.98] no-underline"
          >
            <div className="card-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Client Validation Wordle
                </h2>
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-slate-700 mb-2">Normal Wordle</h3>
              <ul className="text-sm text-slate-600 space-y-1 mt-3">
                <li>• Guess a 5-letter word in 6 attempts</li>
                <li>• Each guess must be a valid word</li>
                <li>• Letters change color to show how close you are</li>
              </ul>
            </div>
          </a>

          <a
            href="/game/serverWordle"
            className="card cursor-pointer hover:scale-[1.02] active:scale-[0.98] no-underline"
          >
            <div className="card-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Server Validation Wordle
                </h2>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-slate-700 mb-2">
                Server/Client Wordle
              </h3>
              <ul className="text-sm text-slate-600 space-y-1 mt-3">
                <li>• Same Wordle rules with server validation</li>
                <li>• More secure word checking</li>
                <li>• Prevents client-side cheating</li>
              </ul>
            </div>
          </a>

          <a
            href="/game/absurdle"
            className="card cursor-pointer hover:scale-[1.02] active:scale-[0.98] no-underline"
          >
            <div className="card-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Absurdle
                </h2>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-slate-700 mb-2">
                Absurdle (Cheating)
              </h3>
              <ul className="text-sm text-slate-600 space-y-1 mt-3">
                <li>• Same rules as Wordle, but the word changes!</li>
                <li>• Game tries to avoid giving you the answer</li>
                <li>• Forces you to narrow down possibilities</li>
              </ul>
            </div>
          </a>

          <a
            href="/game/multiplayer"
            className="card cursor-pointer hover:scale-[1.02] active:scale-[0.98] no-underline"
          >
            <div className="card-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Multiplayer
                </h2>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-slate-700 mb-2">
                Two Player Wordle (currently with bot)
              </h3>
              <ul className="text-sm text-slate-600 space-y-1 mt-3">
                <li>• Both players guess the same word</li>
                <li>• Winner decided by who guesses first</li>
                <li>• Same tries = winner by score (2pts correct, 1pt present)</li>
                <li>• Same score = Tie</li>
              </ul>
            </div>
          </a>
        </div>
        <div className="max-w-4xl mt-6 mx-auto mb-8">
          <div className="card">
            <div className="card-content">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
                Color Guide
              </h2>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-slate-600">
                    Grey: Letter not in word
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-slate-600">
                    Orange: Letter in word, wrong position
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-slate-600">
                    Green: Letter in word, correct position
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

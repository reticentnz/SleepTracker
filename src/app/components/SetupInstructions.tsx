import { AlertCircle, Database, Terminal } from 'lucide-react';

export default function SetupInstructions() {
  return (
    <div className="space-y-6 pt-2">
      <div className="glass-card p-6 rounded-2xl border border-red-500/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Database Connection Required</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Sleep Clues needs a Postgres database connection to save your sleep logs. Since you&apos;re running locally, we recommend using a free project on <span className="text-indigo-400 font-semibold">Neon.tech</span>.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-card-border space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wide uppercase">
          <Database className="w-4 h-4" />
          <span>Step 1: Get Connection String</span>
        </div>
        <ol className="list-decimal pl-4 text-xs text-slate-400 space-y-2">
          <li>Create a free account at <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">neon.tech</a></li>
          <li>Create a new project and select standard Postgres.</li>
          <li>Copy the connection string (with SSL mode enabled) from the Neon Console.</li>
        </ol>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-card-border space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wide uppercase">
          <Terminal className="w-4 h-4" />
          <span>Step 2: Add Environment Variable</span>
        </div>
        <p className="text-xs text-slate-400">
          Create a file named <code className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 font-mono text-[11px]">.env.local</code> in the root of this project and add:
        </p>
        <pre className="p-3.5 rounded-xl bg-slate-900/90 text-slate-300 text-xs font-mono border border-slate-800 overflow-x-auto whitespace-pre-wrap select-all">
{`DATABASE_URL="postgres://username:password@ep-host-name.region.neon.tech/neondb?sslmode=require"`}
        </pre>
        <p className="text-[10px] text-slate-500 italic">
          Tip: Once added, restart the development server so Next.js loads the variables.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-card-border space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Auto-Schema Initialization</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You don&apos;t need to create the database tables manually! Once the connection string is added, the app will automatically build the tables (`sleep_logs` and `sleep_log_tags`) on the first query.
        </p>
      </div>
    </div>
  );
}

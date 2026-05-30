import { getSleepInsights } from '@/lib/actions';
import SetupInstructions from '../components/SetupInstructions';
import { Star, TrendingUp, Activity, BarChart2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const isDbConnected = !!process.env.DATABASE_URL;

  if (!isDbConnected) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-indigo-300 to-slate-100 bg-clip-text text-transparent">
          Setup Sleep Clues
        </h1>
        <SetupInstructions />
      </div>
    );
  }

  const { totalNights, avgQuality, tagInsights, topDisruptors, topHelpers } = await getSleepInsights();

  // If there are logs but no quality ratings or no logs at all
  if (totalNights === 0 || avgQuality === null) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Sleep Insights
          </h1>
          <p className="text-xs text-slate-400">
            Discover habits that trigger or disrupt your sleep
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-card-border text-center space-y-4 py-12">
          <div className="w-12 h-12 rounded-full bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-200">Not enough data yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              We need at least one logged night with a sleep quality rating to calculate your averages and habit correlations.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-550 border border-indigo-500 text-xs font-semibold rounded-xl text-white shadow-md glow-indigo transition-all active:scale-95"
          >
            Log Tonight&apos;s Sleep
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
          Sleep Insights
        </h1>
        <p className="text-xs text-slate-400">
          Discover habits that trigger or disrupt your sleep
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Total Logs */}
        <div className="glass-card p-4 rounded-2xl border border-card-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/50 border border-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Nights Logged
            </span>
            <span className="text-xl font-bold text-slate-100">{totalNights}</span>
          </div>
        </div>

        {/* Card 2: Avg Quality */}
        <div className="glass-card p-4 rounded-2xl border border-card-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-900/30 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Average Quality
            </span>
            <span className="text-xl font-bold text-slate-100">{avgQuality} <span className="text-xs text-slate-400 font-normal">/ 5</span></span>
          </div>
        </div>
      </div>

      {/* Top Disruptors and Helpers (Only if we have entries) */}
      <div className="grid grid-cols-1 gap-4">
        {/* Helpers */}
        <div className="glass-card p-4 rounded-2xl border border-card-border space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Sleep Helpers</span>
          </h3>
          {topHelpers.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No good sleep tags logged yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topHelpers.slice(0, 5).map(({ tag, count }) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/30 text-emerald-350 text-xs font-medium"
                >
                  {tag} <span className="text-[10px] text-emerald-500 font-semibold ml-1">({count}x)</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Disruptors */}
        <div className="glass-card p-4 rounded-2xl border border-card-border space-y-3">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Sleep Disruptors</span>
          </h3>
          {topDisruptors.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No bad sleep tags logged yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topDisruptors.slice(0, 5).map(({ tag, count }) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-900/30 text-red-350 text-xs font-medium"
                >
                  {tag} <span className="text-[10px] text-red-500 font-semibold ml-1">({count}x)</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Habit Comparison List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Habit vs. No Habit Correlation</span>
        </h2>

        {tagInsights.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl border border-card-border text-center text-xs text-slate-400 py-8">
            Start logging habits with checkboxes (like Magnesium, Alcohol, Gym) to view comparisons!
          </div>
        ) : (
          <div className="space-y-3">
            {tagInsights.map((insight) => {
              const diff = insight.difference ?? 0;
              const isPositive = diff > 0;
              const isNegative = diff < 0;
              
              // Scale visual bar: cap diff at 1.5 for visual scaling
              const maxScale = 1.5;
              const barPercent = Math.min((Math.abs(diff) / maxScale) * 100, 100);

              return (
                <div
                  key={insight.tag}
                  className="glass-card p-4 rounded-2xl border border-card-border space-y-3"
                >
                  {/* Title and Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-sm text-slate-200 leading-snug">
                      {insight.tag}
                    </span>
                    {diff !== 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide shrink-0 ${
                          isPositive
                            ? 'bg-emerald-950 border border-emerald-500/25 text-emerald-400'
                            : isNegative
                            ? 'bg-red-950 border border-red-500/25 text-red-400'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        {isPositive ? `+${diff}` : diff} Quality
                      </span>
                    )}
                  </div>

                  {/* Comparisons & Sample size */}
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <div className="flex gap-4">
                      <span>
                        With: <strong className="text-slate-200">{insight.withAverage?.toFixed(1) ?? 'N/A'}</strong>
                      </span>
                      <span>
                        Without: <strong className="text-slate-200">{insight.withoutAverage?.toFixed(1) ?? 'N/A'}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Logged {insight.sampleSize} night{insight.sampleSize > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Visual Impact Meter Bar */}
                  {diff !== 0 && (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-slate-950/80 rounded-full overflow-hidden border border-slate-900/50">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPositive ? 'bg-emerald-500/80' : 'bg-red-500/80'
                          }`}
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-500 block text-right font-medium">
                        Impact Strength
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

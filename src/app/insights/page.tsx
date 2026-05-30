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

  const { totalNights, avgQuality, avgSleptThroughRate, tagInsights, topDisruptors, topHelpers } = await getSleepInsights();

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
      <div className="grid grid-cols-3 gap-2">
        {/* Card 1: Total Logs */}
        <div className="glass-card p-3 rounded-2xl border border-card-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/50 border border-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Logs
            </span>
            <span className="text-base font-bold text-slate-100">{totalNights}</span>
          </div>
        </div>

        {/* Card 2: Avg Quality */}
        <div className="glass-card p-3 rounded-2xl border border-card-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-900/30 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-4 h-4 fill-current" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Quality
            </span>
            <span className="text-base font-bold text-slate-100">
              {avgQuality} <span className="text-[10px] text-slate-400 font-normal">/5</span>
            </span>
          </div>
        </div>

        {/* Card 3: Slept Through Rate */}
        <div className="glass-card p-3 rounded-2xl border border-card-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Slept Through
            </span>
            <span className="text-base font-bold text-slate-100">
              {avgSleptThroughRate !== null ? `${avgSleptThroughRate}%` : 'N/A'}
            </span>
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
              const qualityDiff = insight.difference ?? 0;
              const qualityPositive = qualityDiff > 0;
              const qualityNegative = qualityDiff < 0;

              const continuityDiff = insight.sleptThroughDifference ?? 0;
              const continuityPositive = continuityDiff > 0;
              const continuityNegative = continuityDiff < 0;

              // Visual scales:
              // Cap quality diff at 1.5 for visual rendering
              const maxQualityScale = 1.5;
              const qualityBarPercent = Math.min((Math.abs(qualityDiff) / maxQualityScale) * 100, 100);

              // Cap continuity diff at 40% for visual rendering
              const maxContinuityScale = 40.0;
              const continuityBarPercent = Math.min((Math.abs(continuityDiff) / maxContinuityScale) * 100, 100);

              return (
                <div
                  key={insight.tag}
                  className="glass-card p-4 rounded-2xl border border-card-border space-y-4"
                >
                  {/* Header: Tag Name and Sample Size */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900/40">
                    <span className="font-semibold text-sm text-slate-200">
                      {insight.tag}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-950/40 px-2 py-0.5 rounded-md border border-slate-900/30">
                      {insight.sampleSize} night{insight.sampleSize > 1 ? 's' : ''} logged
                    </span>
                  </div>

                  {/* Dual Grid: Quality & Continuity */}
                  <div className="space-y-3.5">
                    {/* Metric 1: Sleep Quality */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450 flex items-center gap-1 font-medium">
                          <Star className="w-3.5 h-3.5 text-amber-450 fill-current" />
                          <span>Quality Impact</span>
                        </span>
                        {qualityDiff !== 0 ? (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                              qualityPositive
                                ? 'bg-emerald-950 border border-emerald-500/20 text-emerald-400'
                                : qualityNegative
                                ? 'bg-red-950 border border-red-500/20 text-red-400'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {qualityPositive ? `+${qualityDiff}` : qualityDiff} score
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">No impact</span>
                        )}
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>With: <strong className="text-slate-350">{insight.withAverage?.toFixed(1) ?? 'N/A'}</strong></span>
                        <span>Without: <strong className="text-slate-350">{insight.withoutAverage?.toFixed(1) ?? 'N/A'}</strong></span>
                      </div>
                      {qualityDiff !== 0 && (
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              qualityPositive ? 'bg-emerald-550/80' : 'bg-red-550/80'
                            }`}
                            style={{ width: `${qualityBarPercent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Metric 2: Slept Through Continuity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450 flex items-center gap-1 font-medium font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Slept Through Night</span>
                        </span>
                        {continuityDiff !== 0 ? (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                              continuityPositive
                                ? 'bg-emerald-950 border border-emerald-500/20 text-emerald-400'
                                : continuityNegative
                                ? 'bg-red-950 border border-red-500/20 text-red-400'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {continuityPositive ? `+${continuityDiff.toFixed(0)}%` : `${continuityDiff.toFixed(0)}%`} rate
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">No impact</span>
                        )}
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>With: <strong className="text-slate-350">{insight.withSleptThroughRate !== null ? `${insight.withSleptThroughRate.toFixed(0)}%` : 'N/A'}</strong></span>
                        <span>Without: <strong className="text-slate-350">{insight.withoutSleptThroughRate !== null ? `${insight.withoutSleptThroughRate.toFixed(0)}%` : 'N/A'}</strong></span>
                      </div>
                      {continuityDiff !== 0 && (
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              continuityPositive ? 'bg-emerald-550/80' : 'bg-red-550/80'
                            }`}
                            style={{ width: `${continuityBarPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

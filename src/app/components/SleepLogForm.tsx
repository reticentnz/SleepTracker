'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SleepLog, WakeStatus, DEFAULT_TAGS } from '@/lib/types';
import { saveSleepLog } from '@/lib/actions';
import { Calendar, Clock, Star, Check, Loader2, AlertCircle } from 'lucide-react';

interface SleepLogFormProps {
  selectedDate: string;
  initialLog: SleepLog | null;
}

export default function SleepLogForm({ selectedDate, initialLog }: SleepLogFormProps) {
  const router = useRouter();

  const [date, setDate] = useState(selectedDate);
  const [bedTime, setBedTime] = useState(initialLog?.bed_time || '');
  const [wakeTime, setWakeTime] = useState(initialLog?.wake_time || '');
  const [wakeStatus, setWakeStatus] = useState<WakeStatus>(initialLog?.wake_status || 'none');
  const [sleepQuality, setSleepQuality] = useState<number | null>(initialLog?.sleep_quality ?? null);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialLog?.tags || []);
  const [notes, setNotes] = useState(initialLog?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    router.push(`/?date=${newDate}`);
  };

  const getOffsetDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('sv');
  };

  const todayStr = getOffsetDate(0);
  const yesterdayStr = getOffsetDate(-1);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await saveSleepLog({
        log_date: date,
        bed_time: bedTime || null,
        wake_time: wakeTime || null,
        wake_status: wakeStatus,
        sleep_quality: sleepQuality,
        notes: notes || null,
        tags: selectedTags,
      });

      setSaveSuccess(true);
      router.refresh();
      // Reset success indicator after 3.5s
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the database. Please verify your connection config.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const qualityLabels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* Date Selection Box */}
      <div className="glass-card p-4 rounded-2xl border border-card-border space-y-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sleep Date</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => handleDateChange(todayStr)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              date === todayStr
                ? 'bg-indigo-600 border-indigo-500 text-white glow-indigo'
                : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleDateChange(yesterdayStr)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              date === yesterdayStr
                ? 'bg-indigo-600 border-indigo-500 text-white glow-indigo'
                : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            Yesterday
          </button>
        </div>
      </div>

      {/* Bed & Wake Times */}
      <div className="glass-card p-4 rounded-2xl border border-card-border space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Time Window (Optional)</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Bed time</label>
            <input
              type="time"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Wake time</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Did you wake during the night? */}
      <div className="glass-card p-4 rounded-2xl border border-card-border space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Did you wake during the night?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: 'none', label: 'No' },
              { key: 'once', label: 'Once' },
              { key: 'multiple', label: 'Multiple times' },
              { key: 'long_awake', label: 'Awake for ages' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setWakeStatus(item.key)}
              className={`p-3 rounded-xl border text-xs font-medium transition-all text-center ${
                wakeStatus === item.key
                  ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Quality (Stars) */}
      <div className="glass-card p-4 rounded-2xl border border-card-border space-y-3 text-center">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block text-left">
          Sleep Quality
        </label>
        <div className="flex justify-center gap-3 py-2">
          {[1, 2, 3, 4, 5].map((val) => {
            const active = sleepQuality !== null && val <= sleepQuality;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setSleepQuality(val)}
                className={`p-1.5 rounded-full transition-transform active:scale-95 ${
                  active ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <Star className="w-8 h-8 fill-current stroke-current" />
              </button>
            );
          })}
        </div>
        {sleepQuality !== null && (
          <span className="inline-block text-xs font-semibold text-indigo-400 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-900/30">
            {sleepQuality}/5 — {qualityLabels[sleepQuality - 1]}
          </span>
        )}
      </div>

      {/* Things that happened */}
      <div className="glass-card p-4 rounded-2xl border border-card-border space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Things that happened yesterday
        </label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/35 border-indigo-500/80 text-white shadow-sm shadow-indigo-900/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-350'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="glass-card p-4 rounded-2xl border border-card-border space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Capture weird one-offs, vivid dreams, or specific details..."
          rows={3}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>

      {/* Error and Success Indicators */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-medium animate-pulse">
          <Check className="w-4 h-4 shrink-0" />
          <span>Sleep log saved successfully!</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-indigo-600 border border-indigo-500 hover:bg-indigo-550 text-white text-sm font-semibold rounded-2xl shadow-lg glow-indigo transition-all active:scale-99 flex items-center justify-center gap-2 hover:shadow-indigo-600/10 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving Log...</span>
          </>
        ) : (
          <span>Save Sleep Log</span>
        )}
      </button>
    </form>
  );
}

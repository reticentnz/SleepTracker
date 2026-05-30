'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SleepLog, WakeStatus } from '@/lib/types';
import { saveSleepLog, addUserTag, deleteUserTag } from '@/lib/actions';
import { Calendar, Clock, Star, Check, Loader2, AlertCircle, Plus, X, HelpCircle, BookOpen } from 'lucide-react';

interface SleepLogFormProps {
  selectedDate: string;
  initialLog: SleepLog | null;
  availableTags: string[];
}

export default function SleepLogForm({ selectedDate, initialLog, availableTags }: SleepLogFormProps) {
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
  const [showGuide, setShowGuide] = useState(false);

  // Custom tags list states
  const [tagsList, setTagsList] = useState<string[]>(availableTags);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [deletingTag, setDeletingTag] = useState<string | null>(null);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagToAdd = newTagInput.trim();
    if (!tagToAdd) return;
    if (tagsList.includes(tagToAdd)) {
      setNewTagInput('');
      return;
    }
    setIsAddingTag(true);
    setError(null);
    try {
      const res = await addUserTag(tagToAdd);
      if (res && res.tags) {
        setTagsList(res.tags);
      } else {
        setTagsList(prev => [...prev, tagToAdd].sort());
      }
      setNewTagInput('');
    } catch (err) {
      console.error(err);
      setError('Could not add custom factor.');
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleDeleteTag = async (tagToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDeletingTag(tagToDelete);
    setError(null);
    try {
      const res = await deleteUserTag(tagToDelete);
      if (res && res.tags) {
        setTagsList(res.tags);
      } else {
        setTagsList(prev => prev.filter(t => t !== tagToDelete));
      }
      if (selectedTags.includes(tagToDelete)) {
        setSelectedTags(prev => prev.filter(t => t !== tagToDelete));
      }
    } catch (err) {
      console.error(err);
      setError('Could not delete custom factor.');
    } finally {
      setDeletingTag(null);
    }
  };

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
      <div className="glass-card p-4 rounded-2xl border border-card-border space-y-3 text-center animate-fadeIn">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block text-left">
            Sleep Quality
          </label>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showGuide ? 'Hide Guide' : 'Explain Scale'}</span>
          </button>
        </div>

        {showGuide && (
          <div className="text-left bg-slate-950/70 border border-indigo-500/15 rounded-xl p-3.5 space-y-3 text-[11px] leading-relaxed text-slate-300">
            <div>
              <h4 className="font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Rating Scale (1 - 5)
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <strong className="text-slate-200">1 — Terrible:</strong> Fitful sleep, woke up exhausted, or barely slept at all.
                </li>
                <li>
                  <strong className="text-slate-200">2 — Poor:</strong> Tossed and turned heavily, woke multiple times, felt unrefreshed.
                </li>
                <li>
                  <strong className="text-slate-200">3 — Average:</strong> Adequate sleep with minor interruptions, felt moderately rested.
                </li>
                <li>
                  <strong className="text-slate-200">4 — Good:</strong> Slept soundly with minimal/no wakeups, woke feeling refreshed.
                </li>
                <li>
                  <strong className="text-slate-200">5 — Excellent:</strong> Highly restorative, deep uninterrupted sleep, feeling fully energized.
                </li>
              </ul>
            </div>
            <div className="pt-2 border-t border-slate-900/60">
              <h4 className="font-semibold text-indigo-350 mb-1">How is sleep measured?</h4>
              <p className="text-slate-400">
                To identify what helps or hurts your sleep, we calculate a <strong className="text-slate-300">Combined Sleep Score</strong> (1-5) using:
              </p>
              <div className="my-1.5 p-2 bg-slate-900/65 border border-slate-850 rounded-lg text-center font-mono text-indigo-400 font-bold text-xs">
                (Subjective Quality + Continuity) / 2
              </div>
              <p className="text-slate-400 leading-relaxed">
                Continuity is based on night awakenings: <span className="text-slate-300">No interruptions</span> (5.0), <span className="text-slate-300">Once</span> (3.5), <span className="text-slate-300">Multiple</span> (2.0), or <span className="text-slate-350">Awake for ages</span> (1.0).
              </p>
            </div>
          </div>
        )}

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
      <div className="glass-card p-4 rounded-2xl border border-card-border space-y-4">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Things that happened yesterday
        </label>
        <div className="flex flex-wrap gap-2">
          {tagsList.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`pl-3 pr-2 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600/35 border-indigo-500/80 text-white shadow-sm shadow-indigo-900/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-350'
                }`}
              >
                <span>{tag}</span>
                <span
                  onClick={(e) => handleDeleteTag(tag, e)}
                  className="p-0.5 rounded-full hover:bg-slate-800/80 text-slate-500 hover:text-red-400 transition-colors"
                  title={`Delete "${tag}" option`}
                >
                  {deletingTag === tag ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </span>
              </button>
            );
          })}
          {tagsList.length === 0 && (
            <p className="text-xs text-slate-500 italic py-1">No factors defined. Add one below!</p>
          )}
        </div>

        {/* Add custom tag input */}
        <div className="pt-3.5 border-t border-slate-900/80 flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Add new custom factor (e.g. Tea, Rain, Hot bath)..."
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={isAddingTag || !newTagInput.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl border border-indigo-500 transition-all flex items-center gap-1 shrink-0"
          >
            {isAddingTag ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Add</span>
          </button>
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

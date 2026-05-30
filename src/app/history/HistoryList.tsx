'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SleepLog, WakeStatus } from '@/lib/types';
import { deleteSleepLog } from '@/lib/actions';
import { Calendar, Trash2, Edit2, Moon, AlertCircle, Loader2, Star } from 'lucide-react';

interface HistoryListProps {
  initialLogs: SleepLog[];
}

export default function HistoryList({ initialLogs }: HistoryListProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<SleepLog[]>(initialLogs);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state if initial logs update
  if (initialLogs.length !== logs.length && deletingId === null) {
    setLogs(initialLogs);
  }

  // Format YYYY-MM-DD to "Fri, May 29"
  const formatHistoryDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Convert 24h HH:MM to 12h (10:45pm)
  const format12Hour = (timeStr: string | null): string | null => {
    if (!timeStr) return null;
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${mStr}${ampm}`;
  };

  // Calculate duration across midnight
  const calculateDuration = (bedTime: string | null, wakeTime: string | null): string | null => {
    if (!bedTime || !wakeTime) return null;
    const [bedH, bedM] = bedTime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);

    const bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;

    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60; // Next day
    }

    const diff = wakeMinutes - bedMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Map wake status to user friendly string
  const getWakeLabel = (status: WakeStatus): string => {
    const labels: Record<WakeStatus, string> = {
      none: 'No interruptions',
      once: 'Woke once',
      multiple: 'Woke multiple times',
      long_awake: 'Awake for ages',
    };
    return labels[status] || status;
  };

  const handleDelete = async (id: string, dateStr: string) => {
    if (!confirm(`Are you sure you want to delete the sleep log for ${formatHistoryDate(dateStr)}?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await deleteSleepLog(id);
      setLogs(logs.filter((log) => log.id !== id));
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Failed to delete sleep log. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (dateStr: string) => {
    router.push(`/?date=${dateStr}`);
  };

  if (logs.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-card-border text-center space-y-4 py-12">
        <div className="w-12 h-12 rounded-full bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
          <Moon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-200">No logs found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You haven&apos;t logged any sleep sessions yet. Get started by logging today&apos;s sleep!
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 border border-indigo-500 text-xs font-semibold rounded-xl shadow-md glow-indigo text-white transition-all active:scale-95"
        >
          Log Sleep Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {logs.map((log) => {
          const formattedBed = format12Hour(log.bed_time);
          const formattedWake = format12Hour(log.wake_time);
          const duration = calculateDuration(log.bed_time, log.wake_time);

          return (
            <div
              key={log.id}
              className="glass-card p-4 rounded-2xl border border-card-border hover:border-indigo-500/20 transition-all space-y-3 relative group"
            >
              {/* Header: Date and Actions */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {formatHistoryDate(log.log_date)}
                  </h3>
                  {formattedBed && formattedWake && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Sleep: {formattedBed} – {formattedWake}
                      {duration && <span className="text-indigo-400 font-medium ml-1.5">({duration})</span>}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(log.log_date)}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40 rounded-lg transition-colors"
                    title="Edit log"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(log.id, log.log_date)}
                    disabled={deletingId === log.id}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/40 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete log"
                  >
                    {deletingId === log.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quality & Interruptions Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {log.sleep_quality !== null && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    {log.sleep_quality}/5
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-350">
                  {getWakeLabel(log.wake_status)}
                </span>
              </div>

              {/* Tags Section */}
              {log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {log.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-indigo-950/40 border border-indigo-900/35 text-indigo-300 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {log.notes && (
                <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/30 p-2.5 rounded-xl border border-slate-900/50 italic">
                  &ldquo;{log.notes}&rdquo;
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

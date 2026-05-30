import { getSleepLog, getUserTags } from '@/lib/actions';
import SleepLogForm from './components/SleepLogForm';
import SetupInstructions from './components/SetupInstructions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  // Check if DATABASE_URL is set in env
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

  const resolvedParams = await searchParams;
  // Format local date to YYYY-MM-DD in timezone-agnostic local string format
  const todayStr = new Date().toLocaleDateString('sv');
  const selectedDate = resolvedParams.date || todayStr;

  // Retrieve current log for this date
  const initialLog = await getSleepLog(selectedDate);
  const availableTags = await getUserTags();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
          Log Last Night
        </h1>
        <p className="text-xs text-slate-400">
          Spot habits and factors influencing your sleep quality
        </p>
      </div>
      <SleepLogForm
        key={selectedDate}
        selectedDate={selectedDate}
        initialLog={initialLog}
        availableTags={availableTags}
      />
    </div>
  );
}

import { getSleepHistory } from '@/lib/actions';
import HistoryList from './HistoryList';
import SetupInstructions from '../components/SetupInstructions';

export default async function HistoryPage() {
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

  // Fetch all sleep logs from database
  const logs = await getSleepHistory();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
          Sleep History
        </h1>
        <p className="text-xs text-slate-400">
          Review your recorded sleep logs and daily factors
        </p>
      </div>
      <HistoryList initialLogs={logs} />
    </div>
  );
}

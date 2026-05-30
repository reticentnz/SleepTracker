export type WakeStatus = "none" | "once" | "multiple" | "long_awake";

export type SleepLog = {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD format
  bed_time: string | null; // HH:MM format
  wake_time: string | null; // HH:MM format
  wake_status: WakeStatus;
  sleep_quality: number | null; // 1 to 5
  notes: string | null;
  tags: string[];
};

export type TagInsight = {
  tag: string;
  withAverage: number | null;
  withoutAverage: number | null;
  difference: number | null;
  withSleptThroughRate: number | null;
  withoutSleptThroughRate: number | null;
  sleptThroughDifference: number | null;
  sampleSize: number;
};

export const DEFAULT_TAGS = [
  "Magnesium glycinate",
  "Read before bed",
  "Gym",
  "8000 steps",
  "Alcohol",
  "Late caffeine",
  "Late food",
  "Stressful day",
  "Sick / cold",
  "Kids woke me",
  "Screen in bed",
  "Poor mood",
  "Good mood",
];

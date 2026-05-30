'use server';

import { revalidatePath } from 'next/cache';
import { getDbClient, ensureSchema, DEFAULT_USER_ID } from './db';
import { SleepLog, WakeStatus, TagInsight, DEFAULT_TAGS } from './types';

// Helper to format date safely to YYYY-MM-DD
function formatDate(dateVal: Date | string | null | undefined): string {
  if (dateVal instanceof Date) {
    const y = dateVal.getUTCFullYear();
    const m = String(dateVal.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }
  return '';
}

// Helper to format time to HH:MM
function formatTime(timeVal: string | null | undefined): string | null {
  if (!timeVal) return null;
  return String(timeVal).slice(0, 5);
}

/**
 * Fetch a sleep log for a specific date
 */
export async function getSleepLog(dateStr: string): Promise<SleepLog | null> {
  await ensureSchema();
  const sql = getDbClient();

  try {
    const logRows = await sql`
      SELECT id, log_date, bed_time, wake_time, wake_status, sleep_quality, notes
      FROM sleep_logs
      WHERE user_id = ${DEFAULT_USER_ID} AND log_date = ${dateStr}
      LIMIT 1
    `;

    if (logRows.length === 0) return null;

    const row = logRows[0];
    const tagsRows = await sql`
      SELECT tag
      FROM sleep_log_tags
      WHERE sleep_log_id = ${row.id}
    `;

    return {
      id: row.id,
      user_id: DEFAULT_USER_ID,
      log_date: formatDate(row.log_date),
      bed_time: formatTime(row.bed_time),
      wake_time: formatTime(row.wake_time),
      wake_status: row.wake_status as WakeStatus,
      sleep_quality: row.sleep_quality,
      notes: row.notes,
      tags: tagsRows.map(t => t.tag),
    };
  } catch (error) {
    console.error(`Error fetching sleep log for ${dateStr}:`, error);
    return null;
  }
}

/**
 * Save (insert or update) a sleep log
 */
export async function saveSleepLog(logData: {
  log_date: string;
  bed_time: string | null;
  wake_time: string | null;
  wake_status: WakeStatus;
  sleep_quality: number | null;
  notes: string | null;
  tags: string[];
}) {
  await ensureSchema();
  const sql = getDbClient();

  try {
    const bedTime = logData.bed_time || null;
    const wakeTime = logData.wake_time || null;

    // Upsert the main sleep log record
    const rows = await sql`
      INSERT INTO sleep_logs (user_id, log_date, bed_time, wake_time, wake_status, sleep_quality, notes)
      VALUES (${DEFAULT_USER_ID}, ${logData.log_date}, ${bedTime}, ${wakeTime}, ${logData.wake_status}, ${logData.sleep_quality}, ${logData.notes})
      ON CONFLICT (user_id, log_date) DO UPDATE
      SET bed_time = EXCLUDED.bed_time,
          wake_time = EXCLUDED.wake_time,
          wake_status = EXCLUDED.wake_status,
          sleep_quality = EXCLUDED.sleep_quality,
          notes = EXCLUDED.notes,
          updated_at = NOW()
      RETURNING id
    `;

    const logId = rows[0].id;

    // Delete existing tags for this log
    await sql`
      DELETE FROM sleep_log_tags
      WHERE sleep_log_id = ${logId}
    `;

    // Insert new tags sequentially
    if (logData.tags.length > 0) {
      for (const tag of logData.tags) {
        await sql`
          INSERT INTO sleep_log_tags (sleep_log_id, tag)
          VALUES (${logId}, ${tag})
        `;
      }
    }

    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/insights');
    return { success: true };
  } catch (error) {
    console.error('Error saving sleep log:', error);
    throw error;
  }
}

/**
 * Delete a sleep log by ID
 */
export async function deleteSleepLog(id: string) {
  await ensureSchema();
  const sql = getDbClient();

  try {
    await sql`
      DELETE FROM sleep_logs
      WHERE id = ${id} AND user_id = ${DEFAULT_USER_ID}
    `;

    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/insights');
    return { success: true };
  } catch (error) {
    console.error(`Error deleting sleep log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Retrieve all sleep history with tags, sorted by date descending
 */
export async function getSleepHistory(): Promise<SleepLog[]> {
  await ensureSchema();
  const sql = getDbClient();

  try {
    const logs = await sql`
      SELECT id, log_date, bed_time, wake_time, wake_status, sleep_quality, notes
      FROM sleep_logs
      WHERE user_id = ${DEFAULT_USER_ID}
      ORDER BY log_date DESC
    `;

    if (logs.length === 0) return [];

    const logIds = logs.map(l => l.id);
    const tagsResult = await sql`
      SELECT sleep_log_id, tag
      FROM sleep_log_tags
      WHERE sleep_log_id = ANY(${logIds})
    `;

    // Map tags back to log ids
    const tagsMap: Record<string, string[]> = {};
    for (const row of tagsResult) {
      if (!tagsMap[row.sleep_log_id]) {
        tagsMap[row.sleep_log_id] = [];
      }
      tagsMap[row.sleep_log_id].push(row.tag);
    }

    return logs.map(row => ({
      id: row.id,
      user_id: DEFAULT_USER_ID,
      log_date: formatDate(row.log_date),
      bed_time: formatTime(row.bed_time),
      wake_time: formatTime(row.wake_time),
      wake_status: row.wake_status as WakeStatus,
      sleep_quality: row.sleep_quality,
      notes: row.notes,
      tags: tagsMap[row.id] || [],
    }));
  } catch (error) {
    console.error('Error fetching sleep history:', error);
    return [];
  }
}

/**
 * Calculate patterns, averages, helpers, and disruptors
 */
/**
 * Helper to calculate combined sleep score (out of 5) based on subjective quality and sleep continuity
 */
function getCombinedSleepScore(log: SleepLog): number | null {
  if (log.sleep_quality === null) return null;

  let continuityScore = 5.0;
  if (log.wake_status === 'once') continuityScore = 3.5;
  else if (log.wake_status === 'multiple') continuityScore = 2.0;
  else if (log.wake_status === 'long_awake') continuityScore = 1.0;

  return (log.sleep_quality + continuityScore) / 2;
}

/**
 * Calculate patterns, averages, helpers, and disruptors
 */
export async function getSleepInsights() {
  const logs = await getSleepHistory();

  const logsWithQuality = logs.filter(l => l.sleep_quality !== null);
  const totalNights = logs.length;
  const avgQuality = logsWithQuality.length > 0
    ? parseFloat((logsWithQuality.reduce((sum, l) => sum + l.sleep_quality!, 0) / logsWithQuality.length).toFixed(2))
    : null;

  const sleptThroughLogs = logs.filter(l => l.wake_status === 'none');
  const avgSleptThroughRate = totalNights > 0
    ? parseFloat(((sleptThroughLogs.length / totalNights) * 100).toFixed(0))
    : null;

  // Use unique tags logged + default tags
  const uniqueTags = Array.from(new Set([
    ...DEFAULT_TAGS,
    ...logs.flatMap(l => l.tags)
  ]));

  const tagInsights: TagInsight[] = uniqueTags.map(tag => {
    const withTag = logs.filter(l => l.tags.includes(tag) && l.sleep_quality !== null);
    const withoutTag = logs.filter(l => !l.tags.includes(tag) && l.sleep_quality !== null);

    // Subjective quality calculations
    const withAvg = withTag.length > 0 ? withTag.reduce((sum, l) => sum + l.sleep_quality!, 0) / withTag.length : null;
    const withoutAvg = withoutTag.length > 0 ? withoutTag.reduce((sum, l) => sum + l.sleep_quality!, 0) / withoutTag.length : null;
    const difference = withAvg !== null && withoutAvg !== null ? parseFloat((withAvg - withoutAvg).toFixed(2)) : null;

    // Sleep continuity (slept through) calculations
    const withSleptThroughCount = withTag.filter(l => l.wake_status === 'none').length;
    const withSleptThroughRate = withTag.length > 0
      ? parseFloat(((withSleptThroughCount / withTag.length) * 100).toFixed(1))
      : null;

    const withoutSleptThroughCount = withoutTag.filter(l => l.wake_status === 'none').length;
    const withoutSleptThroughRate = withoutTag.length > 0
      ? parseFloat(((withoutSleptThroughCount / withoutTag.length) * 100).toFixed(1))
      : null;

    const sleptThroughDifference = withSleptThroughRate !== null && withoutSleptThroughRate !== null
      ? parseFloat((withSleptThroughRate - withoutSleptThroughRate).toFixed(1))
      : null;

    return {
      tag,
      withAverage: withAvg !== null ? parseFloat(withAvg.toFixed(2)) : null,
      withoutAverage: withoutAvg !== null ? parseFloat(withoutAvg.toFixed(2)) : null,
      difference,
      withSleptThroughRate,
      withoutSleptThroughRate,
      sleptThroughDifference,
      sampleSize: withTag.length
    };
  }).filter(insight => insight.sampleSize > 0); // Only return insights for tags that have been tracked at least once

  // Top disruptors: tags associated with poor combined sleep score (<= 3.0)
  const badSleepLogs = logs.filter(l => {
    const score = getCombinedSleepScore(l);
    return score !== null && score <= 3.0;
  });
  const badSleepTagCounts: Record<string, number> = {};
  for (const log of badSleepLogs) {
    for (const tag of log.tags) {
      badSleepTagCounts[tag] = (badSleepTagCounts[tag] || 0) + 1;
    }
  }
  const topDisruptors = Object.entries(badSleepTagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // Top helpers: tags associated with good combined sleep score (>= 4.0)
  const goodSleepLogs = logs.filter(l => {
    const score = getCombinedSleepScore(l);
    return score !== null && score >= 4.0;
  });
  const goodSleepTagCounts: Record<string, number> = {};
  for (const log of goodSleepLogs) {
    for (const tag of log.tags) {
      goodSleepTagCounts[tag] = (goodSleepTagCounts[tag] || 0) + 1;
    }
  }
  const topHelpers = Object.entries(goodSleepTagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalNights,
    avgQuality,
    avgSleptThroughRate,
    tagInsights: tagInsights.sort((a, b) => {
      // Sort by average of normalized absolute differences to highlight overall strong impact
      const qualityWeightA = Math.abs(a.difference || 0) / 4.0;
      const continuityWeightA = Math.abs(a.sleptThroughDifference || 0) / 100.0;
      const scoreA = qualityWeightA + continuityWeightA;

      const qualityWeightB = Math.abs(b.difference || 0) / 4.0;
      const continuityWeightB = Math.abs(b.sleptThroughDifference || 0) / 100.0;
      const scoreB = qualityWeightB + continuityWeightB;

      return scoreB - scoreA;
    }),
    topDisruptors,
    topHelpers
  };
}

/**
 * Fetch list of custom/default tags for the user
 */
export async function getUserTags(): Promise<string[]> {
  await ensureSchema();
  const sql = getDbClient();

  try {
    const rows = await sql`
      SELECT tag
      FROM user_tags
      WHERE user_id = ${DEFAULT_USER_ID}
      ORDER BY tag ASC
    `;
    return rows.map(r => r.tag);
  } catch (error) {
    console.error('Error fetching user tags:', error);
    return DEFAULT_TAGS;
  }
}

/**
 * Add a new customized tag option
 */
export async function addUserTag(tag: string) {
  await ensureSchema();
  const sql = getDbClient();
  const trimmed = tag.trim();

  if (!trimmed) {
    throw new Error('Tag cannot be empty');
  }

  try {
    await sql`
      INSERT INTO user_tags (user_id, tag)
      VALUES (${DEFAULT_USER_ID}, ${trimmed})
      ON CONFLICT (user_id, tag) DO NOTHING
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding user tag:', error);
    throw error;
  }
}

/**
 * Delete a customized tag option
 */
export async function deleteUserTag(tag: string) {
  await ensureSchema();
  const sql = getDbClient();

  try {
    await sql`
      DELETE FROM user_tags
      WHERE user_id = ${DEFAULT_USER_ID} AND tag = ${tag}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user tag:', error);
    throw error;
  }
}


/**
 * @format
 */

import { ChartLine } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import EntryCard from '../components/EntryCard';
import MonoLabel from '../components/MonoLabel';
import SleepSummarySheet from '../components/SleepSummarySheet';
import StatTile from '../components/StatTile';
import SummaryCard from '../components/SummaryCard';
import { useSleepSummary } from '../hooks/useSleepSummary';
import { formatDate, formatElapsed, formatTimeOfDay } from '../lib/sleepLog';
import { buildSummaryRequest } from '../lib/summaryRequest';
import { useLogSummary } from '../store/useLogStore';
import { colors, spacing, typography } from '../theme';
import type { LogWithStats } from '../types/log';

const emptySummary =
  'Once there are a few nights logged, a short read of the patterns shows up here — typical bedtime, how the stretches are trending, and the nights that stood out.';

function buildSummary(
  entries: LogWithStats[],
  averageElapsedMs: number,
  maxElapsedMs: number,
): string {
  if (entries.length === 0) {
    return emptySummary;
  }

  const nights = entries.length === 1 ? '1 night' : `${entries.length} nights`;
  const longest = entries.reduce((best, entry) =>
    entry.elapsedMs > best.elapsedMs ? entry : best,
  );

  return `Mia averaged ${formatElapsed(
    averageElapsedMs,
  )} across ${nights}. The longest stretch was ${formatElapsed(
    maxElapsedMs,
  )} on ${formatDate(longest.date)}.`;
}

function AnalysisScreen() {
  const { entries, averageElapsedMs, maxElapsedMs } = useLogSummary();
  const [selected, setSelected] = useState<LogWithStats | null>(null);
  const { state, run, reset } = useSleepSummary();

  const openSummary = useCallback(
    (entry: LogWithStats) => {
      setSelected(entry);
      run(buildSummaryRequest(entry));
    },
    [run],
  );

  const closeSummary = useCallback(() => {
    setSelected(null);
    reset();
  }, [reset]);

  const retry = useCallback(() => {
    if (selected) {
      run(buildSummaryRequest(selected));
    }
  }, [run, selected]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppHeader badge="Mia · 4mo" />

      <FlatList
        contentContainerStyle={styles.content}
        data={entries}
        keyExtractor={entry => entry.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <EmptyState
              hint="Log a few nights to see patterns"
              icon={ChartLine}
              title="Nothing to analyze yet"
            />
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <MonoLabel>This week</MonoLabel>

            <View style={styles.stats}>
              <StatTile label="Entries" value={`${entries.length}`} />
              <StatTile
                label="Average"
                value={
                  entries.length === 0 ? '—' : formatElapsed(averageElapsedMs)
                }
              />
              <StatTile
                label="Longest"
                value={entries.length === 0 ? '—' : formatElapsed(maxElapsedMs)}
              />
            </View>

            <SummaryCard
              body={buildSummary(entries, averageElapsedMs, maxElapsedMs)}
              label="AI summary"
            />

            {entries.length === 0 ? null : (
              <View style={styles.listHeader}>
                <MonoLabel>All entries</MonoLabel>
                <Text style={styles.hint}>Tap a night for a summary</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <EntryCard
            date={formatDate(item.date)}
            duration={formatElapsed(item.elapsedMs)}
            endTime={formatTimeOfDay(item.wakeTime)}
            highlighted={item.id === selected?.id}
            note={item.notes}
            onPress={() => openSummary(item)}
            percentOfAverage={item.progressPercentage}
            progress={maxElapsedMs === 0 ? 0 : item.elapsedMs / maxElapsedMs}
            startTime={formatTimeOfDay(item.sleepTime)}
          />
        )}
      />

      <SleepSummarySheet
        date={selected ? formatDate(selected.date) : ''}
        detail={
          selected
            ? `${formatTimeOfDay(selected.sleepTime)} → ${formatTimeOfDay(
                selected.wakeTime,
              )} · ${formatElapsed(selected.elapsedMs)}`
            : ''
        }
        onClose={closeSummary}
        onRetry={retry}
        state={state}
        visible={selected !== null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  empty: {
    flex: 1,
    minHeight: 220,
  },
});

export default AnalysisScreen;

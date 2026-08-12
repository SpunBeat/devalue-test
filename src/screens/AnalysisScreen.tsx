/**
 * @format
 */

import { ChartLine } from 'lucide-react-native';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import EntryCard from '../components/EntryCard';
import MonoLabel from '../components/MonoLabel';
import StatTile from '../components/StatTile';
import SummaryCard from '../components/SummaryCard';
import { formatDate, formatElapsed, formatTimeOfDay } from '../lib/sleepLog';
import { useLogSummary } from '../store/useLogStore';
import { colors, spacing } from '../theme';
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
                value={entries.length === 0 ? '—' : formatElapsed(averageElapsedMs)}
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
              <MonoLabel style={styles.listLabel}>All entries</MonoLabel>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <EntryCard
            date={formatDate(item.date)}
            duration={formatElapsed(item.elapsedMs)}
            endTime={formatTimeOfDay(item.wakeTime)}
            note={item.notes}
            percentOfAverage={item.progressPercentage}
            progress={maxElapsedMs === 0 ? 0 : item.elapsedMs / maxElapsedMs}
            startTime={formatTimeOfDay(item.sleepTime)}
          />
        )}
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
  listLabel: {
    paddingTop: spacing.sm,
  },
  empty: {
    flex: 1,
    minHeight: 220,
  },
});

export default AnalysisScreen;

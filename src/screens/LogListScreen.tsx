/**
 * @format
 */

import { Moon, ScrollText, Sun } from 'lucide-react-native';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  formatClockTime,
  formatDate,
  formatElapsed,
  withStats,
} from '../lib/sleepLog';
import type { Log, LogWithStats } from '../types/log';

const logs: Log[] = [];

function LogRow({ log }: { log: LogWithStats }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.date}>{formatDate(log.date)}</Text>
        <Text style={styles.progress}>{log.progressPercentage}%</Text>
      </View>

      <View style={styles.times}>
        <Moon color="#6b7280" size={14} />
        <Text style={styles.time}>{formatClockTime(log.sleepTime)}</Text>
        <Sun color="#6b7280" size={14} />
        <Text style={styles.time}>{formatClockTime(log.wakeTime)}</Text>
        <Text style={styles.elapsed}>{formatElapsed(log.elapsedMs)}</Text>
      </View>

      {log.notes ? <Text style={styles.notes}>{log.notes}</Text> : null}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function EmptyList() {
  return (
    <View style={styles.empty}>
      <ScrollText color="#6b7280" size={40} />
      <Text style={styles.emptyTitle}>No logs yet</Text>
      <Text style={styles.emptySubtitle}>
        Logs will show up here once there are any to display.
      </Text>
    </View>
  );
}

function LogListScreen() {
  // Progress is relative to the list average, so it is recomputed whenever the
  // list changes rather than stored on each log.
  const data = useMemo(() => withStats(logs), []);

  return (
    <FlatList
      data={data}
      keyExtractor={log => log.id}
      renderItem={({ item }) => <LogRow log={item} />}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={EmptyList}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  row: {
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
  },
  progress: {
    color: '#1f6feb',
    fontSize: 13,
    fontWeight: '600',
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    color: '#374151',
    fontSize: 14,
    marginRight: 6,
  },
  elapsed: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  notes: {
    color: '#6b7280',
    fontSize: 13,
  },
  separator: {
    backgroundColor: '#e5e7eb',
    height: StyleSheet.hairlineWidth,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LogListScreen;

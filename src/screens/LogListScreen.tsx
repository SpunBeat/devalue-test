/**
 * @format
 */

import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddEntrySheet from '../components/AddEntrySheet';
import type { AddEntryValues } from '../components/AddEntrySheet';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import EntryCard from '../components/EntryCard';
import FAB from '../components/FAB';
import MonoLabel from '../components/MonoLabel';
import Pill from '../components/Pill';
import {
  formatDate,
  formatElapsed,
  formatTimeOfDay,
  todayIsoDate,
} from '../lib/sleepLog';
import { useLogStore, useLogSummary } from '../store/useLogStore';
import { colors, spacing } from '../theme';

function LogListScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const { entries, maxElapsedMs } = useLogSummary();
  const addEntry = useLogStore(state => state.addEntry);

  const submit = (values: AddEntryValues) =>
    addEntry({
      date: values.date,
      sleepTime: values.sleepTime,
      wakeTime: values.wakeTime,
      notes: values.notes,
    });

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppHeader badge="Mia · 4mo" />

      <FlatList
        contentContainerStyle={[
          styles.content,
          entries.length === 0 && styles.contentEmpty,
        ]}
        data={entries}
        keyExtractor={entry => entry.id}
        ListEmptyComponent={
          <EmptyState
            hint="Tap + to log your first sleep"
            title="No entries yet"
          />
        }
        ListHeaderComponent={
          entries.length === 0 ? undefined : (
            <View style={styles.listHeader}>
              <MonoLabel>This week</MonoLabel>
              <Pill
                label={`${entries.length} ${
                  entries.length === 1 ? 'entry' : 'entries'
                }`}
                uppercase
                variant="mint"
              />
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <EntryCard
            date={formatDate(item.date)}
            duration={formatElapsed(item.elapsedMs)}
            endTime={formatTimeOfDay(item.wakeTime)}
            highlighted={index === 0}
            note={item.notes}
            percentOfAverage={item.progressPercentage}
            progress={maxElapsedMs === 0 ? 0 : item.elapsedMs / maxElapsedMs}
            startTime={formatTimeOfDay(item.sleepTime)}
          />
        )}
      />

      <FAB
        accessibilityLabel="Add sleep entry"
        onPress={() => setSheetVisible(true)}
      />

      <AddEntrySheet
        defaultDate={todayIsoDate()}
        onClose={() => setSheetVisible(false)}
        onSubmit={submit}
        visible={sheetVisible}
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
    paddingBottom: 96,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  contentEmpty: {
    justifyContent: 'center',
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
});

export default LogListScreen;

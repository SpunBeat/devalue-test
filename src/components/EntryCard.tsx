/**
 * One sleep entry: date, time range, duration, how it compares, optional note.
 *
 * @format
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '../theme';
import MonoLabel from './MonoLabel';
import Pill from './Pill';

type EntryCardProps = {
  /** Preformatted, e.g. 'Aug 11, 2026'. */
  date: string;
  /** Preformatted, e.g. '9:10 pm'. */
  startTime: string;
  /** Preformatted, e.g. '4:55 am'. */
  endTime: string;
  /** Preformatted, e.g. '7h 45m'. */
  duration: string;
  /** 0–1, this entry's duration against the longest in the list. */
  progress: number;
  /** Duration as a percentage of the list average; 100 is average. */
  percentOfAverage?: number;
  note?: string;
  /** Indigo wash for the latest entry. */
  highlighted?: boolean;
  onPress?: () => void;
};

function EntryCard({
  date,
  startTime,
  endTime,
  duration,
  progress,
  percentOfAverage,
  note,
  highlighted = false,
  onPress,
}: EntryCardProps) {
  const fill = `${Math.min(Math.max(progress, 0), 1) * 100}%`;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.cardHighlighted,
        pressed && styles.cardPressed,
      ]}>
      <MonoLabel>{date}</MonoLabel>

      <Text style={styles.timeRange}>
        {startTime} <Text style={styles.arrow}>→</Text> {endTime}
      </Text>

      <View style={styles.meta}>
        <Pill label={duration} variant="primary" />
        {percentOfAverage === undefined ? null : (
          <MonoLabel>{percentOfAverage}% of avg</MonoLabel>
        )}
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: fill }]} />
      </View>

      {note ? (
        <View style={styles.noteWrapper}>
          <Text style={styles.note}>{note}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardHighlighted: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  cardPressed: {
    opacity: 0.85,
  },
  timeRange: {
    ...typography.timeRange,
    color: colors.textPrimary,
  },
  arrow: {
    color: colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  track: {
    backgroundColor: colors.track,
    borderRadius: radii.pill,
    height: 4,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: '100%',
  },
  noteWrapper: {
    borderTopColor: colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    paddingTop: spacing.md,
  },
  note: {
    ...typography.body,
    color: colors.textMuted,
  },
});

export default EntryCard;

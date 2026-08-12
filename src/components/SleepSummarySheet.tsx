/**
 * Bottom sheet showing the AI summary for one tapped entry.
 *
 * @format
 */

import { Sparkles } from 'lucide-react-native';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { SleepSummaryState } from '../hooks/useSleepSummary';
import { colors, radii, spacing, typography } from '../theme';
import BottomSheet from './BottomSheet';
import MonoLabel from './MonoLabel';
import PrimaryButton from './PrimaryButton';

type SleepSummarySheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Preformatted date of the tapped entry, e.g. 'Aug 11, 2026'. */
  date: string;
  /** Preformatted range and duration, e.g. '9:10 pm → 4:55 am · 7h 45m'. */
  detail: string;
  state: SleepSummaryState;
  onRetry: () => void;
};

function Body({
  state,
  onRetry,
  onClose,
}: Pick<SleepSummarySheetProps, 'state' | 'onRetry' | 'onClose'>) {
  switch (state.status) {
    case 'loading':
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.muted}>Reading this night…</Text>
        </View>
      );
    case 'success':
      return (
        <>
          <View style={styles.summary}>
            <View style={styles.summaryHeader}>
              <Sparkles color={colors.inkMutedText} size={14} />
              <Text style={styles.summaryLabel}>AI summary</Text>
            </View>
            {/* A 500-token summary can outgrow the sheet on a small screen. */}
            <ScrollView style={styles.summaryScroll}>
              <Text style={styles.summaryBody}>{state.summary}</Text>
            </ScrollView>
          </View>
          <PrimaryButton label="Done" onPress={onClose} />
        </>
      );
    case 'error':
      return (
        <View style={styles.error}>
          <Text style={styles.errorText}>{state.message}</Text>
          <PrimaryButton label="Try again" onPress={onRetry} />
        </View>
      );
    default:
      return null;
  }
}

function SleepSummarySheet({
  visible,
  onClose,
  date,
  detail,
  state,
  onRetry,
}: SleepSummarySheetProps) {
  return (
    <BottomSheet onClose={onClose} title="Sleep summary" visible={visible}>
      <View style={styles.entry}>
        <MonoLabel>{date}</MonoLabel>
        <Text style={styles.detail}>{detail}</Text>
      </View>

      <Body onClose={onClose} onRetry={onRetry} state={state} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  entry: {
    gap: spacing.xs,
  },
  detail: {
    ...typography.timeRange,
    color: colors.textPrimary,
  },
  centered: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  summary: {
    backgroundColor: colors.ink,
    borderRadius: radii.card,
    gap: spacing.md,
    padding: spacing.lg,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryLabel: {
    ...typography.label,
    color: colors.inkMutedText,
  },
  summaryScroll: {
    flexGrow: 0,
    maxHeight: 260,
  },
  summaryBody: {
    ...typography.body,
    color: colors.inkText,
  },
  error: {
    gap: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.textMuted,
  },
});

export default SleepSummarySheet;

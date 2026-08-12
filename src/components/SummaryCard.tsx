/**
 * Deep-ink card for the AI summary — the one dark surface in the system.
 *
 * @format
 */

import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';

type SummaryCardProps = {
  /** Uppercase mono eyebrow, e.g. 'AI SUMMARY'. */
  label: string;
  body: string;
};

function SummaryCard({ label, body }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Sparkles color={colors.inkMutedText} size={14} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    borderRadius: radii.card,
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.inkMutedText,
  },
  body: {
    ...typography.body,
    color: colors.inkText,
  },
});

export default SummaryCard;

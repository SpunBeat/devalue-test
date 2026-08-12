/**
 * Centered icon tile, serif headline, muted hint.
 *
 * @format
 */

import { Moon } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';

type EmptyStateProps = {
  title: string;
  hint?: string;
  icon?: LucideIcon;
};

function EmptyState({ title, hint, icon: Icon = Moon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tile}>
        <Icon color={colors.primary} size={26} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.card,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 56,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default EmptyState;

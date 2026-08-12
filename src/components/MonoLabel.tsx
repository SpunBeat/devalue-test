/**
 * Uppercase, letter-spaced mono caption: 'THIS WEEK', 'DATE', 'NOTES (OPTIONAL)'.
 *
 * @format
 */

import { StyleSheet, Text } from 'react-native';
import type { TextProps } from 'react-native';

import { colors, typography } from '../theme';

type MonoLabelProps = TextProps & {
  /** Muted gray by default; `false` uses the primary text color. */
  muted?: boolean;
};

function MonoLabel({ style, muted = true, ...rest }: MonoLabelProps) {
  return (
    <Text
      {...rest}
      style={[styles.label, muted ? styles.muted : styles.strong, style]}
    />
  );
}

const styles = StyleSheet.create({
  label: typography.label,
  muted: {
    color: colors.textMuted,
  },
  strong: {
    color: colors.textPrimary,
  },
});

export default MonoLabel;

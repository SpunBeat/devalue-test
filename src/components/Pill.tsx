/**
 * Small mono badge: 'Mia · 4mo', '7h 45m', '12 ENTRIES'.
 *
 * @format
 */

import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';

export type PillVariant = 'primary' | 'mint' | 'neutral';

type PillProps = {
  label: string;
  variant?: PillVariant;
  /** Uppercase the label, as tab-style badges do. */
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function Pill({
  label,
  variant = 'primary',
  uppercase = false,
  style,
  textStyle,
}: PillProps) {
  return (
    <View style={[styles.pill, backgrounds[variant], style]}>
      <Text
        style={[
          styles.text,
          foregrounds[variant],
          uppercase && styles.uppercase,
          textStyle,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
  },
  text: typography.pill,
  uppercase: {
    textTransform: 'uppercase',
  },
});

const backgrounds = StyleSheet.create({
  primary: { backgroundColor: colors.primaryLight },
  mint: { backgroundColor: colors.successBackground },
  neutral: { backgroundColor: colors.inputFill },
});

const foregrounds = StyleSheet.create({
  primary: { color: colors.primary },
  mint: { color: colors.successText },
  neutral: { color: colors.textMuted },
});

export default Pill;

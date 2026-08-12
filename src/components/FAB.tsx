/**
 * Persistent squircle add button, bottom-right.
 *
 * @format
 */

import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '../theme';

type FABProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

function FAB({ onPress, accessibilityLabel = 'Add entry', style }: FABProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed, style]}>
      <Plus color={colors.onPrimary} size={26} strokeWidth={2.25} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    bottom: spacing.screen,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.screen,
    width: 56,
    ...shadows.fab,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
});

export default FAB;

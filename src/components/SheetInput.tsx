/**
 * Labelled, filled input for the bottom sheet. Fill and border shift to indigo
 * while the field is active.
 *
 * @format
 */

import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';
import MonoLabel from './MonoLabel';

type SheetInputProps = Omit<TextInputProps, 'style'> & {
  /** Rendered above the field as an uppercase mono label. */
  label: string;
  /** Keep the indigo treatment on even when unfocused. */
  accented?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

function SheetInput({
  label,
  accented = false,
  containerStyle,
  onBlur,
  onFocus,
  multiline,
  ...rest
}: SheetInputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || accented;

  return (
    <View style={[styles.container, containerStyle]}>
      <MonoLabel>{label}</MonoLabel>
      <TextInput
        {...rest}
        multiline={multiline}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline && styles.multiline, active && styles.active]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  input: {
    ...typography.input,
    backgroundColor: colors.inputFill,
    borderColor: 'transparent',
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  multiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  active: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
});

export default SheetInput;

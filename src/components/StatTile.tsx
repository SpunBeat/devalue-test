/**
 * Small white card: mono label over a serif figure.
 *
 * @format
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '../theme';
import MonoLabel from './MonoLabel';

type StatTileProps = {
  label: string;
  value: string;
};

function StatTile({ label, value }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <MonoLabel>{label}</MonoLabel>
      <Text numberOfLines={1} style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: radii.card,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.card,
  },
  value: {
    ...typography.stat,
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 30,
  },
});

export default StatTile;

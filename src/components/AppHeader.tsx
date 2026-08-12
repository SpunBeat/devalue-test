/**
 * 'Sleeplog' wordmark with an optional context badge, over a thin divider.
 *
 * @format
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import Pill from './Pill';

type AppHeaderProps = {
  /** Right-hand badge, e.g. 'Mia · 4mo'. */
  badge?: string;
};

function AppHeader({ badge }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>
        Sleep<Text style={styles.titleAccent}>log</Text>
      </Text>
      {badge ? <Pill label={badge} variant="primary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.appTitle,
    color: colors.textPrimary,
  },
  titleAccent: {
    color: colors.primary,
  },
});

export default AppHeader;

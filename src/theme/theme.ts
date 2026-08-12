/**
 * Sleeplog design tokens.
 *
 * Calm, low-contrast, night-friendly: a parent reads this at 3am, so nothing
 * here is pure black on pure white, and nothing shouts.
 *
 * @format
 */

import { Platform } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  /** Soft indigo / periwinkle. Actions, active states, accents. */
  primary: '#5B5BD6',
  /** Indigo-50 tint. Badge and highlight fills. */
  primaryLight: '#EEEEFB',
  /** Cool near-white screen background. */
  background: '#FAFAFC',
  /** Card surface. */
  card: '#FFFFFF',
  /** 1px lavender-gray card outline. */
  cardBorder: '#E5E5F0',
  /** Hairline dividers. */
  divider: '#E5E5F0',
  /** Near-black slate. */
  textPrimary: '#1E1E2E',
  /** Dates, labels, hints. */
  textMuted: '#8A8A9E',
  /** Mint entry-count pill. */
  successBackground: '#DFF5E9',
  successText: '#2E7D5B',
  /** Deep ink card (AI summary) and its text. */
  ink: '#1C1C2E',
  inkText: '#FFFFFF',
  inkMutedText: '#A9A9C0',
  /** Filled input background. */
  inputFill: '#F3F3F7',
  /** Progress bar track under the indigo fill. */
  track: '#EDEDF4',
  /** Dim behind the bottom sheet. */
  scrim: 'rgba(28, 28, 46, 0.4)',
  onPrimary: '#FFFFFF',
} as const;

export const fontFamilies = {
  /** Georgia on iOS, the platform serif elsewhere. */
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
} as const;

export const typography = {
  /** 'Sleeplog' wordmark. */
  appTitle: {
    fontFamily: fontFamilies.serif,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '600',
  },
  /** 'Add Sleep Entry'. */
  sheetTitle: {
    fontFamily: fontFamilies.serif,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
  },
  /** '9:10 pm → 4:55 am'. */
  timeRange: {
    fontFamily: fontFamilies.serif,
    fontSize: 20,
    lineHeight: 28,
  },
  /** Serif headings inside cards and empty states. */
  heading: {
    fontFamily: fontFamilies.serif,
    fontSize: 18,
    lineHeight: 26,
  },
  /** Large serif figure for stats. */
  stat: {
    fontFamily: fontFamilies.serif,
    fontSize: 28,
    lineHeight: 36,
  },
  /** Uppercase mono: 'THIS WEEK', 'NOTES (OPTIONAL)', tab labels. */
  label: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  /** Mono inside pills and badges. */
  pill: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.8,
  },
  /** Mono on the submit button. */
  button: {
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  /** Notes and prose. */
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  /** Text typed into inputs. */
  input: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
  },
} satisfies Record<string, TextStyle>;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  /** Horizontal screen padding. */
  screen: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  /** Inputs. */
  input: 12,
  /** Cards, FAB. */
  card: 16,
  /** Bottom sheet top corners. */
  sheet: 24,
  pill: 999,
} as const;

/** Soft, wide, barely-there shadows — never a hard drop. */
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: colors.ink,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 1 },
    default: {},
  }) as ViewStyle,
  fab: Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 6 },
    default: {},
  }) as ViewStyle,
  sheet: Platform.select({
    ios: {
      shadowColor: colors.ink,
      shadowOpacity: 0.15,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: -4 },
    },
    android: { elevation: 16 },
    default: {},
  }) as ViewStyle,
} as const;

export const theme = {
  colors,
  fontFamilies,
  typography,
  spacing,
  radii,
  shadows,
} as const;

export type Theme = typeof theme;

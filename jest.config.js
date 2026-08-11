const preset = require('@react-native/jest-preset');

module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    ...preset.transform,
    // lucide-react-native ships ESM-only `.mjs`, which the preset does not cover.
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-svg|lucide-react-native)/)',
  ],
};

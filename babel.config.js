module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Inlines keys from .env at build time, so `process.env.ANTHROPIC_API_KEY`
    // resolves in the bundle (React Native has no runtime process.env).
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
      },
    ],
  ],
};

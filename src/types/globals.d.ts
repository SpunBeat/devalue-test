/**
 * React Native has no Node runtime, but the react-native-dotenv Babel plugin
 * rewrites `process.env.X` references at build time. Declaring the shape here
 * keeps that readable to TypeScript without pulling in @types/node, which
 * would shadow DOM/RN globals with Node ones.
 *
 * @format
 */

declare const process: {
  env: Record<string, string | undefined>;
};

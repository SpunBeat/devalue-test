/**
 * Environment access.
 *
 * `process.env.X` is not a runtime lookup in React Native — the value is
 * inlined into the bundle at build time by the react-native-dotenv Babel
 * plugin (see babel.config.js), reading from .env.
 *
 * @format
 */

/**
 * Reads a build-time environment variable, or undefined when it was not
 * inlined. Guarded because `process` itself may be absent in some runtimes.
 */
function readEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

export function getAnthropicApiKey(): string | undefined {
  if (typeof process === 'undefined' || !process.env) {
    return undefined;
  }

  return readEnv(process.env.ANTHROPIC_API_KEY);
}

/** True when the app has a key to call the Anthropic API with. */
export function hasAnthropicApiKey(): boolean {
  return getAnthropicApiKey() !== undefined;
}

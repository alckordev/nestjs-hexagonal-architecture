/**
 * Utility function to dynamically build environment file paths based on NODE_ENV
 *
 * Priority order (first found wins):
 * 1. .env.{NODE_ENV} (environment-specific)
 * 2. .env.development (development fallback)
 * 3. .env (base fallback)
 *
 * This utility belongs to the infrastructure layer as it handles
 * framework-specific configuration (NestJS ConfigModule).
 */

/**
 * Gets environment file paths based on NODE_ENV
 * @returns Array of environment file paths in priority order
 */
export function getEnvFilePaths(): string[] {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Build paths in priority order
  const paths = [`.env.${nodeEnv}`];

  // Add development fallback only if not already in the list
  if (nodeEnv !== 'development') {
    paths.push('.env.development');
  }

  // Base fallback (always last)
  paths.push('.env');

  return paths;
}

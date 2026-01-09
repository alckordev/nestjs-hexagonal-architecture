/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Global setup for E2E tests
 * This file runs before all E2E tests to load environment variables
 */

import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { existsSync } from 'fs';
import { join } from 'path';

// Set NODE_ENV to test if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Try to load environment files in order of priority
const envTestPath = join(process.cwd(), `.env.${process.env.NODE_ENV}`);
const envDevelopmentPath = join(process.cwd(), '.env.development');
const envPath = join(process.cwd(), '.env');

let loaded = false;

if (existsSync(envTestPath)) {
  expand(config({ path: envTestPath }));
  console.log(
    `✅ Loaded environment variables from .env.${process.env.NODE_ENV}`,
  );
  loaded = true;
} else if (existsSync(envDevelopmentPath)) {
  expand(config({ path: envDevelopmentPath }));
  console.log(
    `⚠️ .env.${process.env.NODE_ENV} not found, using .env.development as fallback`,
  );
  loaded = true;
} else if (existsSync(envPath)) {
  expand(config({ path: envPath }));
  console.log(`⚠️  Using .env as fallback`);
  loaded = true;
}

if (!loaded) {
  console.warn(
    `⚠️ No .env.${process.env.NODE_ENV}, .env.development, or .env file found. Using system environment variables.`,
  );
}

// Expand variables in DATABASE_URL after loading
if (process.env.DATABASE_URL) {
  // Expand variables like ${VAR} or $VAR
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g,
    (match, braced, unbraced) => {
      const varName = braced || unbraced;
      const value = process.env[varName];
      if (value === undefined) {
        console.warn(
          `⚠️ Environment variable ${varName} is not defined but used in DATABASE_URL`,
        );
        return match;
      }
      return value;
    },
  );
}

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.warn(
    '⚠️ DATABASE_URL is not set. E2E tests may fail without a database connection.',
  );
} else {
  // Check if DATABASE_URL still has unexpanded variables
  if (
    process.env.DATABASE_URL.includes('${') ||
    /^\$[A-Z_]/g.test(process.env.DATABASE_URL)
  ) {
    console.error(
      '❌ DATABASE_URL still contains unexpanded variables after expansion attempt.',
    );
    console.error(
      `Current DATABASE_URL: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`,
    );
    console.error('Please ensure all environment variables are defined.');
  }
}

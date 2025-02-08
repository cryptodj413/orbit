import fs from 'fs';
import dotenv from 'dotenv';
import { config } from 'dotenv-flow';

function loadEnv() {
  const target = process.env.TARGET_ENV || 'testnet';
  const dotenvPath = process.cwd() + `/.env.local`;

  if (!fs.existsSync(dotenvPath)) {
    console.error(`[loadEnv] ${dotenvPath} does not exist`);
    process.exit(1);
  }

  // Load environment variables from the appropriate .env file
  const envConfig = dotenv.parse(fs.readFileSync(dotenvPath));

  // Set environment variables
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }

  // Load additional environment variables using dotenv-flow
  config({ path: process.cwd(), node_env: target });

  // console.log(`Environment variables loaded for ${target} environment`);
}

loadEnv();

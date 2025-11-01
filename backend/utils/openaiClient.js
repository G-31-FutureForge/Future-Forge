import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get directory path for current module and load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const apiKey = process.env.OPENAI_API_KEY;
let openaiClient = null;

if (!apiKey) {
  console.warn('Warning: OPENAI_API_KEY not found in environment variables');
  console.log('To enable AI features:');
  console.log('1. Get an API key from https://platform.openai.com/api-keys');
  console.log('2. Add it to .env: OPENAI_API_KEY=your-key-here');
} else {
  try {
    openaiClient = new OpenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize OpenAI client:', err.message);
  }
}

export const openai = openaiClient;
export const isAIAvailable = () => Boolean(openaiClient);
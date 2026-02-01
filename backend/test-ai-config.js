// Quick test script to verify AI configuration
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env') });

console.log('\n=== AI Configuration Check ===\n');

const apiProvider = (process.env.AI_PROVIDER || 'huggingface').toLowerCase();
console.log(`AI Provider: ${apiProvider}`);

if (apiProvider === 'groq') {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    console.log('✅ GROQ_API_KEY: Found');
    console.log(`   Key preview: ${groqKey.substring(0, 10)}...`);
  } else {
    console.log('❌ GROQ_API_KEY: NOT FOUND');
    console.log('   Get one at: https://console.groq.com/keys');
  }
} else if (apiProvider === 'huggingface') {
  const hfKey = process.env.HF_API_KEY;
  const hfUrl = process.env.HF_API_URL;
  if (hfKey) {
    console.log('✅ HF_API_KEY: Found');
    console.log(`   Key preview: ${hfKey.substring(0, 10)}...`);
    if (hfUrl) {
      console.log(`   Model URL: ${hfUrl}`);
    } else {
      console.log('   Using default model: mistralai/Mistral-7B-Instruct-v0.2');
    }
  } else {
    console.log('❌ HF_API_KEY: NOT FOUND');
    console.log('   Get one at: https://huggingface.co/settings/tokens');
    console.log('   Add to .env: HF_API_KEY=your_token_here');
  }
} else if (apiProvider === 'together') {
  const togetherKey = process.env.TOGETHER_API_KEY;
  if (togetherKey) {
    console.log('✅ TOGETHER_API_KEY: Found');
    console.log(`   Key preview: ${togetherKey.substring(0, 10)}...`);
  } else {
    console.log('❌ TOGETHER_API_KEY: NOT FOUND');
    console.log('   Get one at: https://api.together.xyz/');
  }
}

// Check for old OpenAI key (should not be used)
if (process.env.OPENAI_API_KEY) {
  console.log('\n⚠️  WARNING: OPENAI_API_KEY is set but not used');
  console.log('   The system now uses free AI providers instead.');
  console.log('   You can remove OPENAI_API_KEY from .env');
}

console.log('\n=== Configuration Check Complete ===\n');


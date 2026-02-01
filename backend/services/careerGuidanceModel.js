import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ML_URL = process.env.ML_URL || 'http://127.0.0.1:5000';
const USE_LOCAL_INFERENCE = process.env.USE_ML_MODEL === 'true' || process.env.PREFER_ML_MODEL === 'true';

/**
 * Build a single text string from user profile for the ML model input.
 */
function profileToText(profile) {
  const parts = [
    profile.educationLevel || '',
    profile.interest || '',
    profile.stream || '',
    profile.preferredJobType || '',
    profile.careerGoal || '',
    Array.isArray(profile.preferredSkills) ? profile.preferredSkills.join(' ') : (profile.preferredSkills || ''),
    (profile.resumeText || '').substring(0, 500),
  ].filter(Boolean);
  return parts.join(' ').replace(/\s+/g, ' ').trim() || 'unknown';
}

/**
 * Run Python inference script (inference.py) with the given text; returns career_paths + summary.
 * Used when ML model is trained and USE_ML_MODEL=true; no Flask server needed.
 */
export function predictWithLocalModel(text) {
  return new Promise((resolve, reject) => {
    const mlDir = path.join(__dirname, '..', 'ml');
    const inferenceScript = path.join(mlDir, 'inference.py');
    const pythonCmd = process.env.PYTHON_PATH || 'python';
    const child = spawn(pythonCmd, [inferenceScript], {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const input = JSON.stringify({ text }) + '\n';
    let stdout = '';
    let stderr = '';

    child.stdin.write(input);
    child.stdin.end();

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code !== 0) {
        try {
          const errObj = JSON.parse(stderr.trim());
          return reject(new Error(errObj.message || errObj.error || stderr));
        } catch {
          return reject(new Error(stderr || `inference.py exited with code ${code}`));
        }
      }
      try {
        const out = JSON.parse(stdout.trim());
        resolve(out);
      } catch (e) {
        reject(new Error('Invalid JSON from inference.py: ' + stdout));
      }
    });
  });
}

/**
 * Predict career guidance from user profile using the trained ML model.
 * Tries local inference (Python script) first if USE_ML_MODEL or PREFER_ML_MODEL is set;
 * otherwise tries Flask ML_URL.
 * Returns { career_paths, summary } or null if model unavailable.
 */
export async function predictCareerFromProfile(profile) {
  const text = profileToText(profile);

  if (USE_LOCAL_INFERENCE) {
    try {
      const out = await predictWithLocalModel(text);
      return out;
    } catch (err) {
      console.warn('[Career ML] Local model inference failed:', err?.message || err);
      return null;
    }
  }

  try {
    const resp = await axios.post(`${ML_URL}/predict`, { text }, { timeout: 10000 });
    if (resp.data?.predictions?.length) {
      const p = resp.data.predictions[0];
      const label = p.label || 'Career path';
      const career_paths = [{ name: label, description: '', skills: [], courses: [], job_roles: [label], roadmap: [] }];
      return { career_paths, summary: `Based on our career model. Recommended: ${label}.` };
    }
    return null;
  } catch (err) {
    console.warn('[Career ML] Flask ML service error:', err?.message || err);
    return null;
  }
}

/**
 * Legacy: predict from raw text (Flask or local).
 */
export async function predictCareerGuidance(text) {
  if (USE_LOCAL_INFERENCE) {
    try {
      const out = await predictWithLocalModel(text);
      return out?.career_paths?.[0]?.name ?? null;
    } catch {
      return null;
    }
  }
  try {
    const resp = await axios.post(`${ML_URL}/predict`, { text }, { timeout: 10000 });
    if (resp.data?.predictions?.length) return resp.data.predictions[0].label;
    return null;
  } catch (err) {
    console.error('ML predict error:', err?.message || err);
    throw err;
  }
}

export async function checkMlHealth() {
  if (USE_LOCAL_INFERENCE) {
    const fs = await import('fs/promises');
    const mlDir = path.join(__dirname, '..', 'ml', 'models');
    try {
      await fs.access(path.join(mlDir, 'model.joblib'));
      return { status: 'ok', model_loaded: true, mode: 'local' };
    } catch {
      return { status: 'down', model_loaded: false, mode: 'local' };
    }
  }
  try {
    const resp = await axios.get(`${ML_URL}/health`, { timeout: 5000 });
    return { ...resp.data, mode: 'flask' };
  } catch (err) {
    return { status: 'down', error: err?.message, mode: 'flask' };
  }
}

export default { predictCareerFromProfile, predictCareerGuidance, checkMlHealth };

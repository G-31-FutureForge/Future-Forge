# Career Guidance ML – Kaggle Dataset & Trained Model

This folder contains scripts to **download a Kaggle career guidance dataset**, **train an ML/NLP model**, **save the model**, and use it from the **Node.js backend** (no separate Flask server required when using local inference).

## Quick start

### 1. Install Python dependencies

```bash
cd Future-Forge/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r ml/requirements.txt
```

### 2. Configure Kaggle API

- Create a Kaggle account and go to [Account → Create New API Token](https://www.kaggle.com/settings).
- Place `kaggle.json` in:
  - **Windows:** `C:\Users\<you>\.kaggle\kaggle.json`
  - **macOS/Linux:** `~/.kaggle/kaggle.json`

### 3. Download a career dataset and normalize it

Example datasets:

- **Perfectly Realistic Career Guidance:**  
  `divyaeldho/perfectly-realistic-career-guidance-dataset`
- **AI-based Career Recommendation:**  
  `adilshamim8/ai-based-career-recommendation-system`

```bash
# From backend/
python ml/prepare_career_dataset.py --dataset divyaeldho/perfectly-realistic-career-guidance-dataset --out ./ml/dataset.csv
```

If the CSV has different column names, pass them explicitly:

```bash
python ml/prepare_career_dataset.py --dataset owner/dataset-name --out ./ml/dataset.csv --text-cols Domain Skills Education --label-col Job_Role
```

### 4. Train the model

```bash
# From backend/
python ml/train_career_guidance.py
```

Defaults:

- Input: `./ml/dataset.csv` (must have `text` and `label` columns)
- Outputs: `./ml/models/model.joblib`, `./ml/models/vectorizer.joblib`, `./ml/models/label_encoder.joblib`

Override paths:

```bash
python ml/train_career_guidance.py --data ./ml/dataset.csv --model-out ./ml/models/model.joblib --vectorizer-out ./ml/models/vectorizer.joblib --label-encoder-out ./ml/models/label_encoder.joblib
```

### 5. Use the model in the Node.js backend

**Option A – Local inference (recommended)**  
No Flask needed. Node spawns the Python inference script.

1. Set in `.env`:

```env
USE_ML_MODEL=true
```

2. Restart the backend:

```bash
npm start
```

The career guidance API will use the trained model first; if it fails or returns nothing, it falls back to the Hugging Face API.

**Option B – Flask server**  
Run the Flask app and point Node to it:

```bash
# Terminal 1
python ml/app.py
# Listens on http://127.0.0.1:5000

# .env
ML_URL=http://127.0.0.1:5000
# Do not set USE_ML_MODEL=true if you only want Flask
```

Flask loads artifacts from `ml/models/` if present, otherwise from `ml/`.

## Files

| File | Purpose |
|------|--------|
| `prepare_career_dataset.py` | Download Kaggle dataset and normalize to `text` + `label` CSV |
| `train_career_guidance.py` | Train TF-IDF + LogisticRegression; save model/vectorizer/label encoder to `ml/models/` |
| `inference.py` | Load saved model, read JSON from stdin, output career_paths + summary (used by Node when `USE_ML_MODEL=true`) |
| `app.py` | Optional Flask server for `/predict` and `/health` |
| `download_kaggle.py` | Low-level Kaggle download helper |
| `models/` | Directory for `model.joblib`, `vectorizer.joblib`, `label_encoder.joblib` |

## NPM scripts (from `backend/`)

```bash
# Train (after placing dataset at ml/dataset.csv)
npm run ml:train

# Download a dataset (example)
npm run ml:download -- --dataset divyaeldho/perfectly-realistic-career-guidance-dataset --out ./ml/dataset.csv

# Run Flask ML server (optional)
npm run ml:serve
```

## Dataset format

After `prepare_career_dataset.py`, the CSV should have:

- **text:** Combined features (e.g. education, stream, interest, skills).
- **label:** Career path / job role (e.g. Data Scientist, Web Developer).

The trainer expects exactly these column names. Use `--text-cols` and `--label-col` if your Kaggle CSV uses different headers.

## Inference from Node

When `USE_ML_MODEL=true`:

1. Backend receives a career guidance request.
2. Builds a single text string from education level, interest, stream, skills, resume snippet, etc.
3. Spawns `python ml/inference.py` and writes one JSON line to stdin: `{"text": "..."}`.
4. Reads one JSON line from stdout: `{"career_paths": [...], "summary": "..."}`.
5. Returns that to the client; diagram and UI use the same structure as for the AI provider.

Python is required on the server for local inference. If the model files are missing or inference fails, the backend falls back to the Hugging Face (or other) API.

#!/usr/bin/env python3
"""
Run career guidance model inference. Reads one JSON object per line from stdin:
  {"text": "education level X interest Y skills Z"}

Outputs one JSON object to stdout:
  {"career_paths": [{"name": "...", "description": "", "skills": [], "job_roles": ["..."]}], "summary": "..."}

Usage (from Node.js):
  echo '{"text":"Graduate Data Science Python SQL"}' | python inference.py
  python inference.py --input '{"text":"..."}'
"""
import argparse
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SCRIPT_DIR, 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'model.joblib')
VECT_PATH = os.path.join(MODELS_DIR, 'vectorizer.joblib')
LE_PATH = os.path.join(MODELS_DIR, 'label_encoder.joblib')


def load_artifacts():
    from joblib import load
    if not all(os.path.exists(p) for p in (MODEL_PATH, VECT_PATH, LE_PATH)):
        return None, None, None
    model = load(MODEL_PATH)
    vect = load(VECT_PATH)
    le = load(LE_PATH)
    return model, vect, le


def predict(model, vect, le, text, top_k=3):
    import numpy as np
    X = vect.transform([text])
    preds = model.predict(X)
    try:
        probs = model.predict_proba(X)[0]
        top_indices = np.argsort(probs)[::-1][:top_k]
        labels = [le.inverse_transform([i])[0] for i in top_indices]
        prob_list = [float(probs[i]) for i in top_indices]
    except Exception:
        labels = [le.inverse_transform(preds)[0]]
        prob_list = [1.0]
    return labels, prob_list


def build_output(labels, prob_list):
    career_paths = []
    for label, prob in zip(labels, prob_list):
        career_paths.append({
            "name": label,
            "description": f"Recommended based on your profile (confidence: {prob:.0%})",
            "skills": [],
            "courses": [],
            "job_roles": [label],
            "roadmap": []
        })
    summary = f"Based on our career guidance model trained on Kaggle data. Top match: {labels[0]}."
    return {"career_paths": career_paths, "summary": summary}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', help='Single JSON string with "text" key')
    args = parser.parse_args()

    model, vect, le = load_artifacts()
    if model is None:
        err = json.dumps({"error": "model not found", "message": "Train the model first. See backend/ml/README.md"})
        sys.stderr.write(err + '\n')
        sys.exit(1)

    if args.input:
        data = json.loads(args.input)
        texts = [data.get('text', '')]
    else:
        line = sys.stdin.readline()
        if not line:
            sys.exit(0)
        data = json.loads(line)
        texts = [data.get('text', '')]

    text = texts[0].strip() or 'unknown'
    labels, prob_list = predict(model, vect, le, text)
    out = build_output(labels, prob_list)
    print(json.dumps(out))


if __name__ == '__main__':
    main()

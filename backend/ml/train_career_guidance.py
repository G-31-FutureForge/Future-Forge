#!/usr/bin/env python3
"""
Train a simple TF-IDF + LogisticRegression model for career guidance.

Expect a CSV with at least two columns: 'text' and 'label'.
Saves model, vectorizer and label encoder to disk.
"""
import argparse
import os
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from joblib import dump


def load_data(path):
    df = pd.read_csv(path)
    # Try common column names
    if 'text' in df.columns and 'label' in df.columns:
        texts = df['text'].fillna('').astype(str).tolist()
        labels = df['label'].astype(str).tolist()
        return texts, labels
    # indian_career_dataset format: multiple features -> text; job_role -> label
    if 'job_role' in df.columns:
        text_cols = [c for c in df.columns if c not in ['job_role', 'salary_range', 'location']]
        if text_cols:
            def make_text(row):
                parts = [str(row[c]).replace(';', ' ') for c in text_cols if c in row and pd.notna(row[c])]
                return ' '.join(parts).strip() or 'unknown'
            texts = df.apply(make_text, axis=1).tolist()
            labels = df['job_role'].astype(str).str.strip().tolist()
            return texts, labels
    # AI-based Career Recommendation System format: Education, Skills, Interests -> text; Recommended_Career -> label
    if 'Recommended_Career' in df.columns:
        text_cols = [c for c in ['Education', 'Skills', 'Interests'] if c in df.columns]
        if text_cols:
            def make_text(row):
                parts = [str(row[c]).replace(';', ' ') for c in text_cols if c in row and pd.notna(row[c])]
                return ' '.join(parts).strip() or 'unknown'
            texts = df.apply(make_text, axis=1).tolist()
            labels = df['Recommended_Career'].astype(str).str.strip().tolist()
            return texts, labels
    # Fallback heuristics
    text_col = None
    label_col = None
    for c in df.columns:
        if c.lower() in ('text', 'content', 'message', 'body'):
            text_col = c
        if c.lower() in ('label', 'category', 'intent', 'target', 'job_role', 'career'):
            label_col = c
    if text_col and label_col:
        texts = df[text_col].fillna('').astype(str).tolist()
        labels = df[label_col].astype(str).tolist()
        return texts, labels
    raise ValueError('Could not find text/label columns in CSV. Expected "text"/"label" or indian_career_dataset columns or "Education","Skills","Interests","Recommended_Career".')


def train(args):
    texts, labels = load_data(args.data)
    le = LabelEncoder()
    y = le.fit_transform(labels)

    vect = TfidfVectorizer(max_features=20000, ngram_range=(1,2))
    X = vect.fit_transform(texts)

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15, random_state=42)

    clf = LogisticRegression(max_iter=1000)
    clf.fit(X_train, y_train)

    acc = clf.score(X_val, y_val)
    print(f'Validation accuracy: {acc:.4f}')

    os.makedirs(os.path.dirname(args.model_out) or '.', exist_ok=True)
    dump(clf, args.model_out)
    dump(vect, args.vectorizer_out)
    dump(le, args.label_encoder_out)
    print('Saved model, vectorizer, and label encoder')


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, 'models')
    parser = argparse.ArgumentParser()
    default_csv = os.path.join(script_dir, 'indian_career_dataset.csv')
    if not os.path.exists(default_csv):
        default_csv = os.path.join(script_dir, 'AI-based Career Recommendation System.csv')
    if not os.path.exists(default_csv):
        default_csv = os.path.join(script_dir, 'dataset.csv')
    parser.add_argument('--data', default=default_csv, help='Path to CSV (e.g. indian_career_dataset.csv, AI-based Career Recommendation System.csv, or dataset.csv)')
    parser.add_argument('--model-out', default=os.path.join(models_dir, 'model.joblib'), help='Output path for model (joblib)')
    parser.add_argument('--vectorizer-out', default=os.path.join(models_dir, 'vectorizer.joblib'), help='Output path for vectorizer (joblib)')
    parser.add_argument('--label-encoder-out', default=os.path.join(models_dir, 'label_encoder.joblib'), help='Output path for label encoder')
    args = parser.parse_args()
    train(args)


if __name__ == '__main__':
    main()

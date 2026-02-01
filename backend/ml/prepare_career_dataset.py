#!/usr/bin/env python3
"""
Download a Kaggle career guidance dataset and normalize to CSV with 'text' and 'label' columns
for training (train_career_guidance.py).

Usage:
  python prepare_career_dataset.py --dataset divyaeldho/perfectly-realistic-career-guidance-dataset --out ./ml/dataset.csv
  python prepare_career_dataset.py --dataset adilshamim8/ai-based-career-recommendation-system --out ./ml/dataset.csv

Requires: pip install kaggle pandas; Kaggle API credentials in ~/.kaggle/kaggle.json
"""
import argparse
import os
import sys
import subprocess
import glob
import shutil
import pandas as pd


def run_cmd(cmd):
    print('Running:', ' '.join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print('Error:', res.stderr)
        raise SystemExit(res.returncode)
    return res.stdout


def download_kaggle(dataset_slug, outdir):
    os.makedirs(outdir, exist_ok=True)
    run_cmd(['kaggle', 'datasets', 'download', dataset_slug, '-p', outdir, '--unzip'])
    csv_files = glob.glob(os.path.join(outdir, '**', '*.csv'), recursive=True)
    if not csv_files:
        csv_files = glob.glob(os.path.join(outdir, '*.csv'))
    if not csv_files:
        raise SystemExit('No CSV found after download')
    return csv_files[0]


def normalize_to_text_label(df, text_columns=None, label_column=None):
    """
    Map dataset columns to a single 'text' and 'label' column.
    Common career datasets have: Domain, Skills, Education, Job_Role, Career_Path, etc.
    """
    text_cols = text_columns
    label_col = label_column

    # Auto-detect: prefer columns that look like features vs target
    if label_col is None:
        for c in ['Job_Role', 'job_role', 'Career_Path', 'career_path', 'Career', 'career',
                  'Label', 'label', 'Target', 'target', 'Domain', 'domain', 'Role', 'role']:
            if c in df.columns:
                label_col = c
                break
        if label_col is None and len(df.columns) >= 2:
            # Last column as label often
            label_col = df.columns[-1]

    if text_cols is None:
        # All other string columns (or all except label) as text
        exclude = {label_col} if label_col else set()
        text_cols = [c for c in df.columns if c not in exclude and df[c].dtype == 'object']
        if not text_cols:
            text_cols = [c for c in df.columns if c not in exclude]
        if not text_cols and label_col:
            text_cols = [c for c in df.columns if c != label_col]

    if not text_cols or not label_col:
        raise ValueError(
            'Could not detect text/label columns. Pass --text-cols and --label-col. '
            f'Columns: {list(df.columns)}'
        )

    def make_text(row):
        parts = [str(row[c]) for c in text_cols if c in row and pd.notna(row[c])]
        return ' '.join(parts).strip() or 'unknown'

    df = df.copy()
    df['text'] = df.apply(make_text, axis=1)
    df['label'] = df[label_col].astype(str).str.strip()
    return df[['text', 'label']].dropna(subset=['text', 'label'])


def main():
    parser = argparse.ArgumentParser(description='Download Kaggle career dataset and normalize to text+label CSV')
    parser.add_argument('--dataset', required=True, help='Kaggle dataset slug (e.g. divyaeldho/perfectly-realistic-career-guidance-dataset)')
    parser.add_argument('--out', default='./ml/dataset.csv', help='Output CSV path')
    parser.add_argument('--text-cols', nargs='+', help='Column names to combine as text (default: auto-detect)')
    parser.add_argument('--label-col', help='Column name for label (default: auto-detect Job_Role, Career_Path, etc.)')
    parser.add_argument('--no-download', action='store_true', help='Only normalize an existing CSV at --out')
    args = parser.parse_args()

    outpath = os.path.abspath(args.out)
    outdir = os.path.dirname(outpath)

    if args.no_download:
        if not os.path.isfile(outpath):
            print('--no-download: file not found', outpath)
            sys.exit(1)
        csv_path = outpath
    else:
        try:
            subprocess.run(['kaggle', '--version'], capture_output=True, check=True)
        except Exception:
            print('Kaggle CLI not found. Install: pip install kaggle. Configure ~/.kaggle/kaggle.json')
            sys.exit(1)
        download_dir = os.path.join(outdir, 'kaggle_download')
        csv_path = download_kaggle(args.dataset, download_dir)
        print('Downloaded CSV:', csv_path)

    df = pd.read_csv(csv_path)
    print('Columns:', list(df.columns))
    df = normalize_to_text_label(df, args.text_cols, args.label_col)
    os.makedirs(outdir, exist_ok=True)
    df.to_csv(outpath, index=False)
    print('Saved normalized dataset to', outpath, 'with', len(df), 'rows')


if __name__ == '__main__':
    main()

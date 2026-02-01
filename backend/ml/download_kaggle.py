#!/usr/bin/env python3
"""
Download a dataset file from Kaggle and place as ./ml/dataset.csv

Usage:
  python download_kaggle.py --dataset owner/dataset --file file.csv --out ./ml/dataset.csv

Requirements:
  - Set up Kaggle API credentials in ~/.kaggle/kaggle.json or set env vars KAGGLE_USERNAME and KAGGLE_KEY
  - `pip install kaggle` (included in requirements)
"""
import argparse
import os
import subprocess
import sys
import glob
import shutil


def run_cmd(cmd):
    print('Running:', ' '.join(cmd))
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print('Error:', res.stderr)
        raise SystemExit(res.returncode)
    print(res.stdout)
    return res


def download(dataset, file=None, out='./ml/dataset.csv'):
    outdir = os.path.dirname(out) or './ml'
    os.makedirs(outdir, exist_ok=True)

    # Build command: kaggle datasets download <dataset> -p <outdir> [ -f <file> ] --unzip
    cmd = ['kaggle', 'datasets', 'download', dataset, '-p', outdir, '--unzip']
    if file:
        cmd.extend(['-f', file])

    run_cmd(cmd)

    # Find CSV in outdir
    csv_files = glob.glob(os.path.join(outdir, '*.csv'))
    if not csv_files:
        # maybe inside extracted folder
        for root, dirs, files in os.walk(outdir):
            for f in files:
                if f.lower().endswith('.csv'):
                    csv_files.append(os.path.join(root, f))

    if not csv_files:
        raise SystemExit('No CSV file found after download')

    chosen = csv_files[0]
    print('Found CSV:', chosen)
    # copy/rename to desired output
    shutil.copyfile(chosen, out)
    print('Saved dataset to', out)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', required=True, help='Kaggle dataset id (owner/dataset)')
    parser.add_argument('--file', help='Specific file name inside dataset to download (optional)')
    parser.add_argument('--out', default='./ml/dataset.csv', help='Destination path for CSV')
    args = parser.parse_args()

    # Quick check that 'kaggle' CLI is available
    try:
        subprocess.run(['kaggle', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except Exception:
        print('kaggle CLI not available. Make sure `pip install kaggle` and your credentials are configured.')
        sys.exit(1)

    download(args.dataset, args.file, args.out)


if __name__ == '__main__':
    main()

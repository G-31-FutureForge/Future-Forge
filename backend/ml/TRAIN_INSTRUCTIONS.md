# Train the Career Model with Your CSV

Your file **`AI-based Career Recommendation System.csv`** in the `ml` folder is now used by default.

## 1. Install Python dependencies

From the **backend** folder:

```bash
pip install -r ml/requirements.txt
```

(Or use a virtualenv: `python -m venv venv`, then `venv\Scripts\activate` on Windows, then `pip install -r ml/requirements.txt`.)

## 2. Train the model

From the **backend** folder:

```bash
python ml/train_career_guidance.py
```

This will:

- Read **`ml/AI-based Career Recommendation System.csv`**
- Use **Education**, **Skills**, and **Interests** as the input text
- Use **Recommended_Career** as the label
- Save the model to **`ml/models/`** (`model.joblib`, `vectorizer.joblib`, `label_encoder.joblib`)

You should see output like:

```
Validation accuracy: 0.xxxx
Saved model, vectorizer, and label encoder
```

## 3. Use the model in the app

In **`backend/.env`** add:

```env
USE_ML_MODEL=true
```

Restart your Node backend. Career guidance will use the trained model first (no API key needed for that path).

## Optional: Use a different CSV

```bash
python ml/train_career_guidance.py --data ./ml/your_file.csv
```

For other CSV formats, the script expects either:

- Columns **`text`** and **`label`**, or  
- Columns **Education**, **Skills**, **Interests**, and **Recommended_Career** (your current format).

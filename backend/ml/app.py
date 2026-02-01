from flask import Flask, request, jsonify
from joblib import load
import os

_script_dir = os.path.dirname(os.path.abspath(__file__))
_models_dir = os.path.join(_script_dir, 'models')
# Prefer models/ subdir (trained via train_career_guidance.py), fallback to ml/
MODEL_PATH = os.path.join(_models_dir, 'model.joblib') if os.path.exists(os.path.join(_models_dir, 'model.joblib')) else os.path.join(_script_dir, 'model.joblib')
VECT_PATH = os.path.join(_models_dir, 'vectorizer.joblib') if os.path.exists(os.path.join(_models_dir, 'vectorizer.joblib')) else os.path.join(_script_dir, 'vectorizer.joblib')
LE_PATH = os.path.join(_models_dir, 'label_encoder.joblib') if os.path.exists(os.path.join(_models_dir, 'label_encoder.joblib')) else os.path.join(_script_dir, 'label_encoder.joblib')

app = Flask(__name__)


def load_artifacts():
    model = None
    vect = None
    le = None
    if os.path.exists(MODEL_PATH):
        model = load(MODEL_PATH)
    if os.path.exists(VECT_PATH):
        vect = load(VECT_PATH)
    if os.path.exists(LE_PATH):
        le = load(LE_PATH)
    return model, vect, le


MODEL, VECT, LE = load_artifacts()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': MODEL is not None})


@app.route('/predict', methods=['POST'])
def predict():
    if MODEL is None or VECT is None or LE is None:
        return jsonify({'error': 'model not loaded'}), 500
    data = request.get_json() or {}
    texts = None
    if isinstance(data, dict) and 'text' in data:
        texts = [data['text']]
    elif isinstance(data, dict) and 'texts' in data:
        texts = data['texts']
    else:
        return jsonify({'error': 'provide `text` or `texts` in JSON body'}), 400

    X = VECT.transform(texts)
    preds = MODEL.predict(X)
    try:
        probs = MODEL.predict_proba(X).tolist()
    except Exception:
        probs = None

    labels = LE.inverse_transform(preds)

    results = []
    for i, text in enumerate(texts):
        item = {'text': text, 'label': labels[i]}
        if probs:
            # map label->prob for this item
            class_probs = {LE.inverse_transform([j])[0]: float(probs[i][j]) for j in range(len(probs[i]))}
            item['probs'] = class_probs
        results.append(item)

    return jsonify({'predictions': results})


if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5000))
    app.run(host='127.0.0.1', port=port)

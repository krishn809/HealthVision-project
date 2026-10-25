import os
import json
import joblib
import numpy as np

# Get project root dynamically
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

MODEL_DIR = os.path.join(BASE_DIR, "models")
FEATURE_DIR = os.path.join(BASE_DIR, "model_features")

print("MODEL_DIR:", MODEL_DIR)
print("FEATURE_DIR:", FEATURE_DIR)


MODEL_REGISTRY = {
    "diabetes": {
        "model": "diabetes_model.pkl",
        "features": "diabetes_features.json"
    },
    "dengue": {
        "model": "dengue_new_dataset_model.pkl",
        "features": "dengue_features.json"
    },
    "kidney": {
        "model": "ckd_reliable_cleaned_model.pkl",
        "features": "kidney_features.json"
    },
    "liver": {
        "model": "liver_disease_rf_model.pkl",
        "features": "liver_features.json"
    },
    "thyroid": {
        "model": "thyroid_stacked_medical_model.pkl",
        "features": "thyroid_features.json"
    },
    "anemia": {
        "model": "hematology_stacked_model.pkl",
        "features": "anemia_features.json"
    },
    "heart": {
        "model": "random_forest_model_hd.pkl",
        "features": "heart_features.json"
    }
}


models = {}
feature_maps = {}


def load_models():

    for disease, config in MODEL_REGISTRY.items():

        model_path = os.path.join(MODEL_DIR, config["model"])
        feature_path = os.path.join(FEATURE_DIR, config["features"])

        print("Loading model:", model_path)
        print("Loading features:", feature_path)

        models[disease] = joblib.load(model_path)

        with open(feature_path) as f:
            feature_maps[disease] = json.load(f)


load_models()


def build_feature_vector(disease, extracted_features):

    required_features = feature_maps[disease]

    vector = []

    for feature in required_features:

        value = extracted_features.get(feature)

        if value is None:
            value = 0

        vector.append(value)

    return np.array([vector])


def predict_diseases(extracted_features):

    results = {}

    for disease, model in models.items():

        try:

            X = build_feature_vector(disease, extracted_features)

            prediction = model.predict(X)[0]

            results[disease] = int(prediction)

        except Exception as e:

            print(f"Prediction failed for {disease}:", e)

    return results
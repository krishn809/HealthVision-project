import joblib

print("Loading old diabetes model...")

model = joblib.load("D:/Projects/HealthVison/ml-service/models/diabetes_model.pkl")

print("Saving new diabetes model...")

joblib.dump(model, "models/diabetes_model_fixed.pkl")

print("Done.")
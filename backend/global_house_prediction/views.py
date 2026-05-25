import json
import pickle
from functools import lru_cache
from pathlib import Path

import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "trained" / "pipe.pkl"
FEATURE_COLUMNS = [
	"country",
	"city",
	"property_type",
	"furnishing_status",
	"property_size_sqft",
	"price",
	"constructed_year",
	"rooms",
	"bathrooms",
	"loan_tenure_years",
	"emi_to_income_ratio",
	"satisfaction_score",
]
NUMERIC_FIELDS = {
	"property_size_sqft",
	"price",
	"constructed_year",
	"rooms",
	"bathrooms",
	"loan_tenure_years",
	"emi_to_income_ratio",
	"satisfaction_score",
}
FLOAT_FIELDS = {"emi_to_income_ratio"}


def _with_cors(response):
	response["Access-Control-Allow-Origin"] = "*"
	response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
	response["Access-Control-Allow-Headers"] = "Content-Type, Accept, Origin"
	return response


@lru_cache(maxsize=1)
def get_model():
	with MODEL_PATH.open("rb") as model_file:
		return pickle.load(model_file)


@csrf_exempt
def predict_house_purchase(request):
	if request.method == "OPTIONS":
		return _with_cors(JsonResponse({"detail": "preflight ok"}))

	if request.method != "POST":
		return _with_cors(JsonResponse({"detail": "Method not allowed"}, status=405))

	try:
		payload = json.loads(request.body.decode("utf-8") or "{}")
	except json.JSONDecodeError:
		return _with_cors(JsonResponse({"detail": "Invalid JSON body"}, status=400))

	missing_fields = [field for field in FEATURE_COLUMNS if field not in payload]
	if missing_fields:
		return _with_cors(
			JsonResponse(
				{"detail": "Missing required fields", "fields": missing_fields},
				status=400,
			)
		)

	normalized = {}
	for field in FEATURE_COLUMNS:
		raw_value = payload[field]
		if field in NUMERIC_FIELDS:
			try:
				numeric_value = float(raw_value)
			except (TypeError, ValueError):
				return _with_cors(
					JsonResponse(
						{"detail": f"Field '{field}' must be numeric."},
						status=400,
					)
				)
			normalized[field] = numeric_value if field in FLOAT_FIELDS else int(numeric_value)
		else:
			normalized[field] = str(raw_value).strip()

	try:
		model = get_model()
	except FileNotFoundError:
		return _with_cors(
			JsonResponse({"detail": f"Model file not found at {MODEL_PATH}"}, status=500)
		)

	frame = pd.DataFrame([normalized], columns=FEATURE_COLUMNS)
	prediction = int(model.predict(frame)[0])

	probability = None
	if hasattr(model, "predict_proba"):
		probability = float(model.predict_proba(frame)[0][1])

	return _with_cors(
		JsonResponse(
			{
				"prediction": prediction,
				"label": "Approved" if prediction == 1 else "Rejected",
				"probability": probability,
				"model_type": "house_purchase_decision",
				"note": "This trained pipeline predicts purchase decision, not house price.",
			}
		)
	)

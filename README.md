# Global House Prediction

This project contains a Django backend and a React frontend for serving a trained machine learning model from `backend/ml/trained/pipe.pkl`.

The current model is a purchase-decision classifier, not a house-price regressor. The API accepts the property profile fields used by the trained pipeline and returns a predicted label, numeric class, and probability when available.

## Project Structure

- `backend/` - Django project and prediction API
- `frontend/` - React + Vite dashboard
- `global_house_purchase_dataset.csv` - dataset used for training
- `backend/ml/trained/` - saved trained model artifacts

## Backend API

The backend exposes one prediction endpoint:

- `POST /api/predict/`

Request body example:

```json
{
	"country": "USA",
	"city": "New York",
	"property_type": "Apartment",
	"furnishing_status": "Semi-Furnished",
	"property_size_sqft": 1200,
	"price": 350000,
	"constructed_year": 2015,
	"rooms": 3,
	"bathrooms": 2,
	"loan_tenure_years": 20,
	"emi_to_income_ratio": 0.25,
	"satisfaction_score": 7
}
```

Response example:

```json
{
	"prediction": 1,
	"label": "Approved",
	"probability": 0.84,
	"model_type": "house_purchase_decision",
	"note": "This trained pipeline predicts purchase decision, not house price."
}
```

## Frontend

The React dashboard is in `frontend/src/pages/Dashboard.tsx`. It provides a form for the 12 model inputs and sends them to the Django API.

## Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

- Make sure the saved model file exists at `backend/ml/trained/pipe.pkl`.
- If you want a true house-price prediction app, the model must be retrained as a regression model and the API/frontend should be adjusted to return a price value instead of a purchase decision.

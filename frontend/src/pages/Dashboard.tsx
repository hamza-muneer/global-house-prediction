import { useMemo, useState } from "react";
import { api } from "@/services/api";

type FormState = {
  country: string;
  city: string;
  property_type: string;
  furnishing_status: string;
  property_size_sqft: string;
  price: string;
  constructed_year: string;
  rooms: string;
  bathrooms: string;
  loan_tenure_years: string;
  emi_to_income_ratio: string;
  satisfaction_score: string;
};

const COUNTRY_OPTIONS = [
  "Australia",
  "Brazil",
  "Canada",
  "China",
  "France",
  "Germany",
  "India",
  "Japan",
  "Singapore",
  "South Africa",
  "UAE",
  "UK",
  "USA",
];

const CITY_OPTIONS = [
  "Abu Dhabi",
  "Bangalore",
  "Beijing",
  "Berlin",
  "Birmingham",
  "Brisbane",
  "Cape Town",
  "Chennai",
  "Chicago",
  "Delhi",
  "Dubai",
  "Frankfurt",
  "Houston",
  "Hyderabad",
  "Johannesburg",
  "Kyoto",
  "Liverpool",
  "London",
  "Los Angeles",
  "Lyon",
  "Manchester",
  "Marseille",
  "Melbourne",
  "Montreal",
  "Mumbai",
  "Munich",
  "New York",
  "Osaka",
  "Paris",
  "Pune",
  "Rio de Janeiro",
  "San Francisco",
  "Shanghai",
  "Shenzhen",
  "Singapore",
  "Sydney",
  "S�o Paulo",
  "Tokyo",
  "Toronto",
  "Vancouver",
];

const PROPERTY_TYPE_OPTIONS = ["Apartment", "Farmhouse", "Independent House", "Studio", "Townhouse", "Villa"];
const FURNISHING_OPTIONS = ["Fully-Furnished", "Semi-Furnished", "Unfurnished"];

const INITIAL_STATE: FormState = {
  country: "USA",
  city: "New York",
  property_type: "Apartment",
  furnishing_status: "Semi-Furnished",
  property_size_sqft: "1200",
  price: "350000",
  constructed_year: "2015",
  rooms: "3",
  bathrooms: "2",
  loan_tenure_years: "20",
  emi_to_income_ratio: "0.25",
  satisfaction_score: "7",
};

const Dashboard = () => {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; prediction: number; probability: number | null } | null>(null);

  const numericSummary = useMemo(
    () => [
      { label: "Size", value: `${form.property_size_sqft} sqft` },
      { label: "Price", value: `$${form.price}` },
      { label: "EMI ratio", value: form.emi_to_income_ratio },
      { label: "Satisfaction", value: form.satisfaction_score },
    ],
    [form]
  );

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/predict/", form);
      setResult({
        label: response.data.label,
        prediction: response.data.prediction,
        probability: response.data.probability,
      });
    } catch (submissionError) {
      const message =
        typeof submissionError === "object" && submissionError && "response" in submissionError
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (submissionError as any).response?.data?.detail ?? "Prediction request failed."
          : "Prediction request failed.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Global House Purchase Prediction</p>
          <h1>Send property details to the Django API and get the model output instantly.</h1>
          <p className="hero-copy">
            The current trained pipeline is a classifier, so it predicts purchase decision rather than house price.
            The form below is aligned to the exact columns the pickle expects.
          </p>
        </div>

        <div className="hero-metrics">
          {numericSummary.map((item) => (
            <div key={item.label} className="metric-pill">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="form-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Prediction form</p>
            <h2>Property profile</h2>
          </div>
          <p>Use category values from the training data so the pipeline can encode them without errors.</p>
        </div>

        <form className="prediction-form" onSubmit={handleSubmit}>
          <label>
            <span>Country</span>
            <select value={form.country} onChange={(event) => updateField("country", event.target.value)}>
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>City</span>
            <select value={form.city} onChange={(event) => updateField("city", event.target.value)}>
              {CITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Property type</span>
            <select value={form.property_type} onChange={(event) => updateField("property_type", event.target.value)}>
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Furnishing status</span>
            <select value={form.furnishing_status} onChange={(event) => updateField("furnishing_status", event.target.value)}>
              {FURNISHING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Property size (sqft)</span>
            <input type="number" min="1" value={form.property_size_sqft} onChange={(event) => updateField("property_size_sqft", event.target.value)} />
          </label>

          <label>
            <span>Listed price</span>
            <input type="number" min="1" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
          </label>

          <label>
            <span>Constructed year</span>
            <input type="number" min="1800" max="2100" value={form.constructed_year} onChange={(event) => updateField("constructed_year", event.target.value)} />
          </label>

          <label>
            <span>Rooms</span>
            <input type="number" min="0" value={form.rooms} onChange={(event) => updateField("rooms", event.target.value)} />
          </label>

          <label>
            <span>Bathrooms</span>
            <input type="number" min="0" value={form.bathrooms} onChange={(event) => updateField("bathrooms", event.target.value)} />
          </label>

          <label>
            <span>Loan tenure years</span>
            <input type="number" min="1" value={form.loan_tenure_years} onChange={(event) => updateField("loan_tenure_years", event.target.value)} />
          </label>

          <label>
            <span>EMI to income ratio</span>
            <input type="number" min="0" step="0.01" value={form.emi_to_income_ratio} onChange={(event) => updateField("emi_to_income_ratio", event.target.value)} />
          </label>

          <label>
            <span>Satisfaction score</span>
            <input type="number" min="0" max="10" value={form.satisfaction_score} onChange={(event) => updateField("satisfaction_score", event.target.value)} />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Predicting..." : "Predict outcome"}
          </button>
        </form>

        {error ? <div className="status status-error">{error}</div> : null}

        {result ? (
          <div className="status status-success">
            <div>
              <p className="eyebrow">Prediction result</p>
              <h3>{result.label}</h3>
            </div>
            <p>
              Class: <strong>{result.prediction}</strong>
              {result.probability !== null ? (
                <>
                  {" "}
                  | Approval probability: <strong>{Math.round(result.probability * 100)}%</strong>
                </>
              ) : null}
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default Dashboard;
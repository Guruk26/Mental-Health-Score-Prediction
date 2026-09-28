const API_BASE = "http://127.0.0.1:8000";

const form = document.getElementById("prediction-form");
const submitBtn = document.getElementById("submit-btn");
const formError = document.getElementById("form-error");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const resultState = document.getElementById("result-state");
const scoreValue = document.getElementById("score-value");
const meterFill = document.getElementById("meter-fill");
const meter = document.querySelector(".meter");
const scoreExplanation = document.getElementById("score-explanation");
const apiStatus = document.getElementById("api-status");
const resetBtn = document.getElementById("reset-btn");

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function setView(view) {
  emptyState.hidden = view !== "empty";
  loadingState.hidden = view !== "loading";
  resultState.hidden = view !== "result";
}

async function checkApi() {
  try {
    const response = await fetch(`${API_BASE}/`, { method: "GET" });
    if (!response.ok) throw new Error("API did not respond normally");
    apiStatus.textContent = "Connected";
    document.querySelector(".status-dot").style.background = "#42c6a4";
  } catch {
    apiStatus.textContent = "Offline";
    document.querySelector(".status-dot").style.background = "#e5a45b";
  }
}

function makePayload() {
  const values = new FormData(form);
  return {
    age: Number(values.get("age")),
    gender: values.get("gender"),
    country: values.get("country").trim(),
    academic_level: values.get("academic_level"),
    most_used_platform: values.get("most_used_platform"),
    purpose_of_use: values.get("purpose_of_use"),
    avg_daily_usage_hours: Number(values.get("avg_daily_usage_hours")),
    daily_unlocks: Number(values.get("daily_unlocks")),
    study_hours: Number(values.get("study_hours")),
    physical_activity_hours: Number(values.get("physical_activity_hours")),
    sleep_hours_per_night: Number(values.get("sleep_hours_per_night")),
    stress_level: values.get("stress_level")
  };
}

function validatePayload(data) {
  if (!data.country) return "Please enter your country.";
  if (!Number.isInteger(data.age) || data.age < 10 || data.age > 100) return "Age must be a whole number between 10 and 100.";
  if (!Number.isInteger(data.daily_unlocks) || data.daily_unlocks < 0) return "Daily unlocks must be a non-negative whole number.";
  const bounded = [
    ["Average daily usage", data.avg_daily_usage_hours],
    ["Study hours", data.study_hours],
    ["Physical activity", data.physical_activity_hours],
    ["Sleep hours", data.sleep_hours_per_night]
  ];
  for (const [name, value] of bounded) {
    if (!Number.isFinite(value) || value < 0 || value > 24) return `${name} must be between 0 and 24 hours.`;
  }
  return "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.hidden = true;

  if (!form.reportValidity()) return;
  const payload = makePayload();
  const validationMessage = validatePayload(payload);
  if (validationMessage) {
    showError(validationMessage);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector("span").textContent = "Generating…";
  setView("loading");

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let body;
    try { body = await response.json(); }
    catch { throw new Error("The API returned an unreadable response. Check that FastAPI is running."); }

    if (!response.ok) {
      const detail = Array.isArray(body.detail)
        ? body.detail.map(item => item.msg || "Invalid input").join("; ")
        : (body.detail || "Prediction request failed.");
      throw new Error(detail);
    }

    const score = Number(body.predicted_mental_health_score);
    if (!Number.isFinite(score)) throw new Error("The API response did not contain a valid predicted score.");

    // The project UI is designed for a 0–10 score display.
    // Values are clamped for meter visualization; the displayed score remains the API value.
    const meterScore = Math.max(0, Math.min(10, score));
    scoreValue.textContent = score.toFixed(2);
    meterFill.style.width = `${meterScore * 10}%`;
    meter.setAttribute("aria-valuenow", String(meterScore));
    scoreExplanation.textContent =
      `Your model predicted ${score.toFixed(2)} out of 10 from the lifestyle and study information you provided. This is a model output; its interpretation depends on how the model's target score was defined and validated.`;

    setView("result");
  } catch (error) {
    setView("empty");
    showError(`${error.message} Make sure the FastAPI server is running at ${API_BASE}.`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector("span").textContent = "Generate my score";
  }
});

resetBtn.addEventListener("click", () => {
  form.reset();
  formError.hidden = true;
  meterFill.style.width = "0%";
  meter.setAttribute("aria-valuenow", "0");
  setView("empty");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

checkApi();

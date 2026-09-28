# MindScope frontend

## Files
- `index.html` — page structure and input form
- `style.css` — responsive visual design
- `script.js` — validation, FastAPI requests, and score meter

## Run the FastAPI backend
Open a terminal in the folder containing your FastAPI `main.py` and model file, activate the same Python environment where FastAPI, pandas, Pydantic, and joblib are installed, then run:

```bash
uvicorn main:app --reload
```

If your Python file has a different name, replace `main` with that filename (without `.py`). For example, `uvicorn app:app --reload`.

Your backend code loads `Mental_Health_Model.pkl`, so make sure that exact model filename is available in the backend's working directory, or update the path in the Python file.

## Run the frontend
1. Open the frontend folder in VS Code.
2. Install the **Live Server** extension if you want to use it.
3. Right-click `index.html` → **Open with Live Server**.
4. If Live Server is unavailable, open `index.html` directly in your browser. The API must still be running.

The JavaScript expects FastAPI at `http://127.0.0.1:8000`. If you run it elsewhere, update `API_BASE` near the top of `script.js`.

## Test
- Visit `http://127.0.0.1:8000/docs` to check the API.
- Fill all fields in the UI and click **Generate my score**.
- If the page says the API is offline, start FastAPI and reload the frontend.

## Important
The meter visualizes the returned value on a 0–10 display scale. The API code defines the predicted value but does not define clinical interpretations or diagnostic thresholds. Do not present the result as a diagnosis.

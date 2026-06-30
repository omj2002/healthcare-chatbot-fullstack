# AI-Powered Healthcare Chatbot

This is a complete full-stack Healthcare Chatbot application. It consists of:
1. **Database:** SQL Server
2. **ML API:** Python (Flask + Random Forest)
3. **Backend:** ASP.NET Core 8 Web API
4. **Frontend:** Angular

**DISCLAIMER:** This project is for basic guidance and educational purposes only. It is NOT a medical system. Always consult a real doctor for medical advice.

# Chatboatfull

## Deployment
## Prerequisites
- Node.js & npm (latest LTS recommended)
- Angular CLI (`npm i -g @angular/cli`)
- Python 3.9+
- .NET 8 SDK
- SQL Server (LocalDB or standard instance)

## 1. Database Setup
1. Open SQL Server Management Studio (SSMS) or Azure Data Studio.
2. Run the `Database/init.sql` script to create the `HealthcareChatbotDB` database and tables.
3. The script also inserts some sample doctors.

Local docker-compose (builds images and runs services):

```bash
docker compose build
docker compose up
```

Build and push images to GitHub Container Registry (CI will do this automatically on push to `main`):

1. Create a GitHub repository and push this project.
2. Make sure GitHub Actions are enabled and that the `GITHUB_TOKEN` has package write permissions (default in modern repos).

You can then configure a hosting provider (Render, Azure App Service, etc.) to deploy the pushed images. The workflow is at `.github/workflows/ci-cd.yml`.

For a simple manual test, run the ML API locally:

```powershell
cd ML_API
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe app.py
```

## 2. ML API Setup (Python)
1. Navigate to the `ML_API` folder:
   ```bash
   cd ML_API
   ```
2. Create separating a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Train the model and generate `.pkl` files:
   ```bash
   python train_model.py
   ```
5. Run the Flask API (It runs on `http://127.0.0.1:5000` by default):
   ```bash
   python app.py
   ```

## 3. Backend Setup (.NET 8 Web API)
1. Open a new terminal and navigate to the `Backend` folder:
   ```bash
   cd Backend
   ```
2. Update the `ConnectionStrings:DefaultConnection` in `appsettings.json` if your SQL Server string differs from `Server=localhost;Database=HealthcareChatbotDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True`.
3. Restore packages:
   ```bash
   dotnet restore
   ```
4. Run the API (It will run on `http://localhost:5000` or `https://localhost:5001` or another port, swagger is available at `/swagger`):
   ```bash
   dotnet run
   ```

## 4. Frontend Setup (Angular)
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Open `src/environments/environment.ts` and set your `.NET Backend URL` (e.g., `http://localhost:5000/api`).
4. Run the application:
   ```bash
   ng serve --open
   ```
5. The application will start at `http://localhost:4200`.

## Features
- **User Authentication:** Registration & JWT Login.
- **Symptom Checker:** Chatbot asks for symptoms, extracts them via simple NLP, calls the Python ML API to predict diseases and provide confidence & severity.
- **Severity Alerts:** Red alerts for High/Emergency severities.
- **Treatments & Home Remedies:** View basic treatments.
- **Doctor Appointments:** View and book simulated appointments.
- **Chat History:** Persistent chat history.

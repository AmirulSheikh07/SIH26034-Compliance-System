# Backend & Database Infrastructure (Member 3)
## Overview
  This directory contains the core FastAPI backend and PostgreSQL database integration for the SIH26034 Compliance System. The API is currently live, successfully integrating Member 2's Rule Engine, and permanently storing all scan results in a local relational database.

## 🛠️ Tech Stack
  Framework: FastAPI (Python)
  
  Database: PostgreSQL
  
  ORM: SQLAlchemy
  
  Server: Uvicorn

## 📂 Directory Structure
  /api/routes.py - Contains the live endpoints (/scan, /scans, /dashboard/stats).
  
  /database/ - Contains the database connection logic (database.py) and the SQLAlchemy schemas (models.py defining Scan, Check, Violation, and User).
  
  /rule_engine/ - Member 2's Python compliance engine, cleanly nested and imported into the routing logic.
  
  main.py - The FastAPI application entry point.

## 🚀 What Has Been Completed
  1. Database Configuration & Schemas
  Successfully wired FastAPI to a local PostgreSQL database (sih26034).
  
  Configured SQLAlchemy to auto-generate tables on startup.
  
  Implemented relational constraints (Foreign Keys) linking Checks and Violations to their parent Scan, and linking Scans to a User.
  
  2. Rule Engine Integration
  Imported and connected Member 2's check_compliance function.
  
  The system can now take input data, run the deterministic compliance logic, and return detailed JSON structures including confidence scores and severity levels.
  
  3. Live API Routes
  POST /api/v1/scan: Currently accepts a mock OCR payload, runs it through the rule engine, creates a dummy user (if missing to satisfy Foreign Key constraints), saves the relational data to PostgreSQL in a two-step commit, and returns the DB scan_id alongside the results.
  
  GET /api/v1/scans: Queries the database and returns the 10 most recent scans (newest first).
  
  GET /api/v1/dashboard/stats: Calculates and returns live dashboard statistics (total inspections, compliance rate, passing/failing counts) directly from PostgreSQL, including division-by-zero safeguards.
  
  ## 💻 How to Run Locally
  To spin up the backend on your own machine:
  
  Ensure your PostgreSQL server is running and you have created a database named sih26034.
  
  Update the DATABASE_URL in database/database.py with your local Postgres password.
  
  Activate the virtual environment: .\venv\Scripts\activate
  
  Start the server: uvicorn main:app --reload
  
  Visit http://127.0.0.1:8000/docs to test the API via Swagger UI.

## 🔄 Next Steps / Pending Integrations
  Member 1 (OCR): Swap the mock_ocr_input dictionary in the /scan route with the real text extracted from the uploaded PaddleOCR image.
  
  Member 4 (Frontend): Connect the React dashboard charts and upload forms to these live endpoints.

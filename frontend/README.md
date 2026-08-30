# PackSure - Legal Metrology Compliance Frontend
**Branch:** `member4/frontend`  
**Developers:** Member 4 (Frontend, Dashboard & Portal Management)

---

## 🏛️ Project Overview
This repository contains the administrative portal and enforcement compliance dashboard for **PackSure** (SIH Problem Statement 26034). The frontend is built with a minimalist, clean, official government portal design (white backgrounds, slate text, and thin borders) and supports both **Light Theme** and **Dark Theme** (Night Operations).

---

## 🟢 Completed Features (Member 4 Scope)

### 1. Global Shell & Navigation
* **Accessibility Layout (`AppLayout.jsx`):** Features the official Indian portal strip (Saffron, White, Green), standard accessibility headers, collapsible sidebar, and a dynamic notifications Bell popover.
* **Role-Based Sidebar (`Sidebar.jsx`):** Dynamically restricts or shows menu actions depending on the logged-in user's role (Administrator, Enforcement Officer, Inspector, Reviewer).
* **Theme Swapper (`ThemeContext.jsx`):** Class-based light/dark theme toggles. Default is strictly Light.
* **Visual Logos:** Imported and integrated the official `emblem.png` on the login page and custom transparent `PackSurelogo_nobg.png` in the sidebar header.

### 2. Core Modules (Management)
* **LoginPage (`LoginPage.jsx`):** Clean credentials portal with quick test login shortcuts for evaluation.
* **Dashboard (`DashboardPage.jsx`):** Analytics engine integrating:
  * Filter panel (Category, Inspector, Location, Date, Compliance Status, Severity).
  * Dynamic StatCards for audits summary, products scanned, and violations.
  * Recharts visual plots (Status Pie chart, scan trend Line chart, LMPC offence Bar chart).
* **Product Repository (`ProductRepository.jsx`):** Lists all registered products with searching, sorting, and pagination.
* **Product File Timeline (`ProductDetails.jsx`):** Product specs, local package photos, and a vertical history timeline detailing previous scan ratings and violations.
* **Enforcement Scan History (`InspectionHistory.jsx`):** Registry logs of all metrology audits.
* **Inspection Details (`InspectionDetails.jsx`):** Displays rule engine checks arrays (fields, PASS/FAIL status, and confidence levels) and actions linking to layout analysis and manual override modules.
* **Reports Vault (`ReportRepository.jsx`):** Index of seizure notices and advisories with print/download actions.
* **Staff Directory (`UserManagement.jsx`):** Admin panel to add officers, update roles, and activate/deactivate accounts.
* **Settings Control (`SettingsPage.jsx`):** Central dashboard configurations.

---

## 📂 Project Structure Map
```
frontend/
├── public/
├── src/
│   ├── assets/                 # Custom product images and PackSure logos
│   ├── shared/
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── data/               # mockData (Structured according to FastAPI DB contract)
│   │   ├── layout/             # AppLayout, Sidebar
│   │   ├── routes/             # AppRoutes (Global routing & guards)
│   │   └── services/           # productService, inspectionService, userService, reportService
│   ├── management/
│   │   ├── auth/               # LoginPage
│   │   ├── dashboard/          # DashboardPage
│   │   ├── products/           # ProductRepository, ProductDetails
│   │   ├── inspections/        # InspectionHistory, InspectionDetails
│   │   ├── reports/            # ReportRepository
│   │   ├── users/              # UserManagement
│   │   └── settings/           # SettingsPage
│   ├── main.jsx                # Theme & Auth providers wrapper
│   └── index.css               # Tailwind CSS v4 custom dark-mode variant
└── package.json
```

---

## ⚙️ How to Run the Frontend
1. Make sure you are in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the lightweight dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web portal at **`http://localhost:5173/`**.

---

## ⏳ What is Pending (Integration with member3/backend)
* Replace the current simulated service calls inside `src/shared/services/` with live `fetch`/`axios` requests communicating with the FastAPI endpoints (`GET /scans`, `GET /dashboard/stats`, `POST /scan`) once local server ports are wired.
* Teammate's compliance/OCR capture modules (`src/inspection/`) are waiting to be populated.

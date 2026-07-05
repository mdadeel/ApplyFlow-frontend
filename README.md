# ApplyFlow AI - Frontend Dashboard

ApplyFlow AI Frontend is a responsive React dashboard built with TypeScript, Vite, and Tailwind CSS. It connects to the ApplyFlow Backend to manage job applications, profile documents, custom AI-driven resume tailoring, and interview preparation.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework:** React 18, TypeScript, Vite
- **Styling:** Vanilla CSS & Tailwind CSS utility tokens
- **Routing:** React Router DOM (with protected scopes)
- **Icons:** Phosphor Icons React (`@phosphor-icons/react`)
- **State Management:** Native React state & shared hook contexts
- **Animation:** Tailwind transitions with modern aesthetic presets

---

## 📂 Project Directory Structure

```
src/
├── assets/         # Project images, logo vectors, and styling entries
├── components/     # Reusable UI widgets (Buttons, Cards, Modals, Layout blocks)
├── hooks/          # Global React hooks (Auth hooks, toast notifications)
├── lib/            # External library abstractions (axios configurations, API utilities)
├── pages/          # Full page layouts representing dashboard views
│   ├── CareerProfilePage.tsx    # Personal info forms and resume extraction summaries
│   ├── JDAnalysisPage.tsx       # Job Description comparative scoring
│   ├── ApplicationsPage.tsx     # Kanban and list application trackers
│   ├── ResumeLibraryPage.tsx    # Multi-resume version storage
│   ├── InterviewPrepPage.tsx    # Mock interview dashboards
│   └── ExportCenterPage.tsx     # PDF / DOCX custom builders
├── services/       # API call handlers mapping backend REST routes
├── stores/         # Lightweight state context hooks
├── types/          # Global TypeScript interfaces
└── utils/          # Formatting engines (dates, lists, and numbers)
```

---

## 🎨 Visual Design Aesthetics

This application implements premium dashboard guidelines:
- **HSL Colors & Dark Mode Support:** Clean surface borders (`border-outline-variant`), sleek card backgrounds (`bg-surface-container-low`), and primary primary brand markers.
- **Glassmorphism & Micro-animations:** High hover responsiveness and subtle card transformations.
- **No Native Inputs:** Complex list segments (e.g., Technologies under Projects) use `<DynamicListInput />` which replaces standard textareas with dynamic pill layouts.

---

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js (v18+)
- ApplyFlow AI Backend running on `http://localhost:5000`

### 🔧 Configuration
The frontend proxies API requests automatically to `http://localhost:5000` inside `vite.config.ts`. Ensure your backend is active.

### 💻 Installation & Commands
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the local Vite development server:
   ```bash
   npm run dev
   ```
3. Build the static production bundle:
   ```bash
   npm run build
   ```
4. Preview the local build:
   ```bash
   npm run preview
   ```

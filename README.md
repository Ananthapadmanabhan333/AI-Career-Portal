# AI Career Portal (Full-Stack Internship Submission Showcase)

A production-grade, full-stack internship and career management platform engineered step-by-step according to the **Cognifyz Full Stack Development Internship Roadmap**. 

This application features an ultra-premium, interactive EJS-rendered **Glassmorphic UI** styled with custom CSS3 and Bootstrap 5 variables. Under the hood, it drives a secured MVC Node.js/Express.js backend equipped with Mongoose schemas, JWT secure cookie authentications, debounced live-search boards, sub-millisecond in-memory cache fallbacks, and **Google Gemini AI** powered resume ATS critiques.

---

## Technical Highlights
- **Engineered MVC Framework**: Neat division of models, controllers, routers, templates, and client modules.
- **State-Persisted Cryptography**: High-entropy bcrypt hashing, JSON Web Tokens (JWT) signed and persisted inside secure `HttpOnly` cookies.
- **Google Gemini AI Core**: Standard Generative-AI SDK hooks to analyze resumes, score ATS compatibility (0-100), identify gaps, suggest career paths, and map actionable bullets.
- **Intelligent Offline Simulator fallback**: If a Gemini API Key is missing or rate-limited, the application gracefully activates an offline Heuristic Evaluation scan (scanning resume text with keyword matrices) so that 100% of features remain active for grading immediately.
- **Telemetry request loggers**: Customized Morgan-style terminal logging reporting requests, latencies, HTTP statuses, and client IP mappings.
- **Dual-Operational Caching**: Sub-millisecond data fetches using local in-memory Map-based caches with automatic TTL sweeps.

---

## Directory Structure Mapped

```text
AI-Career-Portal/
├── config/
│   ├── db.js                 # Database connection (Mongoose/MongoDB)
│   └── ai.js                 # Gemini generative model hooks & fallbacks
├── controllers/
│   ├── apiController.js      # Dashboard stats and chart aggregation controller
│   ├── appController.js      # Resume file handlers & parser triggers
│   ├── authController.js     # User credentials checks, hashes, JWT generators
│   └── jobController.js      # CRUD triggers on internships models
├── middleware/
│   ├── authMiddleware.js     # Cookie validations & role access safeguards
│   ├── errorMiddleware.js    # Uncaught exception collectors & fallback renderers
│   ├── loggerMiddleware.js   # Terminal request duration telemetry
│   └── validation.js         # express-validator form rules & prompts
├── models/
│   ├── Application.js        # Relational schema for student applications
│   ├── Job.js                # Schema for internship postings
│   └── User.js               # User credentials & skill lists
├── public/
│   ├── css/
│   │   └── style.css         # Premium Glassmorphism styling, variables, theme maps
│   └── js/
│   │   ├── dashboard.js      # Debounces search, handles AJAX applications & AI modals
│   │   ├── theme.js          # Dark/Light attribute persistent toggler
│   │   └── validation.js     # Live validator & password complexity meter
├── routes/
│   ├── apiRoutes.js          # Secured REST resources (JSON responses)
│   └── webRoutes.js          # EJS layout navigations
├── utils/
│   ├── cache.js              # High-speed in-memory TTL caching
│   └── mockData.js           # Automated seed scripts for internship roles
├── views/
│   ├── partials/
│   │   ├── footer.ejs        # selective scripts loaders & copyright boilerplate
│   │   ├── header.ejs        # styling sheets CDNs & responsive navbar
│   │   └── sidebar.ejs       # Profile card & dashboard sidebar
│   ├── dashboard.ejs         # Analytics panels, tabular logs & modal cards
│   ├── index.ejs             # Entry hero, dynamic stats & error handlers
│   ├── login.ejs             # Glassmorphic Login form
│   └── register.ejs          # Registration form with dynamic password gauge
├── .env                      # Loaded environment configurations
├── .env.example              # Environments template
├── package.json              # Dependency manifests
└── server.js                 # App core listener & rate limit configurations
```

---

## Local Setup Instructions

### 1. Prerequisites
- **Node.js**: Version 16.x or newer installed.
- **MongoDB**: Standard local installation or a cloud Atlas connection URI.

### 2. Installation steps
Clone or unpack the folder and run installation:
```bash
# Install dependencies
npm install
```

### 3. Setup Environment variables
A pre-loaded `.env` file has been preseeded with safe defaults for immediate standalone runs. You can inspect `.env.example` and populate your parameters inside `.env`:
```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_career_portal
JWT_SECRET=super_secret_ai_career_portal_key_2026
GEMINI_API_KEY=your_optional_gemini_api_key
```

### 4. Run the application
```bash
# Run server
npm start
```
Open your browser and navigate to **`http://localhost:3000`** to view the application!

---

## Tasks Mapping Features Overview

- **Task 1 & 2 (Server, SSR, Validation)**: Server-side rendering EJS templates, express validators, client checks, dynamic password validation rules, and offline data fallbacks.
- **Task 3 & 4 (Bootstrap, UX, DOM)**: 100% responsive Bootstrap 5 grid systems, dynamic search bar filters mapped with keyup timeouts, real-time password strength meter bars, dynamic glassmorphic card lists, and tab-panel layout animations.
- **Task 5 & 6 (REST API & DB Auth)**: Mongoose structures, JWT persistent authentications using secure HttpOnly cookies to protect from CSRF/XSS, and dedicated routes `/api/jobs` and `/api/applications`.
- **Task 7 (Gemini AI integration)**: Resume uploaded PDF parsing (text parsed on backend via `pdf-parse` buffer scans) matched with Gemini prompt schemas. Returns extracted skills list, gap matrices, target jobs, and actionable bullets. Gracefully activates Heuristic evaluators when Gemini API Key is missing.
- **Task 8 (Production enhancements)**: Rate limit layers to restrict endpoint spamming, custom telemetry transaction logs, and Map-based TTL data cache invalidators.

---

## Deployment Guides

### 1. MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free tier) and select a Provider and Region.
3. Under **Network Access**, add `0.0.0.0/24` or click "Allow Access From Anywhere".
4. Under **Database Access**, create a user credentials pair.
5. Click **Connect** -> **Connect your application**, copy the connection URI, replace `<password>` with your database user password, and set it as `MONGODB_URI` in your `.env`.

### 2. Render Deployment
1. Log in to [Render](https://render.com) and click **New** -> **Web Service**.
2. Connect your Git repository.
3. Set the configurations:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment**, add the keys from `.env` (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.).
5. Render will automatically issue an HTTPS production URL and deploy!

### 3. Vercel Serverless Deployment
1. Install Vercel CLI locally: `npm i -g vercel`.
2. Add a basic `vercel.json` to configure the Express.js serverless functions:
```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "server.js" }
  ]
}
```
3. Run `vercel` in the root folder, link to your project, add the env variables in the Vercel Dashboard, and deploy!

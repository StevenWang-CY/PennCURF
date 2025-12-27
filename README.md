# Penn CURF Research Directory

🔗 **Live Demo:** [penn-curf.vercel.app](https://penn-curf.vercel.app)

An AI-powered platform for University of Pennsylvania students to discover, analyze, and apply for research opportunities. Leveraging LLM-based semantic search and intelligent matching, this tool bridges the gap between students and faculty research positions.

## Features

### Smart Search & Discovery
- **Natural Language Understanding**: Uses multi-stage semantic search with term expansion, stemming, and category mapping to understand query intent across all disciplines (STEM, Humanities, Social Sciences, Business, etc.)
- **Soft Pre-filtering**: TF-IDF-like scoring with semantic matching ranks opportunities before LLM refinement
- **Advanced Filtering**: Filter by research category, student year, and compensation type (paid/volunteer/work-study)

### Skill Compatibility Analysis
- **Automated Requirement Extraction**: Analyzes project descriptions to extract required technical and soft skills
- **Gap Analysis**: Compares requirements against your profile to identify strengths and areas for improvement
- **Compatibility Scoring**: LLM-powered scoring (0-100) with detailed reasoning

### AI Cold Email Generator
- **Context-Aware Drafting**: Generates personalized emails connecting your specific skills and experience to research opportunities
- **Interactive Revision**: Refine drafts with natural language instructions (e.g., "Make it shorter and more formal")

### User Authentication
- **Account System**: Register/login with username and password (Penn student confirmation required)
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **Profile Binding**: Student profiles are linked to user accounts

### Student Profiles
- Capture major, year, skills, interests, and experience
- Profiles power personalized search rankings and email generation

## Project Structure

```
PennCURF/
├── backend/
│   ├── main.py                     # FastAPI application with all endpoints
│   ├── render.yaml                 # Render deployment configuration
│   ├── requirements.txt            # Python dependencies
│   ├── database/
│   │   └── schema.sql              # PostgreSQL schema for Supabase
│   ├── models/
│   │   └── schemas.py              # Pydantic models for API validation
│   ├── services/
│   │   ├── llm_service.py          # LLM-powered search, email, and analysis
│   │   ├── auth_service.py         # JWT authentication and password hashing
│   │   └── supabase_service.py     # Database operations
│   └── scraper/
│       └── curf_scraper.py         # CURF directory web scraper
├── frontend/
│   ├── vercel.json                 # Vercel deployment configuration
│   ├── package.json                # Node.js dependencies
│   ├── next.config.ts              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── src/
│       ├── app/
│       │   ├── layout.tsx          # Root layout
│       │   ├── page.tsx            # Landing page
│       │   ├── search/page.tsx     # Search interface
│       │   ├── profile/page.tsx    # Profile management
│       │   ├── opportunity/[id]/   # Opportunity detail view
│       │   └── auth/               # Login and registration
│       │       ├── login/page.tsx
│       │       └── register/page.tsx
│       ├── components/
│       │   ├── NavBar.tsx          # Navigation component
│       │   ├── ProtectedRoute.tsx  # Auth route guard
│       │   └── BackendWakeUp.tsx   # Cold start wake-up ping
│       ├── contexts/
│       │   ├── AuthContext.tsx     # Authentication state
│       │   └── ProfileContext.tsx  # Profile state
│       └── lib/
│           ├── api.ts              # API client functions
│           └── utils.ts            # Utility functions
└── README.md
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS v4
- **Components**: Radix UI
- **Icons**: Lucide React

### Backend
- **API**: FastAPI (Python 3.11+)
- **Server**: Uvicorn (ASGI)
- **Validation**: Pydantic v2
- **Auth**: python-jose (JWT), passlib (bcrypt)

### Database
- **Platform**: Supabase (PostgreSQL)

### AI
- **Provider**: Azure OpenAI Service
- **Model**: GPT-4o-mini (configurable)

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase (cloud)

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/logout` | Logout (client discards token) |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/auth/profile` | Get authenticated user's profile |
| POST | `/api/auth/profile` | Create profile for current user |
| PATCH | `/api/auth/profile` | Update current user's profile |

### Opportunities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opportunities` | List opportunities with filters |
| GET | `/api/opportunities/{id}` | Get single opportunity |
| GET | `/api/filter-options` | Get available filter values |

### Search & Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search` | Semantic search with LLM ranking |
| POST | `/api/analyze-skills` | Get skill compatibility analysis |
| POST | `/api/generate-email` | Generate or revise cold email |

### Saved Opportunities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/saved/{student_id}/{opp_id}` | Save opportunity |
| DELETE | `/api/saved/{student_id}/{opp_id}` | Remove saved |
| GET | `/api/saved/{student_id}` | Get all saved |

## Deployment

The application is deployed on free-tier cloud services:

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | [penn-curf.vercel.app](https://penn-curf.vercel.app) |
| Backend | Render | [penncurf-api.onrender.com](https://penncurf-api.onrender.com) |
| Database | Supabase | Managed PostgreSQL |

### Cold Start Optimization

Render's free tier spins down after ~15 minutes of inactivity, causing 30-60 second cold starts. Two mitigations are in place:

1. **Frontend Wake-up Ping**: The `BackendWakeUp` component pings `/health` on page load, starting the wake-up process before user interaction.

2. **External Cron Job** (recommended): Use a free service like [cron-job.org](https://cron-job.org) to ping `https://penncurf-api.onrender.com/health` every 14 minutes to keep the backend warm.

### Deploy Your Own

**Backend (Render):**
1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend`
3. Add environment variables (see below)
4. Deploy with Python 3.11 runtime

**Frontend (Vercel):**
1. Import project on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL` pointing to your Render backend
4. Deploy

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)

### Environment Variables

**Backend (`backend/.env`):**
```bash
# Azure OpenAI
AZURE_OPENAI_API_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET_KEY=your-secret-key-change-in-production

# CORS (production frontend URL)
FRONTEND_URL=https://your-app.vercel.app

# Optional: Scraper
CURF_SESSION_COOKIE="raw_cookie_string_from_browser"
```

**Frontend (`frontend/.env.local`):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```
API runs at `http://localhost:8000`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:3000`.

### Data Scraping (Optional)
To populate the database with CURF opportunities:
```bash
cd backend
python scraper/curf_scraper.py
```
Requires `CURF_SESSION_COOKIE` in your `.env`. You can paste the full raw cookie string from your browser's developer tools (Network tab -> request headers -> Cookie).

## Usage

1. **Register**: Create an account at `/auth/register`
2. **Profile**: Complete your profile at `/profile`
3. **Search**: Use natural language queries like "machine learning in healthcare"
4. **Analyze**: Click an opportunity and use "Analyze My Fit" to see compatibility
5. **Email**: Generate a cold email and refine it with revision instructions

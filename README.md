# Penn CURF Research Finder

**Live Demo:** [penn-curf.vercel.app](https://penn-curf.vercel.app)

An AI-powered platform for University of Pennsylvania students to discover, analyze, and apply for undergraduate research opportunities. Leveraging LLM-based semantic search and intelligent matching, this tool bridges the gap between students and faculty research positions.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Data Scraping](#data-scraping)

## Features

### Smart Search & Discovery
- **Natural Language Understanding**: Multi-stage semantic search with term expansion, stemming, and category mapping across all disciplines (STEM, Humanities, Social Sciences, Business, etc.)
- **Soft Pre-filtering**: TF-IDF-like scoring with semantic matching ranks opportunities before LLM refinement
- **Advanced Filtering**: Filter by research category, student year, and compensation type (paid/volunteer/work-study)

### Skill Compatibility Analysis
- **Automated Requirement Extraction**: Analyzes project descriptions to extract required technical and soft skills
- **Gap Analysis**: Compares requirements against your profile to identify strengths and areas for improvement
- **Compatibility Scoring**: LLM-powered scoring (0-100) with detailed reasoning

### AI Cold Email Generator
- **Context-Aware Drafting**: Generates personalized emails connecting your skills and experience to research opportunities
- **Interactive Revision**: Refine drafts with natural language instructions (e.g., "Make it shorter and more formal")

### User Authentication
- **Account System**: Register/login with username and password (Penn student confirmation required)
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **Profile Binding**: Student profiles linked to user accounts

### Student Profiles
- Capture major, year, skills, interests, and experience
- Profiles power personalized search rankings and email generation

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS v4 |
| **Backend** | FastAPI (Python 3.11+), Uvicorn, Pydantic v2 |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Azure OpenAI (GPT-4o-mini) |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **Deployment** | Vercel (frontend), Render (backend) |

## Project Structure

```
PennCURF/
├── backend/
│   ├── main.py                     # FastAPI application
│   ├── render.yaml                 # Render deployment config
│   ├── requirements.txt            # Python dependencies
│   ├── database/
│   │   └── schema.sql              # PostgreSQL schema
│   ├── models/
│   │   └── schemas.py              # Pydantic models
│   ├── services/
│   │   ├── llm_service.py          # AI search, email, analysis
│   │   ├── auth_service.py         # JWT & password handling
│   │   └── supabase_service.py     # Database operations
│   └── scraper/
│       └── curf_scraper.py         # CURF directory scraper
│
├── frontend/
│   ├── vercel.json                 # Vercel deployment config
│   ├── package.json                # Node.js dependencies
│   └── src/
│       ├── app/
│       │   ├── layout.tsx          # Root layout with providers
│       │   ├── page.tsx            # Landing page
│       │   ├── search/page.tsx     # Search interface
│       │   ├── profile/page.tsx    # Profile management
│       │   ├── opportunity/[id]/   # Opportunity details
│       │   └── auth/
│       │       ├── login/page.tsx
│       │       └── register/page.tsx
│       ├── components/
│       │   ├── NavBar.tsx          # Navigation component
│       │   ├── ProtectedRoute.tsx  # Auth route guard
│       │   └── BackendWakeUp.tsx   # Cold start status banner
│       ├── contexts/
│       │   ├── AuthContext.tsx     # Authentication state
│       │   ├── ProfileContext.tsx  # Profile state
│       │   └── BackendStatusContext.tsx  # Backend health tracking
│       └── lib/
│           ├── api.ts              # API client
│           └── utils.ts            # Utilities
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+

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
JWT_SECRET_KEY=your-secret-key

# CORS
FRONTEND_URL=https://your-app.vercel.app

# Scraper (optional)
CURF_SESSION_COOKIE="cookie_string_from_browser"
```

**Frontend (`frontend/.env.local`):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API available at `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:3000`

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/auth/profile` | User's profile |
| POST | `/api/auth/profile` | Create profile |
| PATCH | `/api/auth/profile` | Update profile |

### Research Opportunities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opportunities` | List with filters |
| GET | `/api/opportunities/{id}` | Single opportunity |
| GET | `/api/opportunities/count` | Total count |
| GET | `/api/filter-options` | Available filters |

### Search & Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search` | Semantic search |
| POST | `/api/analyze-skills` | Skill compatibility |
| POST | `/api/generate-email` | Cold email generation |

### Saved Opportunities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/saved/{student_id}/{opp_id}` | Save |
| DELETE | `/api/saved/{student_id}/{opp_id}` | Unsave |
| GET | `/api/saved/{student_id}` | Get saved |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Deployment

### Live URLs

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | [penn-curf.vercel.app](https://penn-curf.vercel.app) |
| Backend | Render | [penncurf-api.onrender.com](https://penncurf-api.onrender.com) |
| Database | Supabase | Managed PostgreSQL |

### Cold Start Optimization

Render's free tier spins down after ~15 minutes of inactivity, causing 30-60 second cold starts. The following mitigations are implemented:

**Built-in Features:**
1. **Status Banner**: Shows "Connecting to server..." or "Waking up server..." at the top of the page
2. **Retry with Backoff**: Automatic retries (2s, 4s, 8s, 16s, 32s) until backend responds
3. **Keep-Alive Pings**: Frontend pings `/health` every 10 minutes while user is active
4. **Form Protection**: Login/register buttons disabled until backend is ready
5. **Visibility-Aware**: Pings when user returns to tab after being away

**External Option:**
Use a free cron service like [cron-job.org](https://cron-job.org) to ping `https://penncurf-api.onrender.com/health` every 14 minutes.

### Deploy Your Own

**Backend (Render):**
1. Create Web Service on [render.com](https://render.com)
2. Connect GitHub repo, root directory: `backend`
3. Add environment variables
4. Deploy with Python 3.11

**Frontend (Vercel):**
1. Import on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Add `NEXT_PUBLIC_API_URL` pointing to Render backend
4. Deploy

## Data Scraping

To populate the database with CURF research opportunities:

```bash
cd backend
python scraper/curf_scraper.py
```

**Requirements:**
- `CURF_SESSION_COOKIE` in `.env` (from browser dev tools: Network tab → Cookie header)
- Valid Penn authentication session

The scraper:
- Fetches all listing pages from CURF directory
- Scrapes detail pages for full information
- Upserts to Supabase using `slug` as unique key
- Supports resume on interruption

## Usage

1. **Register** at `/auth/register` (Penn students only)
2. **Complete profile** at `/profile` with skills and interests
3. **Search** using natural language like "machine learning in healthcare"
4. **Analyze fit** by clicking an opportunity and viewing skill compatibility
5. **Generate email** and refine with revision instructions

## Database Schema

Key tables in Supabase:

- **research_opportunities**: Scraped CURF data (729 opportunities)
- **student_profiles**: User profiles with skills and interests
- **user_accounts**: Authentication data
- **saved_opportunities**: Bookmarked opportunities

See `backend/database/schema.sql` for full schema.

## License

MIT

# Penn CURF Research Directory

An AI-powered platform for University of Pennsylvania students to discover, analyze, and apply for research opportunities. Leveraging LLM-based semantic search and intelligent matching, this tool bridges the gap between students and faculty research positions.

## Features

### Smart Search & Discovery
- **Natural Language Understanding**: Uses multi-stage semantic search with term expansion, stemming, and category mapping to understand query intent
- **Soft Pre-filtering**: TF-IDF-like scoring with semantic matching ranks opportunities before LLM refinement
- **Advanced Filtering**: Filter by research category, student year, and compensation type (paid/volunteer/work-study)

### Skill Compatibility Analysis
- **Automated Requirement Extraction**: Analyzes project descriptions to extract required technical and soft skills
- **Gap Analysis**: Compares requirements against your profile to identify strengths and areas for improvement
- **Compatibility Scoring**: LLM-powered scoring (0-100) with detailed reasoning

### AI Cold Email Generator
- **Context-Aware Drafting**: Generates personalized emails referencing specific project details and your qualifications
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
│   ├── main.py                 # FastAPI application with all endpoints
│   ├── models/
│   │   └── schemas.py          # Pydantic models for API validation
│   ├── services/
│   │   ├── llm_service.py      # LLM-powered search, email, and analysis
│   │   ├── auth_service.py     # JWT authentication and password hashing
│   │   └── supabase_service.py # Database operations
│   └── scraper/
│       └── curf_scraper.py     # CURF directory web scraper
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing page
│       │   ├── search/page.tsx     # Search interface
│       │   ├── profile/page.tsx    # Profile management
│       │   ├── opportunity/[id]/   # Opportunity detail view
│       │   └── auth/               # Login and registration
│       ├── components/
│       │   ├── NavBar.tsx          # Navigation component
│       │   └── ProtectedRoute.tsx  # Auth route guard
│       ├── contexts/
│       │   ├── AuthContext.tsx     # Authentication state
│       │   └── ProfileContext.tsx  # Profile state
│       └── lib/
│           └── api.ts              # API client functions
└── .env.example                    # Environment variables template
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v3
- **State**: React Context API
- **Icons**: Heroicons

### Backend
- **API**: FastAPI (Python 3.11+)
- **Server**: Uvicorn (ASGI)
- **Validation**: Pydantic v2
- **Auth**: python-jose (JWT), passlib (bcrypt)

### Database
- **Core**: Supabase (PostgreSQL)

### AI
- **Provider**: Azure OpenAI Service
- **Model**: GPT-4o-mini (configurable)

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

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)

### Environment Setup

Copy `.env.example` to `.env` and configure:

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

# JWT (generate a secure random key for production)
JWT_SECRET_KEY=your-secret-key-change-in-production

# CURF Session (for scraping - get from browser after logging in)
CURF_SESSION_COOKIE=your_session_cookie
```

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Mac/Linux
pip install -r requirements.txt
python main.py
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
Requires valid `CURF_SESSION_COOKIE` from an authenticated Penn browser session.

## Verification Workflow

1. **Register**: Create an account at `/auth/register`
2. **Profile**: Complete your profile at `/profile`
3. **Search**: Use natural language queries like "machine learning in healthcare"
4. **Analyze**: Click an opportunity and use "Analyze My Fit" to see compatibility
5. **Email**: Generate a cold email and refine it with revision instructions

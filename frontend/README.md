# Penn CURF Research Finder - Frontend

A Next.js application that helps Penn students discover undergraduate research opportunities and connect with faculty researchers through AI-powered matching and personalized cold email generation.

## Features

### Core Functionality
- **AI-Powered Search**: Natural language queries with match scores and explanations
- **Smart Filtering**: Browse by research category, student year, and compensation type
- **Personalized Matching**: Results ranked based on your profile, interests, and skills
- **Cold Email Generator**: AI-generated personalized outreach emails with revision capabilities
- **Skill Compatibility Analysis**: See how your skills match opportunity requirements

### User Experience
- **Profile Builder**: Multi-section form with progress tracking
- **Smart Routing**: Automatic redirects based on authentication and profile status
- **Cross-Tab Sync**: Profile changes synchronize across browser tabs
- **Cold Start Handling**: Visual status indicators when backend is waking up
- **Responsive Design**: Optimized for desktop and mobile

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI |
| Icons | Lucide React |
| State Management | React Context API |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Global styles
│   ├── auth/
│   │   ├── login/page.tsx            # User login
│   │   └── register/page.tsx         # User registration
│   ├── search/page.tsx               # Research opportunity search
│   ├── profile/page.tsx              # Student profile management
│   └── opportunity/[id]/page.tsx     # Opportunity detail view
│
├── components/
│   ├── NavBar.tsx                    # Navigation with auth-aware routing
│   ├── ProtectedRoute.tsx            # Authentication wrapper
│   └── BackendWakeUp.tsx             # Cold start status banner
│
├── contexts/
│   ├── AuthContext.tsx               # Authentication state management
│   ├── ProfileContext.tsx            # Student profile state
│   └── BackendStatusContext.tsx      # Backend health tracking
│
└── lib/
    ├── api.ts                        # API client with typed endpoints
    └── utils.ts                      # Utility functions
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero and feature showcase |
| `/auth/login` | User authentication |
| `/auth/register` | New user registration (Penn students) |
| `/search` | AI search and filtered browsing |
| `/profile` | Create/edit student profile |
| `/opportunity/[id]` | View details and generate emails |

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone <repository-url>
cd frontend
npm install
```

### Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run start
```

## State Management

### AuthContext
- Login/logout functionality
- JWT token storage in localStorage
- Token refresh handling
- Auth state change events

### ProfileContext
- Cross-tab sync via BroadcastChannel
- Auto-sync with AuthContext
- localStorage persistence fallback

### BackendStatusContext
- Tracks backend health status (`checking`, `waking`, `ready`, `error`)
- Retry logic with exponential backoff
- Keep-alive pings every 10 minutes
- Visibility-aware (pings when tab becomes active)

## Cold Start Optimization

The app handles Render's free tier cold starts (30-60s) with:

1. **Status Banner**: Shows at page top during wake-up
2. **Form Protection**: Login/register disabled until backend ready
3. **Automatic Retries**: 5 attempts with exponential backoff
4. **Keep-Alive**: Pings `/health` every 10 minutes
5. **Tab Awareness**: Pings when user returns to tab

## Styling

Penn brand colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Penn Blue | `#011F5B` | Primary backgrounds |
| Secondary Blue | `#003366` | Gradients, accents |
| Penn Red | `#990000` | Accent highlights |
| Light Background | `#f8fafc` | Page backgrounds |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint checks |

## Dependencies

### Production
- `react` / `react-dom` - React 19
- `next` - Next.js 16
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icons
- `clsx` / `tailwind-merge` - Class utilities

### Development
- `typescript` - Type safety
- `tailwindcss` - Styling
- `eslint` - Linting

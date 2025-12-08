# Penn CURF Research Finder - Frontend

A modern Next.js application that helps Penn students discover undergraduate research opportunities and connect with faculty researchers through AI-powered matching and personalized cold email generation.

## Features

### Core Functionality
- **AI-Powered Search**: Natural language queries to find relevant research opportunities with match scores and explanations
- **Smart Filtering**: Browse by research category, student year, and compensation type
- **Personalized Matching**: Results ranked based on your profile, interests, and skills
- **Cold Email Generator**: AI-generated personalized outreach emails with revision capabilities
- **Skill Compatibility Analysis**: See how your skills match opportunity requirements

### User Experience
- **Profile Builder**: Multi-section form with progress tracking (basic info, interests, skills, experience, resume)
- **Smart Routing**: Automatic redirects based on authentication and profile completion status
- **Cross-Tab Sync**: Profile changes synchronize across browser tabs
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI (Select, Checkbox, Label) |
| Icons | Lucide React |
| State Management | React Context API |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Homepage with hero section
│   ├── globals.css                   # Global styles and Tailwind imports
│   ├── auth/
│   │   ├── login/page.tsx            # User login
│   │   └── register/page.tsx         # User registration
│   ├── search/page.tsx               # Research opportunity search
│   ├── profile/page.tsx              # Student profile management
│   └── opportunity/[id]/page.tsx     # Opportunity detail view
├── components/
│   ├── NavBar.tsx                    # Navigation with auth-aware routing
│   └── ProtectedRoute.tsx            # Authentication wrapper component
├── contexts/
│   ├── AuthContext.tsx               # Authentication state management
│   └── ProfileContext.tsx            # Student profile state management
└── lib/
    ├── api.ts                        # API client with typed endpoints
    └── utils.ts                      # Utility functions (cn for classnames)
```

## Pages Overview

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features showcase, and CTAs |
| `/auth/login` | User authentication with username/password |
| `/auth/register` | New user registration (Penn students only) |
| `/search` | Discover opportunities via AI search or filters |
| `/profile` | Create/edit student profile with interests and skills |
| `/opportunity/[id]` | View full opportunity details and generate emails |

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## API Integration

The frontend communicates with a FastAPI backend. Key API modules:

| Module | Endpoints |
|--------|-----------|
| **Opportunities** | List all, get by ID, filter options |
| **Search** | AI-powered natural language search with ranking |
| **Profile** | Create, read, update student profiles |
| **Email** | Generate personalized cold emails |
| **Skills** | Analyze skill compatibility with opportunities |
| **Saved** | Save/unsave opportunities for later |

All API calls include automatic JWT token injection for authenticated requests.

## Styling

The application uses Penn's official brand colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Penn Blue | `#011F5B` | Primary backgrounds, headers |
| Secondary Blue | `#003366` | Gradients, accents |
| Penn Red | `#990000` | Accent buttons, highlights |
| Light Background | `#f8fafc` | Page backgrounds |

Key design elements:
- Inter font family via Google Fonts
- Rounded cards with subtle shadows
- Gradient hero sections
- Responsive grid layouts with Tailwind breakpoints

## State Management

### AuthContext
Manages user authentication state including:
- Login/logout functionality
- JWT token storage in localStorage
- Token refresh handling
- Custom events for auth state changes

### ProfileContext
Manages student profile data with:
- Cross-tab synchronization via BroadcastChannel
- Auto-sync with AuthContext user data
- localStorage persistence as fallback

## Deployment

The application is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel
```

The `vercel.json` configuration handles:
- Next.js framework detection
- Build commands
- Output directory settings

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create optimized production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint checks |

## Dependencies

### Production
- `react` / `react-dom` - React 19.2
- `next` - Next.js 16
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icon library
- `class-variance-authority` - Component variants
- `clsx` / `tailwind-merge` - Class name utilities

### Development
- `typescript` - Type safety
- `tailwindcss` - Utility-first CSS
- `eslint` / `eslint-config-next` - Code linting

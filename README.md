# Penn CURF Research Directory

An AI-powered, modern platform designed to revolutionize how University of Pennsylvania students discover, analyze, and apply for research opportunities. By leveraging advanced Large Language Models (LLMs) and a sophisticated user interface, this tool bridges the gap between students' potential and faculty needs.

## 🌟 Comprehensive Features

### 🔍 Smart Search & Discovery
*Go beyond keyword matching.*
- **Natural Language Understanding**: Uses Semantic Search (Vector Embeddings) to understand the *intent* of your query. You can ask, "Find me a lab working on renewable energy using machine learning," and the system will identify relevant projects even if they don't explicitly use those exact words.
- **Intelligent Ranking**: Results are ranked not just by keyword frequency but by relevance to your query and your profile's academic background.
- **Advanced Filtering**: Fine-tune your discovery with precision using our "Chip" interface. Filter by:
    - **Research Category** (Physical Sciences, Humanities, Engineering, etc.)
    - **Student Year** (Freshman to Senior preferences)
    - **Compensation** (Paid, Volunteer, Work-Study)

### 📊 Skill Compatibility & Gap Analysis
*Know where you stand before you apply.*
- **Automated Requirement Extraction**: The system analyzes complex project descriptions to extract both hard skills (e.g., Python, PCR, Data Analysis) and soft skills (e.g., Leadership, Communication).
- **Personalized Gap Analysis**: It compares these requirements against your stored Student Profile.
    - **Your Strengths**: Highlights the skills you already possess that make you a great candidate.
    - **Skills to Build**: Identifies specific areas for improvement, serving as a roadmap for your learning.
- **Reasoning-Based Scoring**: Powered by **GPT-5-mini**, the system performs a multi-step reasoning process to assign a compatibility score (0-100), ensuring the assessment is nuanced and accurate rather than a simple checklist match.

### ✉️ AI Cold Email Generator & Editor
*Draft the perfect outreach in seconds.*
- **Context-Aware Drafting**: Generates a professional, highly personalized email to the specific professor. It pulls context from:
    - **The Project**: Mentions specific details from the research abstract to show genuine interest.
    - **Your Profile**: Connects your specific major, skills, and past experiences to the project's needs.
- **Interactive AI Revision**: Don't like the first draft? Use the "Revise with AI" feature.
    - *Example*: "Make the tone more enthusiastic and mention my coursework in Bioethics."
    - The AI intelligently rewrites the email while maintaining professional formatting.

### 👤 Dynamic Student Profiles
*Your digital research resume.*
- **Holistic Representation**: Capture your academic identity including Major, Year, GPA, Skills, Research Interests, and Experience.
- **Data Persistence**: Profiles are stored securely (via Supabase) and persist across sessions, powering the personalization of search results and email generation.

### 🎨 Modern "Delicate" UI
*Designed for clarity and focus.*
- **Glassmorphism Aesthetic**: A clean, distraction-free interface utilizing blurred backgrounds, soft slate/white color palettes, and subtle gradients.
- **Responsive Experience**: Optimized for seamless use on laptops, tablets, and mobile devices.

## 🛠️ Technology Stack

- **Frontend**: 
    - **Framework**: Next.js 14 (App Router)
    - **Styling**: Tailwind CSS v3, Radix UI Primitives
    - **Icons**: Heroicons
- **Backend**: 
    - **API**: FastAPI (Python 3.11+)
    - **Server**: Uvicorn (ASGI)
    - **Validation**: Pydantic
- **Database**: 
    - **Core**: Supabase (PostgreSQL)
- **Artificial Intelligence**: 
    - **Provider**: Azure OpenAI Service
    - **Models**: GPT-4o (Drafting), GPT-5-mini (Reasoning/Analysis)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Anaconda (optional, recommended for environment management)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (if not using Conda):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Mac/Linux
   ```
3. Install dependencies:
   ```bash
   # Ensure you are using the virtual environment's pip
   python -m pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python main.py
   ```
   The API will run at `http://localhost:8000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:3000`.

## 🧪 Verification Workflow

To verify the installation and features:
1. **Initialize**: Open `http://localhost:3000`.
2. **Profile**: Go to **My Profile** and create a detailed profile (add skills like "Python", "React").
3. **Search**: Use the **"AI Search"** bar to find "coding projects". Verify semantic results.
4. **Analysis**: Click an opportunity. Hit **"Analyze My Fit"**. 
    - *Expected*: A gauge showing score, and lists of "Strengths" vs "Skills to Build".
5. **Outreach**: Scroll to **"Generate Cold Email"**.
    - *Expected*: A draft appears. Click **"Revise"** and ask to "Make it shorter". Verify the update.

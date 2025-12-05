-- Penn CURF Research Directory Platform
-- Database Schema for Supabase

-- ============================================
-- Research Opportunities Table
-- ============================================
CREATE TABLE IF NOT EXISTS research_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    teaser TEXT, -- Brief description from listing page
    mentor_areas TEXT,
    description TEXT,
    preferred_qualifications TEXT,
    project_website TEXT,
    preferred_student_years TEXT[] DEFAULT '{}', -- Array: ["First-year", "Second-Year", "Junior", "Senior"]
    academic_terms TEXT[] DEFAULT '{}', -- Array: ["Fall", "Spring", "Summer"]
    is_volunteer BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT FALSE,
    is_work_study BOOLEAN DEFAULT FALSE,
    research_categories TEXT[] DEFAULT '{}', -- Array: ["Biomedical Science", "Engineering and Computing"]
    -- Researcher info
    researcher_name TEXT,
    researcher_title TEXT,
    researcher_email TEXT, -- Critical for cold email feature
    researcher_profile_url TEXT,
    department_page_url TEXT,
    lab_website TEXT,
    -- Metadata
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_research_categories ON research_opportunities USING GIN (research_categories);
CREATE INDEX IF NOT EXISTS idx_preferred_years ON research_opportunities USING GIN (preferred_student_years);
CREATE INDEX IF NOT EXISTS idx_compensation ON research_opportunities (is_volunteer, is_paid, is_work_study);
CREATE INDEX IF NOT EXISTS idx_slug ON research_opportunities (slug);

-- ============================================
-- Student Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    year TEXT NOT NULL, -- First-year, Sophomore, Junior, Senior (grade level)
    major TEXT,
    academic_interests TEXT[] DEFAULT '{}', -- e.g., ["machine learning", "neuroscience", "public health"]
    career_interests TEXT[] DEFAULT '{}', -- e.g., ["research scientist", "medicine", "tech industry"]
    skills TEXT[] DEFAULT '{}', -- e.g., ["Python", "lab work", "data analysis"]
    experience TEXT, -- Brief background/previous research experience
    resume_text TEXT, -- Optional: full resume content for better email generation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Saved/Favorited Opportunities Table
-- ============================================
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES research_opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, opportunity_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_student ON saved_opportunities (student_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunity ON saved_opportunities (opportunity_id);

-- ============================================
-- Row Level Security (Optional - Enable if needed)
-- ============================================
-- ALTER TABLE research_opportunities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Updated timestamp trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_research_opportunities_updated_at
    BEFORE UPDATE ON research_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

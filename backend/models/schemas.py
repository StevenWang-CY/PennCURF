from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID


# Research Opportunity Schemas
class ResearchOpportunityBase(BaseModel):
    slug: str
    title: str
    teaser: Optional[str] = None
    mentor_areas: Optional[str] = None
    description: Optional[str] = None
    preferred_qualifications: Optional[str] = None
    project_website: Optional[str] = None
    preferred_student_years: List[str] = []
    academic_terms: List[str] = []
    is_volunteer: bool = False
    is_paid: bool = False
    is_work_study: bool = False
    research_categories: List[str] = []
    researcher_name: Optional[str] = None
    researcher_title: Optional[str] = None
    researcher_email: Optional[str] = None
    researcher_profile_url: Optional[str] = None
    department_page_url: Optional[str] = None
    lab_website: Optional[str] = None


class ResearchOpportunityCreate(ResearchOpportunityBase):
    pass


class ResearchOpportunity(ResearchOpportunityBase):
    id: UUID
    scraped_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Student Profile Schemas
class StudentProfileBase(BaseModel):
    name: str
    email: Optional[str] = None
    year: str  # First-year, Sophomore, Junior, Senior
    major: Optional[str] = None
    academic_interests: List[str] = []
    career_interests: List[str] = []
    skills: List[str] = []
    experience: Optional[str] = None
    resume_text: Optional[str] = None


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    year: Optional[str] = None
    major: Optional[str] = None
    academic_interests: Optional[List[str]] = None
    career_interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    resume_text: Optional[str] = None


class StudentProfile(StudentProfileBase):
    id: UUID
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Search Schemas
class SearchFilters(BaseModel):
    research_categories: Optional[List[str]] = None
    preferred_student_years: Optional[List[str]] = None
    is_volunteer: Optional[bool] = None
    is_paid: Optional[bool] = None
    is_work_study: Optional[bool] = None


class SearchRequest(BaseModel):
    query: str  # Natural language query
    student_profile_id: Optional[UUID] = None
    filters: Optional[SearchFilters] = None
    limit: Optional[int] = 20


class SearchResult(BaseModel):
    opportunity: ResearchOpportunity
    score: float  # 0-10 score from LLM
    explanation: Optional[str] = None  # Brief explanation of why this matches


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total_count: int
    query: str


# Email Generation Schemas
class EmailGenerateRequest(BaseModel):
    opportunity_id: UUID
    student_profile_id: UUID
    custom_instructions: Optional[str] = None
    previous_email: Optional[Dict[str, str]] = None  # Contains subject and body


class EmailGenerateResponse(BaseModel):
    subject: str
    body: str


class SkillAnalysisRequest(BaseModel):
    opportunity_id: UUID
    student_profile_id: UUID


class SkillAnalysisResponse(BaseModel):
    match_score: int  # 0-100
    matched_skills: List[str]
    missing_skills: List[str]
    analysis_text: Optional[str] = None


# Filter Options (for dropdowns)
class FilterOptions(BaseModel):
    research_categories: List[str]
    preferred_student_years: List[str]

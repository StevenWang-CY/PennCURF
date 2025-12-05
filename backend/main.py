from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from uuid import UUID
import os
from dotenv import load_dotenv

from models.schemas import (
    ResearchOpportunity,
    StudentProfileCreate,
    StudentProfileUpdate,
    StudentProfile,
    SearchRequest,
    SearchResponse,
    SearchResult,
    EmailGenerateRequest,
    EmailGenerateResponse,
    SkillAnalysisRequest,
    SkillAnalysisResponse,
    FilterOptions,
)
from services.supabase_service import get_supabase_service
from services.llm_service import get_llm_service

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Penn CURF Research Directory API",
    description="API for finding research opportunities and generating cold emails",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Health Check ============
@app.get("/")
async def root():
    return {"status": "healthy", "service": "Penn CURF Research Directory API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# ============ Research Opportunities ============
@app.get("/api/opportunities", response_model=List[ResearchOpportunity])
async def get_opportunities(
    research_categories: Optional[List[str]] = Query(None),
    preferred_student_years: Optional[List[str]] = Query(None),
    is_volunteer: Optional[bool] = None,
    is_paid: Optional[bool] = None,
    is_work_study: Optional[bool] = None,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
):
    """Get research opportunities with optional filters"""
    try:
        db = get_supabase_service()
        opportunities = db.get_opportunities(
            research_categories=research_categories,
            preferred_student_years=preferred_student_years,
            is_volunteer=is_volunteer,
            is_paid=is_paid,
            is_work_study=is_work_study,
            limit=limit,
            offset=offset,
        )
        return opportunities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/opportunities/{opportunity_id}", response_model=ResearchOpportunity)
async def get_opportunity(opportunity_id: UUID):
    """Get a single opportunity by ID"""
    try:
        db = get_supabase_service()
        opportunity = db.get_opportunity_by_id(opportunity_id)
        if not opportunity:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        return opportunity
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/opportunities/count")
async def get_opportunity_count():
    """Get total count of opportunities"""
    try:
        db = get_supabase_service()
        count = db.get_opportunity_count()
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/filter-options", response_model=FilterOptions)
async def get_filter_options():
    """Get available filter options"""
    try:
        db = get_supabase_service()
        options = db.get_filter_options()
        return options
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Search ============
@app.post("/api/search", response_model=SearchResponse)
async def search_opportunities(request: SearchRequest):
    """Search opportunities using LLM-powered semantic search"""
    try:
        db = get_supabase_service()
        llm = get_llm_service()

        # Extract filters from nested object
        filters = request.filters
        research_categories = filters.research_categories if filters else None
        preferred_student_years = filters.preferred_student_years if filters else None
        is_volunteer = filters.is_volunteer if filters else None
        is_paid = filters.is_paid if filters else None
        is_work_study = filters.is_work_study if filters else None

        # First, apply hard filters if provided
        opportunities = db.get_opportunities(
            research_categories=research_categories,
            preferred_student_years=preferred_student_years,
            is_volunteer=is_volunteer,
            is_paid=is_paid,
            is_work_study=is_work_study,
            limit=200,  # Get more for LLM filtering
        )

        if not opportunities:
            return SearchResponse(results=[], total_count=0, query=request.query)

        # Get student profile if provided
        student_profile = None
        if request.student_profile_id:
            student_profile = db.get_student_profile(request.student_profile_id)

        # Use LLM for semantic search
        top_k = request.limit if request.limit else 20
        scored_results = llm.semantic_search(
            query=request.query,
            opportunities=opportunities,
            student_profile=student_profile,
            top_k=top_k,
        )

        # Convert to response format
        results = [
            SearchResult(
                opportunity=ResearchOpportunity(**item["opportunity"]),
                score=item["score"],
                explanation=item.get("explanation"),
            )
            for item in scored_results
        ]

        return SearchResponse(
            results=results, total_count=len(results), query=request.query
        )

    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Student Profiles ============
@app.post("/api/student-profile", response_model=StudentProfile)
async def create_student_profile(profile: StudentProfileCreate):
    """Create a new student profile"""
    try:
        db = get_supabase_service()
        result = db.create_student_profile(profile.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/student-profile/{profile_id}", response_model=StudentProfile)
async def get_student_profile(profile_id: UUID):
    """Get a student profile by ID"""
    try:
        db = get_supabase_service()
        profile = db.get_student_profile(profile_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/student-profile/{profile_id}", response_model=StudentProfile)
async def update_student_profile(profile_id: UUID, updates: StudentProfileUpdate):
    """Update a student profile"""
    try:
        db = get_supabase_service()

        # Filter out None values
        update_data = {k: v for k, v in updates.model_dump().items() if v is not None}

        if not update_data:
            raise HTTPException(status_code=400, detail="No updates provided")

        result = db.update_student_profile(profile_id, update_data)
        if not result:
            raise HTTPException(status_code=404, detail="Profile not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/student-profile/{profile_id}")
async def delete_student_profile(profile_id: UUID):
    """Delete a student profile"""
    try:
        db = get_supabase_service()
        success = db.delete_student_profile(profile_id)
        if not success:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {"status": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Email Generation ============
@app.post("/api/generate-email", response_model=EmailGenerateResponse)
async def generate_email(request: EmailGenerateRequest):
    """Generate a cold email for a research opportunity"""
    try:
        db = get_supabase_service()
        llm = get_llm_service()

        # Get opportunity and profile
        opportunity = db.get_opportunity_by_id(request.opportunity_id)
        if not opportunity:
            raise HTTPException(status_code=404, detail="Opportunity not found")

        profile = db.get_student_profile(request.student_profile_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Student profile not found")

        # Generate email
        email_data = llm.generate_cold_email(
            opportunity, 
            profile,
            custom_instructions=request.custom_instructions,
            previous_email=request.previous_email
        )

        return EmailGenerateResponse(**email_data)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Email generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-skills", response_model=SkillAnalysisResponse)
async def analyze_skills(request: SkillAnalysisRequest):
    """Analyze skill compatibility for a research opportunity"""
    # Trigger reload
    try:
        db = get_supabase_service()
        llm = get_llm_service()

        # Get opportunity and profile
        opportunity = db.get_opportunity_by_id(request.opportunity_id)
        if not opportunity:
            raise HTTPException(status_code=404, detail="Opportunity not found")

        profile = db.get_student_profile(request.student_profile_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Student profile not found")

        # Analyze skills
        analysis_data = llm.analyze_skill_compatibility(opportunity, profile)

        return SkillAnalysisResponse(**analysis_data)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Skill analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Saved Opportunities ============
@app.post("/api/saved/{student_id}/{opportunity_id}")
async def save_opportunity(student_id: UUID, opportunity_id: UUID):
    """Save/favorite an opportunity"""
    try:
        db = get_supabase_service()
        result = db.save_opportunity(student_id, opportunity_id)
        return {"status": "saved", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/saved/{student_id}/{opportunity_id}")
async def unsave_opportunity(student_id: UUID, opportunity_id: UUID):
    """Remove a saved opportunity"""
    try:
        db = get_supabase_service()
        success = db.unsave_opportunity(student_id, opportunity_id)
        return {"status": "unsaved" if success else "not_found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/saved/{student_id}")
async def get_saved_opportunities(student_id: UUID):
    """Get all saved opportunities for a student"""
    try:
        db = get_supabase_service()
        saved = db.get_saved_opportunities(student_id)
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Admin: Scraper Trigger ============
@app.post("/api/scrape")
async def trigger_scrape():
    """Trigger the web scraper (admin only)"""
    # This is a placeholder - in production, you'd want auth here
    # The actual scraping is done by running the scraper script separately
    return {
        "status": "info",
        "message": "Run 'python scraper/curf_scraper.py' to scrape the CURF directory",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

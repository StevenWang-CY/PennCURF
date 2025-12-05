import os
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv
from uuid import UUID

# Load environment variables
load_dotenv()


class SupabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        self.client: Client = create_client(url, key)

    # ============ Research Opportunities ============

    def get_opportunities(
        self,
        research_categories: Optional[List[str]] = None,
        preferred_student_years: Optional[List[str]] = None,
        is_volunteer: Optional[bool] = None,
        is_paid: Optional[bool] = None,
        is_work_study: Optional[bool] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Get research opportunities with optional filters"""
        query = self.client.table("research_opportunities").select("*")

        # Apply filters
        if research_categories:
            # Use overlaps for array fields
            query = query.overlaps("research_categories", research_categories)

        if preferred_student_years:
            query = query.overlaps("preferred_student_years", preferred_student_years)

        if is_volunteer is not None:
            query = query.eq("is_volunteer", is_volunteer)

        if is_paid is not None:
            query = query.eq("is_paid", is_paid)

        if is_work_study is not None:
            query = query.eq("is_work_study", is_work_study)

        query = query.range(offset, offset + limit - 1)
        result = query.execute()
        return result.data

    def get_opportunity_by_id(self, opportunity_id: UUID) -> Optional[Dict[str, Any]]:
        """Get a single opportunity by ID"""
        result = (
            self.client.table("research_opportunities")
            .select("*")
            .eq("id", str(opportunity_id))
            .execute()
        )
        return result.data[0] if result.data else None

    def get_opportunity_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """Get a single opportunity by slug"""
        result = (
            self.client.table("research_opportunities")
            .select("*")
            .eq("slug", slug)
            .execute()
        )
        return result.data[0] if result.data else None

    def upsert_opportunity(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Insert or update a research opportunity (by slug)"""
        result = (
            self.client.table("research_opportunities")
            .upsert(opportunity, on_conflict="slug")
            .execute()
        )
        return result.data[0] if result.data else {}

    def bulk_upsert_opportunities(
        self, opportunities: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Bulk insert or update research opportunities"""
        result = (
            self.client.table("research_opportunities")
            .upsert(opportunities, on_conflict="slug")
            .execute()
        )
        return result.data

    def get_all_opportunities_for_search(self) -> List[Dict[str, Any]]:
        """Get all opportunities with minimal fields for LLM search"""
        result = (
            self.client.table("research_opportunities")
            .select(
                "id, slug, title, teaser, description, mentor_areas, preferred_qualifications, "
                "preferred_student_years, research_categories, researcher_name, researcher_email"
            )
            .execute()
        )
        return result.data

    def get_opportunity_count(self) -> int:
        """Get total count of opportunities"""
        result = (
            self.client.table("research_opportunities")
            .select("id", count="exact")
            .execute()
        )
        return result.count or 0

    # ============ Student Profiles ============

    def create_student_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new student profile"""
        result = self.client.table("student_profiles").insert(profile).execute()
        return result.data[0] if result.data else {}

    def get_student_profile(self, profile_id: UUID) -> Optional[Dict[str, Any]]:
        """Get a student profile by ID"""
        result = (
            self.client.table("student_profiles")
            .select("*")
            .eq("id", str(profile_id))
            .execute()
        )
        return result.data[0] if result.data else None

    def update_student_profile(
        self, profile_id: UUID, updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a student profile"""
        result = (
            self.client.table("student_profiles")
            .update(updates)
            .eq("id", str(profile_id))
            .execute()
        )
        return result.data[0] if result.data else {}

    def delete_student_profile(self, profile_id: UUID) -> bool:
        """Delete a student profile"""
        result = (
            self.client.table("student_profiles")
            .delete()
            .eq("id", str(profile_id))
            .execute()
        )
        return len(result.data) > 0

    # ============ Saved Opportunities ============

    def save_opportunity(
        self, student_id: UUID, opportunity_id: UUID
    ) -> Dict[str, Any]:
        """Save/favorite an opportunity for a student"""
        result = (
            self.client.table("saved_opportunities")
            .upsert(
                {"student_id": str(student_id), "opportunity_id": str(opportunity_id)},
                on_conflict="student_id,opportunity_id",
            )
            .execute()
        )
        return result.data[0] if result.data else {}

    def unsave_opportunity(self, student_id: UUID, opportunity_id: UUID) -> bool:
        """Remove a saved opportunity"""
        result = (
            self.client.table("saved_opportunities")
            .delete()
            .eq("student_id", str(student_id))
            .eq("opportunity_id", str(opportunity_id))
            .execute()
        )
        return len(result.data) > 0

    def get_saved_opportunities(self, student_id: UUID) -> List[Dict[str, Any]]:
        """Get all saved opportunities for a student"""
        result = (
            self.client.table("saved_opportunities")
            .select("*, research_opportunities(*)")
            .eq("student_id", str(student_id))
            .execute()
        )
        return result.data

    # ============ Filter Options ============

    def get_filter_options(self) -> Dict[str, List[str]]:
        """Get available filter options from the database"""
        # Get distinct research categories
        cats_result = (
            self.client.table("research_opportunities")
            .select("research_categories")
            .execute()
        )

        # Flatten and deduplicate categories
        all_categories = set()
        for row in cats_result.data:
            if row.get("research_categories"):
                all_categories.update(row["research_categories"])

        # Get distinct student years
        years_result = (
            self.client.table("research_opportunities")
            .select("preferred_student_years")
            .execute()
        )

        all_years = set()
        for row in years_result.data:
            if row.get("preferred_student_years"):
                all_years.update(row["preferred_student_years"])

        return {
            "research_categories": sorted(list(all_categories)),
            "preferred_student_years": sorted(list(all_years)),
        }

    # ============ User Accounts ============

    def create_user_account(
        self, username: str, password_hash: str, penn_verified: bool = False
    ) -> Optional[Dict[str, Any]]:
        """Create a new user account"""
        result = (
            self.client.table("user_accounts")
            .insert({
                "username": username,
                "password_hash": password_hash,
                "penn_verified": penn_verified,
            })
            .execute()
        )
        return result.data[0] if result.data else None

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get a user account by username"""
        result = (
            self.client.table("user_accounts")
            .select("*")
            .eq("username", username)
            .execute()
        )
        return result.data[0] if result.data else None

    def get_user_by_id(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Get a user account by ID"""
        result = (
            self.client.table("user_accounts")
            .select("*")
            .eq("id", str(user_id))
            .execute()
        )
        return result.data[0] if result.data else None

    def get_profile_by_user_id(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Get a student profile by user_id"""
        result = (
            self.client.table("student_profiles")
            .select("*")
            .eq("user_id", str(user_id))
            .execute()
        )
        return result.data[0] if result.data else None

    def create_student_profile_for_user(
        self, user_id: UUID, profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a student profile linked to a user account"""
        profile_data = {**profile, "user_id": str(user_id)}
        result = self.client.table("student_profiles").insert(profile_data).execute()
        return result.data[0] if result.data else {}

    def update_student_profile_by_user_id(
        self, user_id: UUID, updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a student profile by user_id"""
        result = (
            self.client.table("student_profiles")
            .update(updates)
            .eq("user_id", str(user_id))
            .execute()
        )
        return result.data[0] if result.data else {}


# Singleton instance
_supabase_service: Optional[SupabaseService] = None


def get_supabase_service() -> SupabaseService:
    global _supabase_service
    if _supabase_service is None:
        _supabase_service = SupabaseService()
    return _supabase_service

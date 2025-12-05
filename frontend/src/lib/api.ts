const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface ResearchOpportunity {
  id: string;
  slug: string;
  title: string;
  teaser?: string;
  mentor_areas?: string;
  description?: string;
  preferred_qualifications?: string;
  project_website?: string;
  preferred_student_years: string[];
  academic_terms: string[];
  is_volunteer: boolean;
  is_paid: boolean;
  is_work_study: boolean;
  research_categories: string[];
  researcher_name?: string;
  researcher_title?: string;
  researcher_email?: string;
  researcher_profile_url?: string;
  department_page_url?: string;
  lab_website?: string;
  scraped_at?: string;
  created_at?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  year: string;
  major?: string;
  academic_interests: string[];
  career_interests: string[];
  skills: string[];
  experience?: string;
  resume_text?: string;
  created_at?: string;
}

export interface SearchResult {
  opportunity: ResearchOpportunity;
  score: number;
  explanation?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total_count: number;
  query: string;
}

export interface EmailResponse {
  subject: string;
  body: string;
  professor_email?: string;
  professor_name?: string;
}

export interface FilterOptions {
  research_categories: string[];
  preferred_student_years: string[];
}

// API Functions
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// Opportunities
export async function getOpportunities(params?: {
  research_categories?: string[];
  preferred_student_years?: string[];
  is_volunteer?: boolean;
  is_paid?: boolean;
  is_work_study?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ResearchOpportunity[]> {
  const searchParams = new URLSearchParams();

  if (params?.research_categories) {
    params.research_categories.forEach(c => searchParams.append('research_categories', c));
  }
  if (params?.preferred_student_years) {
    params.preferred_student_years.forEach(y => searchParams.append('preferred_student_years', y));
  }
  if (params?.is_volunteer !== undefined) {
    searchParams.set('is_volunteer', String(params.is_volunteer));
  }
  if (params?.is_paid !== undefined) {
    searchParams.set('is_paid', String(params.is_paid));
  }
  if (params?.is_work_study !== undefined) {
    searchParams.set('is_work_study', String(params.is_work_study));
  }
  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }
  if (params?.offset) {
    searchParams.set('offset', String(params.offset));
  }

  const queryString = searchParams.toString();
  return fetchAPI(`/api/opportunities${queryString ? `?${queryString}` : ''}`);
}

export async function getOpportunity(id: string): Promise<ResearchOpportunity> {
  return fetchAPI(`/api/opportunities/${id}`);
}

export async function getFilterOptions(): Promise<FilterOptions> {
  return fetchAPI('/api/filter-options');
}

// Search
export interface SearchRequest {
  query: string;
  student_profile_id?: string;
  filters?: {
    research_categories?: string[];
    preferred_student_years?: string[];
    is_volunteer?: boolean;
    is_paid?: boolean;
    is_work_study?: boolean;
  };
  limit?: number;
}

export async function searchOpportunities(params: SearchRequest): Promise<SearchResponse> {
  return fetchAPI('/api/search', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Student Profiles
export async function createStudentProfile(profile: Omit<StudentProfile, 'id' | 'created_at'>): Promise<StudentProfile> {
  return fetchAPI('/api/student-profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function getStudentProfile(id: string): Promise<StudentProfile> {
  return fetchAPI(`/api/student-profile/${id}`);
}

export async function updateStudentProfile(id: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
  return fetchAPI(`/api/student-profile/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Email Generation
export async function generateEmail(request: EmailGenerateRequest): Promise<EmailResponse> {
  return fetchAPI('/api/generate-email', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Saved Opportunities
export async function saveOpportunity(studentId: string, opportunityId: string): Promise<void> {
  return fetchAPI(`/api/saved/${studentId}/${opportunityId}`, {
    method: 'POST',
  });
}

export async function unsaveOpportunity(studentId: string, opportunityId: string): Promise<void> {
  return fetchAPI(`/api/saved/${studentId}/${opportunityId}`, {
    method: 'DELETE',
  });
}

export async function getSavedOpportunities(studentId: string): Promise<ResearchOpportunity[]> {
  return fetchAPI(`/api/saved/${studentId}`);
}

// Student Profile Create type
export type StudentProfileCreate = Omit<StudentProfile, 'id' | 'created_at'>;

// Email Generate Request type
export interface EmailGenerateRequest {
  opportunity_id: string;
  student_profile_id: string;
  custom_instructions?: string;
  previous_email?: {
    subject: string;
    body: string;
  };
}

// Skill Analysis Types
export interface SkillAnalysisRequest {
  opportunity_id: string;
  student_profile_id: string;
}

export interface SkillAnalysisResponse {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  analysis_text?: string;
}

// Unified API object for easier imports
export const api = {
  // Opportunities
  getOpportunities,
  getOpportunity,
  getFilterOptions,

  // Search
  search: searchOpportunities,

  // Student Profiles
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,

  // Email
  generateEmail,

  // Skills
  analyzeSkills: async (request: SkillAnalysisRequest): Promise<SkillAnalysisResponse> => {
    return fetchAPI('/api/analyze-skills', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Saved
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
};

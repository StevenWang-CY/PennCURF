import os
import json
from typing import List, Dict, Any, Optional
from openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class LLMService:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        )
        self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

    def _extract_query_terms(self, query: str) -> Dict[str, Any]:
        """Extract terms and semantic context from query for soft matching"""
        import re

        # Common stop words to ignore
        stop_words = {
            'i', 'want', 'to', 'work', 'on', 'in', 'a', 'an', 'the', 'and', 'or',
            'for', 'with', 'that', 'is', 'are', 'be', 'been', 'being', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'can', 'need', 'like', 'interested', 'interest',
            'looking', 'find', 'get', 'project', 'research', 'opportunity', 'position',
            'job', 'internship', 'experience', 'field', 'area', 'related', 'involving',
            'some', 'any', 'about', 'into', 'more', 'also', 'very', 'just', 'good'
        }

        # Semantic category mappings (query term → research categories that are relevant)
        category_mappings = {
            'software': ['Engineering and Computing'],
            'programming': ['Engineering and Computing'],
            'web': ['Engineering and Computing'],
            'website': ['Engineering and Computing'],
            'app': ['Engineering and Computing'],
            'code': ['Engineering and Computing'],
            'coding': ['Engineering and Computing'],
            'developer': ['Engineering and Computing'],
            'development': ['Engineering and Computing'],
            'computer': ['Engineering and Computing'],
            'data': ['Engineering and Computing', 'Biomedical Science', 'Mathematics and Applied Mathematics'],
            'machine': ['Engineering and Computing'],
            'ml': ['Engineering and Computing'],
            'ai': ['Engineering and Computing'],
            'healthcare': ['Biomedical Science', 'Nursing'],
            'medical': ['Biomedical Science'],
            'health': ['Biomedical Science', 'Nursing'],
            'biology': ['Biomedical Science', 'Physical and Natural Sciences'],
            'chemistry': ['Physical and Natural Sciences'],
            'physics': ['Physical and Natural Sciences'],
            'math': ['Mathematics and Applied Mathematics'],
            'statistics': ['Mathematics and Applied Mathematics'],
            'economics': ['Business and Economics', 'Social Science'],
            'business': ['Business and Economics'],
            'finance': ['Business and Economics'],
            'psychology': ['Social Science'],
            'sociology': ['Social Science'],
            'politics': ['Social Science'],
            'history': ['Humanities'],
            'literature': ['Humanities'],
            'writing': ['Humanities', 'Arts'],
            'art': ['Arts'],
            'music': ['Arts'],
            'design': ['Arts', 'Engineering and Computing'],
        }

        # Semantic expansion (related terms that should also match)
        semantic_expansions = {
            'website': ['web', 'frontend', 'react', 'javascript', 'html', 'ui', 'ux', 'app', 'application', 'interface', 'site'],
            'web': ['website', 'frontend', 'react', 'javascript', 'html', 'fullstack', 'full-stack', 'app', 'browser'],
            'software': ['programming', 'developer', 'engineering', 'code', 'coding', 'app', 'application', 'build'],
            'development': ['developer', 'developing', 'build', 'building', 'create', 'creating', 'implement', 'engineer'],
            'frontend': ['web', 'react', 'javascript', 'ui', 'ux', 'html', 'css', 'interface', 'design'],
            'backend': ['server', 'api', 'database', 'python', 'node', 'java', 'infrastructure', 'cloud'],
            'machine': ['ml', 'ai', 'deep', 'neural', 'learning', 'model', 'algorithm'],
            'learning': ['ml', 'ai', 'machine', 'neural', 'deep', 'model', 'training'],
            'ml': ['machine', 'ai', 'deep', 'neural', 'model', 'algorithm', 'prediction'],
            'ai': ['artificial', 'intelligence', 'machine', 'ml', 'neural', 'deep', 'model', 'gpt', 'llm'],
            'data': ['analytics', 'analysis', 'science', 'statistics', 'database', 'visualization', 'processing'],
            'chatbot': ['chat', 'bot', 'conversational', 'nlp', 'gpt', 'llm', 'dialogue', 'assistant'],
            'nlp': ['natural', 'language', 'processing', 'text', 'chatbot', 'gpt', 'llm', 'linguistic'],
            'healthcare': ['health', 'medical', 'clinical', 'patient', 'hospital', 'medicine', 'care'],
            'biology': ['biological', 'biomedical', 'genomics', 'cell', 'molecular', 'genetics'],
        }

        # Word stems (common suffixes to strip for matching)
        def get_stem(word):
            """Simple stemming - strip common suffixes"""
            suffixes = ['ing', 'tion', 'ment', 'ness', 'able', 'ible', 'ity', 'ous', 'ive', 'er', 'or', 'ist', 'ly', 'ed', 's']
            for suffix in suffixes:
                if word.endswith(suffix) and len(word) - len(suffix) >= 3:
                    return word[:-len(suffix)]
            return word

        # Tokenize and clean
        words = re.sub(r'[^\w\s]', ' ', query.lower()).split()
        terms = [w for w in words if w not in stop_words and len(w) > 2]

        # Get stems
        stems = set(get_stem(t) for t in terms)

        # Get semantic expansions
        expanded_terms = set(terms)
        for term in terms:
            if term in semantic_expansions:
                expanded_terms.update(semantic_expansions[term])
            # Also check stems
            stem = get_stem(term)
            for key in semantic_expansions:
                if get_stem(key) == stem:
                    expanded_terms.update(semantic_expansions[key])

        # Get relevant categories
        relevant_categories = set()
        for term in terms:
            if term in category_mappings:
                relevant_categories.update(category_mappings[term])
            # Check stems too
            stem = get_stem(term)
            for key in category_mappings:
                if get_stem(key) == stem:
                    relevant_categories.update(category_mappings[key])

        return {
            'original_terms': terms,
            'stems': list(stems),
            'expanded_terms': list(expanded_terms),
            'relevant_categories': list(relevant_categories),
        }

    def _soft_score_opportunity(
        self,
        opp: Dict[str, Any],
        query_info: Dict[str, Any],
        total_opps: int
    ) -> float:
        """
        Calculate a soft relevance score for an opportunity.
        Uses TF-IDF-like scoring with semantic matching.
        """
        import math

        # Get searchable text
        title = (opp.get("title") or "").lower()
        desc = (opp.get("description") or opp.get("teaser") or "").lower()
        mentor = (opp.get("mentor_areas") or "").lower()
        quals = (opp.get("preferred_qualifications") or "").lower()
        categories = opp.get("research_categories") or []

        searchable = f"{title} {desc} {mentor} {quals}"
        searchable_words = set(searchable.split())

        score = 0.0

        # 1. Original term matching (highest weight)
        for term in query_info['original_terms']:
            if term in title:
                score += 5.0  # Title match is very important
            elif term in searchable:
                score += 2.0

        # 2. Expanded term matching (medium weight)
        for term in query_info['expanded_terms']:
            if term not in query_info['original_terms']:  # Don't double count
                if term in title:
                    score += 2.5
                elif term in searchable:
                    score += 1.0

        # 3. Stem matching (catches develop/developer/development)
        for stem in query_info['stems']:
            if len(stem) >= 4:  # Only match meaningful stems
                for word in searchable_words:
                    if word.startswith(stem) and len(word) >= len(stem):
                        score += 0.5
                        break

        # 4. Category matching (boosts projects in relevant fields)
        for cat in categories:
            if cat in query_info['relevant_categories']:
                score += 1.5

        # 5. Fuzzy substring matching (catches partial matches)
        for term in query_info['original_terms']:
            if len(term) >= 5:
                # Check if term is a substring of any word in searchable
                for word in searchable_words:
                    if len(word) >= 5 and (term in word or word in term):
                        score += 0.3
                        break

        return score

    def _soft_prefilter_opportunities(
        self,
        opportunities: List[Dict[str, Any]],
        query: str,
        max_candidates: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Soft pre-filtering using semantic scoring instead of hard keyword matching.
        Returns top candidates by soft relevance score.
        """
        import random

        # Extract query information
        query_info = self._extract_query_terms(query)
        print(f"[LLM] Query analysis: {len(query_info['original_terms'])} terms, {len(query_info['expanded_terms'])} expanded, categories: {query_info['relevant_categories']}")

        # Score all opportunities
        scored_opps = []
        for opp in opportunities:
            score = self._soft_score_opportunity(opp, query_info, len(opportunities))
            scored_opps.append((score, opp))

        # Sort by score descending
        scored_opps.sort(key=lambda x: x[0], reverse=True)

        # Get top scored candidates (those with positive scores)
        top_candidates = []
        for score, opp in scored_opps:
            if score > 0:
                top_candidates.append(opp)
            if len(top_candidates) >= max_candidates:
                break

        print(f"[LLM] Found {len(top_candidates)} opportunities with positive relevance scores")

        # If we have very few matches, add diverse random samples
        if len(top_candidates) < 20:
            # Add some from relevant categories
            category_extras = []
            for score, opp in scored_opps:
                if opp not in top_candidates:
                    cats = opp.get("research_categories") or []
                    if any(c in query_info['relevant_categories'] for c in cats):
                        category_extras.append(opp)
                        if len(category_extras) >= 15:
                            break

            top_candidates.extend(category_extras)
            print(f"[LLM] Added {len(category_extras)} category-matching extras")

        # Ensure minimum diversity with random sample
        if len(top_candidates) < 30:
            remaining = [opp for _, opp in scored_opps if scored_opps[0] not in top_candidates]
            sample_size = min(30 - len(top_candidates), len(remaining))
            if sample_size > 0:
                random_extras = random.sample(remaining, sample_size)
                top_candidates.extend(random_extras)
                print(f"[LLM] Added {sample_size} random samples for diversity")

        return top_candidates[:max_candidates]

    def semantic_search(
        self,
        query: str,
        opportunities: List[Dict[str, Any]],
        student_profile: Optional[Dict[str, Any]] = None,
        top_k: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Use LLM to rank opportunities based on semantic match with query and student profile.
        Returns opportunities with relevance scores.
        """
        print(f"[LLM] Total opportunities to search: {len(opportunities)}")

        # Use SOFT pre-filtering (semantic scoring, not hard keyword matching)
        filtered_opportunities = self._soft_prefilter_opportunities(
            opportunities, query, max_candidates=60
        )
        print(f"[LLM] Soft pre-filtered to {len(filtered_opportunities)} candidates")

        # Create student context if profile provided
        student_context = ""
        if student_profile:
            student_context = f"""
Student Profile:
- Year: {student_profile.get('year', 'Not specified')}
- Major: {student_profile.get('major', 'Not specified')}
- Academic Interests: {', '.join(student_profile.get('academic_interests', []))}
- Career Interests: {', '.join(student_profile.get('career_interests', []))}
- Skills: {', '.join(student_profile.get('skills', []))}
- Experience: {student_profile.get('experience', 'Not specified')}
"""

        # Create summaries of opportunities (now from pre-filtered list)
        opportunity_summaries = []
        for i, opp in enumerate(filtered_opportunities[:50]):  # Send top 50 to LLM
            # Combine description + mentor_areas + qualifications for better context
            desc = opp.get("description") or opp.get("teaser") or ""
            mentor = opp.get("mentor_areas") or ""
            quals = opp.get("preferred_qualifications") or ""
            # Combine and truncate to 400 chars total
            combined = f"{desc[:200]} | Skills: {mentor[:100]} | Looking for: {quals[:100]}"

            summary = {
                "id": str(opp.get("id", "")),
                "title": opp.get("title", ""),
                "desc": combined,
            }
            opportunity_summaries.append(summary)

        prompt = f"""You are a research opportunity matcher helping students find relevant research positions.
{student_context}
Query: "{query}"

SCORING GUIDELINES:
- Score 9-10: The position's MAIN WORK directly matches the query (e.g., "software development" query matches a position building software)
- Score 7-8: Strong relevance - the query skill/interest is a significant part of the work
- Score 5-6: Moderate relevance - related field, transferable skills, or partial match
- DO NOT give 9-10 to positions where the query topic is just a SIDE TASK (e.g., a physics project that incidentally needs a website is NOT a "web development" position)

INTERPRET THE QUERY BROADLY:
- "website development" → web dev, software engineering, frontend, full-stack, programming, building web apps/tools
- "machine learning" → ML, AI, deep learning, data science, neural networks
- "healthcare" → medicine, clinical research, health informatics, biomedical
- Match RELATED skills and fields, not just exact keyword matches

Opportunities:
{json.dumps(opportunity_summaries)}

Return opportunities with score >= 5. Include diverse matches that fit the student's interests.
Return ONLY valid JSON array: [{{"id":"uuid","score":9,"explanation":"brief reason"}}]
Sort by score descending. Return up to 15 matches."""

        try:
            print(f"[LLM] Sending {len(opportunity_summaries)} opportunities for query: {query}")

            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "Return only valid JSON arrays. No markdown, no explanation, just the JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_completion_tokens=4000,  # Increased from 2000
            )

            # Check if response has content
            if not response.choices or not response.choices[0].message.content:
                print(f"[LLM] Empty response from API")
                print(f"[LLM] Full response: {response}")
                raise ValueError("Empty response from LLM")

            result_text = response.choices[0].message.content.strip()
            print(f"[LLM] Raw response (first 500 chars): {result_text[:500]}")

            # Parse JSON response - handle potential markdown code blocks
            if result_text.startswith("```"):
                # Extract content between ``` markers
                parts = result_text.split("```")
                if len(parts) >= 2:
                    result_text = parts[1]
                    if result_text.startswith("json"):
                        result_text = result_text[4:]
                    result_text = result_text.strip()

            # Also handle case where response ends with ```
            if result_text.endswith("```"):
                result_text = result_text[:-3].strip()

            scores = json.loads(result_text)
            print(f"[LLM] Parsed {len(scores)} scored opportunities")

            # Create a map of id to score and explanation
            score_map = {item["id"]: {"score": item["score"], "explanation": item.get("explanation", "")} for item in scores}

            # Add scores to opportunities and sort
            scored_opportunities = []
            for opp in opportunities:
                opp_id = str(opp.get("id", ""))
                if opp_id in score_map:
                    scored_opportunities.append({
                        "opportunity": opp,
                        "score": score_map[opp_id]["score"],
                        "explanation": score_map[opp_id]["explanation"]
                    })

            # Sort by score descending
            scored_opportunities.sort(key=lambda x: x["score"], reverse=True)

            print(f"[LLM] Returning {len(scored_opportunities[:top_k])} results")

            return scored_opportunities[:top_k]

        except json.JSONDecodeError as e:
            print(f"[LLM] JSON parse error: {e}")
            print(f"[LLM] Failed to parse: {result_text[:1000] if 'result_text' in dir() else 'N/A'}")
            # Fallback: return first N opportunities with default score
            return [
                {"opportunity": opp, "score": 5.0, "explanation": "Default match"}
                for opp in opportunities[:top_k]
            ]
        except Exception as e:
            print(f"[LLM] Search error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            # Fallback: return first N opportunities with default score
            return [
                {"opportunity": opp, "score": 5.0, "explanation": "Default match"}
                for opp in opportunities[:top_k]
            ]

    def generate_cold_email(
        self,
        opportunity: Dict[str, Any],
        student_profile: Dict[str, Any],
        **kwargs
    ) -> Dict[str, str]:
        """
        Generate a personalized cold email for a research opportunity.
        Returns subject line and email body.
        """
        researcher_name = opportunity.get("researcher_name", "Professor")
        researcher_title = opportunity.get("researcher_title", "")
        project_title = opportunity.get("title", "")
        project_description = opportunity.get("description", "")
        mentor_areas = opportunity.get("mentor_areas", "")
        qualifications = opportunity.get("preferred_qualifications", "")

        student_name = student_profile.get("name", "Student")
        student_year = student_profile.get("year", "")
        student_major = student_profile.get("major", "")
        student_interests = student_profile.get("academic_interests", [])
        student_career = student_profile.get("career_interests", [])
        student_skills = student_profile.get("skills", [])
        student_experience = student_profile.get("experience", "")

        student_experience = student_profile.get("experience", "")

        # Check if this is a revision request
        custom_instructions = kwargs.get("custom_instructions")
        previous_email = kwargs.get("previous_email")

        if custom_instructions and previous_email:
            # Revision Prompt
            prompt = f"""Revise the following cold email for a research opportunity based on the student's instructions.

OPPORTUNITY:
- Project: {project_title}
- Description: {project_description if project_description else 'Not available'}

STUDENT:
- Name: {student_name}
- Major: {student_major}

PREVIOUS DRAFT:
Subject: {previous_email.get('subject', '')}
Body:
{previous_email.get('body', '')}

INSTRUCTIONS FOR REVISION:
"{custom_instructions}"

Generate the REVISED email JSON. Keep what works from the previous draft but apply the requested changes.
Return ONLY valid JSON:
{{
    "subject": "Revised Subject",
    "body": "Revised Body"
}}"""
        else:
            # Standard Generation Prompt
            prompt = f"""Generate a professional cold email for an undergraduate student reaching out to a faculty member about a research opportunity.

FACULTY INFORMATION:
- Name: {researcher_name}
- Title: {researcher_title}
- Project Title: {project_title}
- Project Description: {project_description if project_description else 'Not available'}
- Mentor Areas: {mentor_areas if mentor_areas else 'Not available'}
- Preferred Qualifications: {qualifications if qualifications else 'Not specified'}

STUDENT INFORMATION:
- Name: {student_name}
- Year: {student_year}
- Major: {student_major}
- Academic Interests: {', '.join(student_interests) if student_interests else 'Not specified'}
- Career Interests: {', '.join(student_career) if student_career else 'Not specified'}
- Skills: {', '.join(student_skills) if student_skills else 'Not specified'}
- Experience: {student_experience if student_experience else 'Not specified'}

Generate an email that:
1. Has a clear, specific subject line
2. Opens with a professional greeting using the professor's name
3. Introduces the student briefly (name, year, major)
4. Explains why they're interested in THIS specific research (connect to project description)
5. Highlights relevant skills/experience that match the qualifications
6. Makes a polite request to discuss opportunities
7. Closes professionally

The email should be:
- Concise (under 250 words for the body)
- Professional but personable
- Specific to this opportunity (not generic)
- Free of typos and grammatically correct

Return your response in this exact JSON format:
{{
    "subject": "Subject line here",
    "body": "Full email body here"
}}

Return ONLY the JSON, no other text."""

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at writing professional academic emails. Always return valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_completion_tokens=1000,
            )
            content = response.choices[0].message.content
            # Clean up potential markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content.strip())

        except Exception as e:
            print(f"Email generation error: {e}")
            # Fallback template
            return {
                "subject": f"Research Opportunity Inquiry - {project_title}",
                "body": f"""Dear {researcher_name},

I am {student_name}, a {student_year} studying {student_major} at the University of Pennsylvania. I recently came across your research on "{project_title}" through the CURF Research Directory and am very interested in potentially joining your lab.

Your work on {mentor_areas if mentor_areas else 'this research area'}... resonates with my academic interests in {', '.join(student_interests[:2]) if student_interests else 'this field'}.

I would be grateful for the opportunity to discuss potential research positions in your lab. I am available to meet at your convenience.

Thank you for your time and consideration.

Best regards,
{student_name}""",
                "professor_email": opportunity.get("researcher_email"),
                "professor_name": researcher_name,
            }

    def analyze_skill_compatibility(
        self,
        opportunity: Dict[str, Any],
        student_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze the compatibility between a student's profile and a research opportunity.
        Returns match score, matched skills, and missing skills.
        """
        project_title = opportunity.get("title", "")
        project_description = opportunity.get("description", "")
        qualifications = opportunity.get("preferred_qualifications", "")

        student_major = student_profile.get("major", "")
        student_skills = student_profile.get("skills", [])
        student_experience = student_profile.get("experience", "")

        prompt = f"""Analyze the skill compatibility between this student and the research opportunity.

OPPORTUNITY:
- Title: {project_title}
- Description: {project_description if project_description else 'Not available'}
- Qualifications: {qualifications if qualifications else 'Not specified'}

STUDENT:
- Major: {student_major}
- Skills: {', '.join(student_skills) if student_skills else 'Not specified'}
- Experience: {student_experience if student_experience else 'Not specified'}

TASK:
1. Extract required technical and soft skills from the opportunity.
2. Compare them with the student's skills and experience.
3. Identify which required skills the student HAS (matches).
4. Identify which required skills the student NEEDS (missing).
5. Assign a compatibility score (0-100) based on how well they fit.

Return ONLY valid JSON in this format:
{{
    "match_score": 85,
    "matched_skills": ["Python", "Data Analysis"],
    "missing_skills": ["React", "AWS"],
    "analysis_text": "A brief 1-sentence summary of the fit."
}}
"""
        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a career counselor and skill analyzer. Always return valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_completion_tokens=5000,
            )

            content = response.choices[0].message.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content.strip())

        except Exception as e:
            import traceback
            print(f"Error analyzing skills: {e}")
            traceback.print_exc()
            return {
                "match_score": 0,
                "matched_skills": [],
                "missing_skills": [],
                "analysis_text": "Unable to analyze skills at this time."
            }


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service

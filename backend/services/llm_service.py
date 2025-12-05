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

        # Create summaries of opportunities (limit to 40 to avoid context overflow)
        # Using compact format to reduce token usage
        opportunity_summaries = []
        for i, opp in enumerate(opportunities[:40]):  # Reduced from 100 to 40
            summary = {
                "id": str(opp.get("id", "")),
                "title": opp.get("title", ""),
                "desc": (opp.get("description") or opp.get("teaser") or "")[:150],  # Reduced from 300
            }
            opportunity_summaries.append(summary)

        prompt = f"""You are helping match a student with research opportunities.
{student_context}
Query: "{query}"

Score each opportunity 1-10 based on relevance to the query. Return JSON array with id, score, explanation (10 words max).
Only include score >= 5. Sort by score descending.

Opportunities:
{json.dumps(opportunity_summaries)}

Return ONLY valid JSON array like: [{{"id":"uuid","score":9,"explanation":"reason"}}]"""

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

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

    def _clean_scraped_text(self, text: str) -> str:
        """Clean scraped text that may contain extra 'Details:' section or other artifacts."""
        if not text:
            return ""

        # Remove "Details:" section and everything after common markers
        markers = [
            'Details:',
            'Preferred Student Year',
            'VolunteerYes',
            'VolunteerNo',
            'PaidYes',
            'PaidNo',
            'Work StudyYes',
            'Work StudyNo',
            'Researcher',
        ]

        cleaned = text
        for marker in markers:
            idx = cleaned.find(marker)
            if idx > 0:
                cleaned = cleaned[:idx]

        return cleaned.strip()

    def _truncate_at_sentence(self, text: str, max_chars: int) -> str:
        """Truncate text at a sentence boundary, respecting word boundaries."""
        if not text or len(text) <= max_chars:
            return text

        # Find the last sentence boundary before max_chars
        truncated = text[:max_chars]

        # Look for sentence endings
        last_period = truncated.rfind('. ')
        last_question = truncated.rfind('? ')
        last_exclaim = truncated.rfind('! ')

        # Find the best sentence boundary
        best_boundary = max(last_period, last_question, last_exclaim)

        if best_boundary > max_chars // 2:  # Only use if we keep at least half the content
            return text[:best_boundary + 1].strip()

        # Fall back to word boundary
        last_space = truncated.rfind(' ')
        if last_space > max_chars // 2:
            return text[:last_space].strip()

        return truncated.strip()

    def _extract_research_topics(self, text: str) -> list:
        """
        Extract key research topics/themes from mentor_areas or description text.
        Returns a list of clean topic phrases (not bullet points).
        """
        if not text:
            return []

        import re

        # Split on common delimiters (bullets, newlines, semicolons, "and")
        # to get individual topics
        delimiters = r'[•\n;]|(?:,\s*and\s+)|(?:\s+and\s+)'
        parts = re.split(delimiters, text)

        topics = []
        for part in parts:
            # Clean each part
            cleaned = part.strip()
            cleaned = re.sub(r'^[-–—*·]\s*', '', cleaned)  # Remove leading bullets/dashes
            cleaned = re.sub(r'^\d+[.)]\s*', '', cleaned)  # Remove numbered list markers

            # Remove common lab introduction prefixes
            prefixes = [
                r"^The \w+ Lab is interested in ",
                r"^Our lab focuses on ",
                r"^Our research focuses on ",
                r"^We are interested in ",
                r"^This project focuses on ",
            ]
            for prefix in prefixes:
                cleaned = re.sub(prefix, "", cleaned, flags=re.IGNORECASE)

            # Clean up and validate
            cleaned = cleaned.strip(' .,;:')

            # Only keep meaningful topics (3+ words, not too long)
            word_count = len(cleaned.split())
            if word_count >= 2 and len(cleaned) > 10 and len(cleaned) < 100:
                # Lowercase for natural sentence flow
                if cleaned and cleaned[0].isupper():
                    cleaned = cleaned[0].lower() + cleaned[1:]
                topics.append(cleaned)

        # Return unique topics, max 3
        seen = set()
        unique_topics = []
        for t in topics:
            if t.lower() not in seen:
                seen.add(t.lower())
                unique_topics.append(t)
                if len(unique_topics) >= 3:
                    break

        return unique_topics

    def _format_topics_naturally(self, topics: list) -> str:
        """Convert a list of topics into a natural English phrase."""
        if not topics:
            return ""
        if len(topics) == 1:
            return topics[0]
        if len(topics) == 2:
            return f"{topics[0]} and {topics[1]}"
        return f"{', '.join(topics[:-1])}, and {topics[-1]}"

    def _polish_email(self, subject: str, body: str) -> Dict[str, str]:
        """
        Polish the email through LLM to correct grammar and improve flow.
        This is a light refinement pass, not a complete rewrite.
        """
        polish_prompt = f"""You are an expert editor. Polish the following cold email to correct any grammar mistakes and slightly improve the flow while keeping the content and meaning intact.

IMPORTANT RULES:
- DO NOT change the overall structure or add new content
- DO NOT make it longer - keep it concise
- DO NOT change the tone (keep it professional but genuine)
- DO NOT add flowery language or excessive praise
- ONLY fix grammar issues, awkward phrasing, and improve natural flow
- Keep the same greeting, closing, and signature format

CURRENT EMAIL:
Subject: {subject}

Body:
{body}

Return the polished email in this exact JSON format:
{{
    "subject": "Polished subject line",
    "body": "Polished email body with proper line breaks using \\n"
}}

Return ONLY valid JSON, no other text."""

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional editor specializing in academic correspondence. Make minimal, precise improvements to grammar and flow. Always return valid JSON.",
                    },
                    {"role": "user", "content": polish_prompt},
                ],
                max_completion_tokens=1500,
            )
            content = response.choices[0].message.content

            # Clean up potential markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            polished = json.loads(content.strip())
            return polished

        except Exception as e:
            print(f"Email polish error (using original): {e}")
            # If polishing fails, return the original
            return {"subject": subject, "body": body}

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

        # Clean scraped data to remove artifacts
        project_description = self._clean_scraped_text(opportunity.get("description", ""))
        mentor_areas = self._clean_scraped_text(opportunity.get("mentor_areas", ""))
        qualifications = self._clean_scraped_text(opportunity.get("preferred_qualifications", ""))

        student_name = student_profile.get("name", "Student")
        student_year = student_profile.get("year", "")
        student_major = student_profile.get("major", "")
        student_interests = student_profile.get("academic_interests", [])
        student_career = student_profile.get("career_interests", [])
        student_skills = student_profile.get("skills", [])
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
            # Standard Generation Prompt - Optimized for natural, persuasive cold emails
            prompt = f"""You are an expert at crafting cold emails that actually get responses from professors. Your emails sound like they were written by a thoughtful student, not generated by AI.

PROFESSOR/LAB INFORMATION:
- Professor Name: {researcher_name}
- Title: {researcher_title}
- Research Project: {project_title}
- Project Description: {project_description if project_description else 'Not available'}
- Research Focus/Mentor Areas: {mentor_areas if mentor_areas else 'Not available'}
- What They're Looking For: {qualifications if qualifications else 'Not specified'}

STUDENT PROFILE:
- Name: {student_name}
- Year: {student_year}
- Major: {student_major}
- Academic Interests: {', '.join(student_interests) if student_interests else 'Not specified'}
- Career Goals: {', '.join(student_career) if student_career else 'Not specified'}
- Technical Skills: {', '.join(student_skills) if student_skills else 'Not specified'}
- Past Experience: {student_experience if student_experience else 'Not specified'}

YOUR TASK: Write a persuasive cold email that DIRECTLY CONNECTS the student's background to this specific research opportunity.

CRITICAL - SKILL/EXPERIENCE MATCHING:
First, identify which of the student's skills and experiences are MOST RELEVANT to what the professor is looking for:
- If the project needs programming → highlight relevant coding experience
- If the project needs data analysis → highlight statistics/data skills
- If the project needs lab work → highlight any wet lab or research experience
- If the student has internship/work experience → describe SPECIFIC projects they worked on
- Connect the dots: "My experience doing X at Y directly prepared me for Z in your lab"

EMAIL STRUCTURE:

1. OPENING (2 sentences max)
   - "Dear Professor [Last Name],"
   - Quick intro: name, year, major, found via CURF

2. WHY THIS RESEARCH (2-3 sentences)
   - Pick ONE specific aspect of their research that connects to YOUR background
   - Explain WHY it excites you based on your own experience/interests
   - Show you understand what the research actually involves

3. YOUR RELEVANT QUALIFICATIONS (THIS IS THE MOST IMPORTANT PART - 3-4 sentences)
   - Lead with your STRONGEST relevant experience
   - Be SPECIFIC: "At [Company], I [specific achievement] using [specific tools]"
   - If you have internship/work experience, describe what you actually DID, not just where you worked
   - Connect each qualification to how it would help THIS research
   - If skills are limited, emphasize: relevant coursework, personal projects, eagerness to learn

4. THE ASK (1-2 sentences)
   - Request 15-20 min meeting
   - Thank them

STYLE RULES:
- 180-220 words (enough to show substance, short enough to respect their time)
- NO bullet points - write in natural paragraphs
- NO generic phrases like "I find your research fascinating" or "I am passionate about"
- BE SPECIFIC - vague emails get deleted
- Sound confident but not arrogant

BAD EXAMPLE:
"I have experience with C/C++, SQL, and Java, which I believe would be valuable for this work. I worked at Franklink as a founding engineer and interned at Huatai Securities."

GOOD EXAMPLE:
"As a founding engineer at Franklink, I built data pipelines processing millions of records daily using Python and SQL—experience that would directly translate to analyzing the large genomic datasets in your lab. My internship at Huatai Securities strengthened my statistical modeling skills, where I developed predictive algorithms that improved trading accuracy by 15%."

Return your response in this exact JSON format:
{{
    "subject": "Subject line here",
    "body": "Full email body here with proper line breaks using \\n"
}}

Return ONLY valid JSON, no other text."""

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert academic career advisor who has helped hundreds of students land research positions through effective cold emails. You understand what professors look for: genuine interest, relevant qualifications, and respect for their time. Generate natural, personalized emails that get responses. Always return valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_completion_tokens=1500,
            )
            content = response.choices[0].message.content
            # Clean up potential markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            generated_email = json.loads(content.strip())

            # Polish the email for grammar and flow
            polished = self._polish_email(generated_email.get("subject", ""), generated_email.get("body", ""))

            return {
                "subject": polished.get("subject", generated_email.get("subject", "")),
                "body": polished.get("body", generated_email.get("body", "")),
                "professor_email": opportunity.get("researcher_email"),
                "professor_name": researcher_name,
            }

        except Exception as e:
            print(f"Email generation error: {e}")
            # Improved fallback template - natural and persuasive
            prof_last_name = researcher_name.split()[-1] if researcher_name else "Professor"

            # Extract and format research topics naturally
            research_topics = []
            if mentor_areas:
                research_topics = self._extract_research_topics(mentor_areas)
            if not research_topics and project_description:
                research_topics = self._extract_research_topics(project_description)

            # Build the "why this research" paragraph - connect to student's background
            why_paragraph = ""
            if research_topics:
                topics_phrase = self._format_topics_naturally(research_topics)
                # Try to connect research to student's interests or experience
                if student_interests and student_experience:
                    main_interest = student_interests[0].lower()
                    why_paragraph = f"Your work on {topics_phrase} caught my attention because it aligns with my interest in {main_interest}. Having worked in related areas, I'm excited by the potential to apply my background to meaningful research."
                elif student_interests:
                    main_interest = student_interests[0].lower()
                    why_paragraph = f"I'm drawn to your work on {topics_phrase} because of my strong interest in {main_interest}. The way your research tackles real-world problems resonates with the kind of impact I hope to make."
                else:
                    why_paragraph = f"Your work on {topics_phrase} stood out to me as I explore research opportunities in {student_major.lower()}. I'm eager to contribute to work that pushes boundaries in this field."
            else:
                why_paragraph = f"After reading about \"{project_title},\" I was excited by the opportunity to contribute to research that connects to my background in {student_major.lower()}."

            # Build qualifications paragraph - SPECIFIC and connected to the project
            qual_paragraph = ""
            if student_experience and student_skills:
                # Lead with experience, then connect skills
                exp_clean = self._truncate_at_sentence(student_experience, 180)
                skills_phrase = self._format_topics_naturally(student_skills[:3])
                qual_paragraph = f"{exp_clean} Through this work, I developed strong skills in {skills_phrase}. I believe this hands-on experience would allow me to contribute meaningfully to your research from day one."
            elif student_experience:
                # Experience but no skills listed - focus on what they did
                exp_clean = self._truncate_at_sentence(student_experience, 220)
                qual_paragraph = f"{exp_clean} This experience taught me how to work independently, solve complex problems, and deliver results—skills I'm eager to bring to your lab."
            elif student_skills:
                # Skills but no experience - frame as project/coursework based
                skills_phrase = self._format_topics_naturally(student_skills[:4])
                qual_paragraph = f"Through coursework and personal projects, I've built proficiency in {skills_phrase}. While I'm still early in my research journey, I'm a quick learner who thrives on tackling challenging problems and would welcome the chance to grow under your mentorship."
            else:
                # No skills or experience - emphasize eagerness and major
                qual_paragraph = f"As a {student_year} in {student_major}, I'm eager to gain hands-on research experience. I'm a dedicated learner who isn't afraid to dive into unfamiliar territory, and I'd welcome the chance to develop new skills under your guidance."

            # Create concise subject line with student context
            subject_topic = research_topics[0] if research_topics else project_title
            if len(subject_topic) > 35:
                subject_topic = subject_topic[:32] + "..."
            draft_subject = f"Penn {student_year} – Interest in {subject_topic.title()}"

            # Assemble the email naturally
            draft_body = f"""Dear Professor {prof_last_name},

I'm {student_name}, a {student_year} studying {student_major} at Penn. I found your research through the CURF Research Directory and wanted to reach out about potential opportunities in your lab.

{why_paragraph}

{qual_paragraph}

I'd love the chance to discuss your current projects and how I might contribute. Would you have 15 minutes for a brief conversation at your convenience?

Thank you for your time.

Best regards,
{student_name}"""

            # Polish the fallback email for grammar and flow
            polished = self._polish_email(draft_subject, draft_body)

            return {
                "subject": polished.get("subject", draft_subject),
                "body": polished.get("body", draft_body),
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

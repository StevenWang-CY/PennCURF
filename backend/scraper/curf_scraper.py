#!/usr/bin/env python3
"""
Penn CURF Research Directory Scraper

This script scrapes all research opportunities from the Penn CURF Research Directory
and stores them in Supabase.

Usage:
    python curf_scraper.py

The scraper uses a session cookie for authentication.
Make sure CURF_SESSION_COOKIE is set in your .env file.
"""

import os
import re
import sys
import json
import time
from typing import Dict, List, Optional, Any
from datetime import datetime
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.supabase_service import get_supabase_service

# Load environment variables
load_dotenv()

# Constants
BASE_URL = "https://curf.upenn.edu"
DIRECTORY_URL = f"{BASE_URL}/undergraduate-research/research-directory"
PROGRESS_FILE = "scraper_progress.json"


class CURFScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session_cookie = os.getenv("CURF_SESSION_COOKIE", "")

        if not self.session_cookie:
            raise ValueError("CURF_SESSION_COOKIE not found in environment variables")

        # Set cookies
        if ";" in self.session_cookie:
            self.session.headers.update({"Cookie": self.session_cookie})
        else:
            self.session.cookies.set(
                "SSESSe9cabe4b674b11edf21ca1046f3451bf",
                self.session_cookie.split("=")[1] if "=" in self.session_cookie else self.session_cookie,
                domain="curf.upenn.edu"
            )

        # Set headers
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })

        self.db = get_supabase_service()
        self.progress = self._load_progress()

    def _load_progress(self) -> Dict[str, Any]:
        """Load scraping progress from file"""
        if os.path.exists(PROGRESS_FILE):
            with open(PROGRESS_FILE, "r") as f:
                return json.load(f)
        return {"completed_slugs": [], "last_page": 0}

    def _save_progress(self):
        """Save scraping progress to file"""
        with open(PROGRESS_FILE, "w") as f:
            json.dump(self.progress, f)

    def _fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch a page and return BeautifulSoup object"""
        try:
            response = self.session.get(url, timeout=30)

            # Check for redirect to login page
            if "saml/login" in response.url or response.status_code == 403:
                print(f"ERROR: Session expired or access denied. Please update CURF_SESSION_COOKIE in .env")
                return None

            if response.status_code != 200:
                print(f"ERROR: Got status {response.status_code} for {url}")
                return None

            return BeautifulSoup(response.text, "html.parser")

        except Exception as e:
            print(f"ERROR: Failed to fetch {url}: {e}")
            return None

    def get_total_pages(self) -> int:
        """Get the total number of pages in the directory"""
        soup = self._fetch_page(DIRECTORY_URL)
        if not soup:
            return 0

        # Find pagination links
        pager_links = soup.find_all("a", href=re.compile(r"\?page=\d+"))
        max_page = 0

        for link in pager_links:
            href = link.get("href", "")
            match = re.search(r"page=(\d+)", href)
            if match:
                page_num = int(match.group(1))
                max_page = max(max_page, page_num)

        return max_page + 1  # Pages are 0-indexed

    def scrape_listing_page(self, page_num: int) -> List[Dict[str, Any]]:
        """Scrape a single listing page for project summaries"""
        url = f"{DIRECTORY_URL}?page={page_num}"
        print(f"  Fetching listing page {page_num}...")

        soup = self._fetch_page(url)
        if not soup:
            return []

        projects = []

        # Find all project rows
        rows = soup.find_all("div", class_="views-row")

        for row in rows:
            try:
                # Get project URL and slug
                title_link = row.find("a", href=re.compile(r"/rd/"))
                if not title_link:
                    continue

                href = title_link.get("href", "")
                # Handle various href formats: /rd/slug, https://curf.upenn.edu/rd/slug, etc.
                if "/rd/" in href:
                    slug = href.split("/rd/")[-1].strip("/")
                else:
                    slug = href.strip("/")

                # Get title
                title = title_link.get_text(strip=True)

                # Get teaser/description
                teaser_elem = row.find("p", class_="field-content")
                teaser = teaser_elem.get_text(strip=True) if teaser_elem else ""

                # Get researcher name
                researcher_link = row.find("a", href=re.compile(r"/(profile|user)/"))
                researcher_name = researcher_link.get_text(strip=True) if researcher_link else ""
                researcher_profile = researcher_link.get("href", "") if researcher_link else ""

                # Get research categories
                categories_elem = row.find("div", class_="text-cta__taxonomy")
                categories = []
                if categories_elem:
                    cat_text = categories_elem.get_text(strip=True)
                    categories = [c.strip() for c in cat_text.split(",")]

                projects.append({
                    "slug": slug,
                    "title": title,
                    "teaser": teaser,
                    "researcher_name": researcher_name,
                    "researcher_profile_url": urljoin(BASE_URL, researcher_profile) if researcher_profile else None,
                    "research_categories": categories,
                })

            except Exception as e:
                print(f"    Warning: Failed to parse project row: {e}")
                continue

        return projects

    def scrape_detail_page(self, slug: str) -> Dict[str, Any]:
        """Scrape a single project detail page"""
        url = f"{BASE_URL}/rd/{slug}"

        soup = self._fetch_page(url)
        if not soup:
            return {}

        data = {"slug": slug}

        try:
            # Title
            title_elem = soup.find("h1", class_="page__header-title")
            data["title"] = title_elem.get_text(strip=True) if title_elem else ""

            # Find all h2 sections
            sections = soup.find_all("h2")

            for section in sections:
                section_title = section.get_text(strip=True).lower()

                # Collect ALL content between this h2 and the next h2/section header
                # This handles multi-paragraph content properly
                content_parts = []
                project_website_link = None

                for sibling in section.find_next_siblings():
                    # Stop when we hit another section header
                    if sibling.name in ["h2", "h3"]:
                        break

                    # Collect text from p, div elements
                    if sibling.name in ["p", "div"]:
                        text = sibling.get_text(strip=True)
                        if text:
                            content_parts.append(text)

                        # Check for project website link
                        link = sibling.find("a")
                        if link and "project website" in section_title:
                            project_website_link = link.get("href", "")

                    # Collect text from ul/ol list elements
                    elif sibling.name in ["ul", "ol"]:
                        list_items = sibling.find_all("li")
                        for li in list_items:
                            li_text = li.get_text(strip=True)
                            if li_text:
                                content_parts.append(f"• {li_text}")

                # Join all parts with newlines for multi-paragraph content
                content = "\n\n".join(content_parts)

                if "mentor areas" in section_title:
                    data["mentor_areas"] = content
                elif "description" in section_title:
                    data["description"] = content
                elif "preferred qualifications" in section_title:
                    data["preferred_qualifications"] = content
                elif "project website" in section_title:
                    if project_website_link:
                        data["project_website"] = project_website_link
                    elif content_parts:
                        # Sometimes the URL is just text
                        first_link = section.find_next("a")
                        if first_link:
                            data["project_website"] = first_link.get("href", "")

            # Preferred Student Year
            year_header = soup.find("h3", string=re.compile(r"Preferred Student Year", re.I))
            if year_header:
                year_elem = year_header.find_next_sibling("p")
                if year_elem:
                    years_text = year_elem.get_text(strip=True)
                    years = [y.strip() for y in years_text.split(",")]
                    data["preferred_student_years"] = years

            # Academic Term
            term_header = soup.find("h3", string=re.compile(r"Academic Term", re.I))
            if term_header:
                term_elem = term_header.find_next_sibling("p")
                if term_elem:
                    terms_text = term_elem.get_text(strip=True)
                    terms = [t.strip() for t in terms_text.split(",")]
                    data["academic_terms"] = terms

            # Volunteer/Paid/Work Study
            for field in ["Volunteer", "Paid", "Work Study"]:
                header = soup.find("h3", string=re.compile(field, re.I))
                if header:
                    value_elem = header.find_next_sibling("p")
                    if value_elem:
                        value = value_elem.get_text(strip=True).lower()
                        field_name = f"is_{field.lower().replace(' ', '_')}"
                        data[field_name] = value == "yes"

            # Researcher info
            researcher_section = soup.find("h2", string=re.compile(r"Researcher", re.I))
            if researcher_section:
                researcher_div = researcher_section.find_next("div", class_="views-field")

                if researcher_div:
                    # Name
                    name_link = researcher_div.find("a")
                    if name_link:
                        data["researcher_name"] = name_link.get_text(strip=True)
                        data["researcher_profile_url"] = urljoin(BASE_URL, name_link.get("href", ""))

                    # Title
                    title_div = researcher_div.find("div", class_="views-field-field-professional-title-u-p")
                    if title_div:
                        data["researcher_title"] = title_div.get_text(strip=True)

                # Email
                email_link = soup.find("a", href=re.compile(r"mailto:"))
                if email_link:
                    email = email_link.get("href", "").replace("mailto:", "")
                    data["researcher_email"] = email

                # Lab website and department page
                researcher_parent = researcher_section.find_parent()
                if researcher_parent:
                    links = researcher_parent.find_all("a", href=True)
                    for link in links:
                        href = link.get("href", "")
                        text = link.get_text(strip=True).lower()

                        if "mailto:" in href:
                            continue
                        elif "lab" in text or "website" in text:
                            data["lab_website"] = href
                        elif any(x in href for x in ["upenn.edu/people", "bio.upenn", "med.upenn"]):
                            data["department_page_url"] = href

            # Set scraped timestamp
            data["scraped_at"] = datetime.now().isoformat()

        except Exception as e:
            print(f"    Warning: Error parsing detail page for {slug}: {e}")

        return data

    def run(self, resume: bool = True):
        """Run the full scraping process"""
        print("=" * 60)
        print("Penn CURF Research Directory Scraper")
        print("=" * 60)

        # Phase 1: Get all project slugs from listing pages
        print("\nPhase 1: Scanning listing pages...")
        total_pages = self.get_total_pages()
        print(f"  Found {total_pages} pages to scrape")

        all_projects = []
        start_page = self.progress.get("last_page", 0) if resume else 0

        for page in range(start_page, total_pages):
            projects = self.scrape_listing_page(page)
            all_projects.extend(projects)
            self.progress["last_page"] = page
            self._save_progress()
            print(f"    Page {page}: Found {len(projects)} projects (Total: {len(all_projects)})")
            time.sleep(1)  # Rate limiting

        print(f"\n  Total projects found: {len(all_projects)}")

        # Phase 2: Scrape detail pages
        print("\nPhase 2: Scraping detail pages...")
        completed = set(self.progress.get("completed_slugs", []))

        for i, project in enumerate(all_projects):
            slug = project["slug"]

            if resume and slug in completed:
                print(f"  [{i+1}/{len(all_projects)}] Skipping {slug} (already scraped)")
                continue

            print(f"  [{i+1}/{len(all_projects)}] Scraping {slug}...")

            # Get detail page data
            detail_data = self.scrape_detail_page(slug)

            if detail_data:
                # Merge listing data with detail data
                merged = {**project, **detail_data}

                # Upsert to database
                try:
                    self.db.upsert_opportunity(merged)
                    completed.add(slug)
                    self.progress["completed_slugs"] = list(completed)
                    self._save_progress()
                except Exception as e:
                    print(f"    Error saving to database: {e}")

            time.sleep(0.5)  # Rate limiting

        # Clean up progress file
        if os.path.exists(PROGRESS_FILE):
            os.remove(PROGRESS_FILE)

        print("\n" + "=" * 60)
        print(f"Scraping complete! Processed {len(all_projects)} projects.")
        print("=" * 60)


def main():
    try:
        scraper = CURFScraper()
        scraper.run(resume=True)
    except ValueError as e:
        print(f"Configuration error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nScraping interrupted. Progress saved. Run again to resume.")
        sys.exit(0)


if __name__ == "__main__":
    main()

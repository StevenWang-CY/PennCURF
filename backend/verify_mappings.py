
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock AzureOpenAI to avoid import errors or API calls during test
import services.llm_service
from unittest.mock import MagicMock
services.llm_service.AzureOpenAI = MagicMock()

from services.llm_service import LLMService

def verify_mappings():
    print("Verifying Search Mappings...")
    service = LLMService()
    
    test_cases = [
        ("history research", ["Humanities"]),
        ("climate change", ["Physical and Natural Sciences", "Social Science"]),
        ("marketing strategy", ["Business and Economics"]),
        ("genetics lab", ["Biomedical Science"]),
        ("education policy", ["Social Science"]),
        ("quantum physics", ["Physical and Natural Sciences", "Engineering and Computing"]),
        ("machine learning", ["Engineering and Computing"]),
    ]
    
    passed = 0
    for query, expected_cats in test_cases:
        print(f"\nQuery: '{query}'")
        result = service._extract_query_terms(query)
        cats = result['relevant_categories']
        print(f" -> Mapped to: {cats}")
        
        # Check if at least one expected category is present
        match = any(c in cats for c in expected_cats)
        if match:
            print(" [PASS] Found expected category")
            passed += 1
        else:
            print(f" [FAIL] Expected one of {expected_cats}")

    print(f"\nSummary: {passed}/{len(test_cases)} tests passed")

if __name__ == "__main__":
    verify_mappings()

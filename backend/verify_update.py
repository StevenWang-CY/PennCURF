
import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

def verify_recent_updates():
    print("Verifying Supabase updates...")
    
    # Get count of total opportunities
    count_res = supabase.table("research_opportunities").select("id", count="exact").execute()
    print(f"Total opportunities: {count_res.count}")
    

    # Get count of opportunities updated in the last 60 minutes
    time_threshold = (datetime.utcnow() - timedelta(minutes=60)).isoformat()
    
    recent_count_res = supabase.table("research_opportunities") \
        .select("id", count="exact") \
        .gt("scraped_at", time_threshold) \
        .execute()
        
    print(f"Records updated in last 60m: {recent_count_res.count}")
    print(f"Records NOT updated in last 60m: {count_res.count - (recent_count_res.count or 0)}")

    recent_res = supabase.table("research_opportunities") \
        .select("id, title, scraped_at") \
        .gt("scraped_at", time_threshold) \
        .order("scraped_at", desc=True) \
        .limit(5) \
        .execute()
        
    print(f"\nSample of recently updated records:")
    for item in recent_res.data:
        print(f"- {item['title']} (Scraped at: {item['scraped_at']})")

if __name__ == "__main__":
    verify_recent_updates()

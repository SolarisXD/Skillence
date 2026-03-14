import asyncio
import requests
from bs4 import BeautifulSoup
import urllib.parse
import time

# Simple in-memory cache to avoid rate limits
_resource_cache = {}

async def fetch_topic_resources(topic_name: str, skill_category: str):
    """
    Fetch learning resources for a specific topic using DuckDuckGo search.
    """
    cache_key = f"{skill_category}::{topic_name}"
    
    # Re-enable cache
    if cache_key in _resource_cache:
        cache_entry = _resource_cache[cache_key]
        if time.time() - cache_entry["timestamp"] < 86400: # 24 hour cache
            return cache_entry["data"]

    # Create targeted queries for high-quality developer resources
    sites = ["site:geeksforgeeks.org", "site:developer.mozilla.org", "site:w3schools.com", "site:freecodecamp.org"]
    site_query = " OR ".join(sites)
    query = f"{topic_name} {skill_category} tutorial ({site_query})"
    
    resources = []
    
    try:
        loop = asyncio.get_event_loop()
        
        def do_search():
            req_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            response = requests.get(req_url, headers=headers, timeout=10)
            
            soup = BeautifulSoup(response.text, 'html.parser')
            results = soup.find_all('div', class_='result', limit=5)
            
            parsed_results = []
            for r in results:
                title_elem = r.find('a', class_='result__a')
                snippet_elem = r.find('a', class_='result__snippet')
                
                if title_elem and snippet_elem:
                    url = title_elem.get('href', '')
                    if url.startswith('//duckduckgo.com/l/?'): 
                        # Parse actual URL from duckduckgo redirect
                        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
                        if 'uddg' in parsed:
                            url = parsed['uddg'][0]

                    parsed_results.append({
                        "title": title_elem.text.strip(),
                        "href": url,
                        "body": snippet_elem.text.strip()
                    })
            return parsed_results

        results = await loop.run_in_executor(None, do_search)
        
        for r in results:
            title = r.get("title", "")
            url = r.get("href", "")
            body = r.get("body", "")
            
            # Identify source based on domain
            source = "Web Resource"
            if "geeksforgeeks.org" in url:
                source = "GeeksforGeeks"
            elif "developer.mozilla.org" in url or "mdn" in title.lower():
                source = "MDN Docs"
            elif "w3schools.com" in url:
                source = "W3Schools"
            elif "freecodecamp.org" in url:
                source = "freeCodeCamp"
            elif "dev.to" in url:
                source = "Dev.to"
            elif "medium.com" in url:
                source = "Medium"
                    
            resources.append({
                "title": title[:60] + "..." if len(title) > 60 else title,
                "description": body[:120] + "..." if len(body) > 120 else body,
                "url": url,
                "source": source
            })
            
        if not resources:
            resources.append({
                "title": f"Learn {topic_name}",
                "description": "Explore documentation and tutorials.",
                "url": f"https://www.google.com/search?q={topic_name.replace(' ', '+')}+{skill_category}",
                "source": "Search Engine"
            })
            
    except Exception as e:
        print(f"Error fetching resources for {topic_name}: {e}")
        # Return fallback items if search fails completely
        return [
            {
                "title": f"Learn {topic_name}",
                "description": "Explore documentation and tutorials.",
                "url": f"https://www.google.com/search?q={topic_name.replace(' ', '+')}+{skill_category}",
                "source": "Search Engine"
            }
        ]
        
    # cache results
    _resource_cache[cache_key] = {
        "timestamp": time.time(),
        "data": resources
    }

    return resources

"""YouTube Data API v3 service for fetching educational videos with caching."""
import os
import json
import time
import httpx
from typing import List, Dict, Optional

# In-memory cache: { query_key: { "data": [...], "timestamp": int } }
_cache: Dict[str, Dict] = {}
CACHE_TTL = 3600 * 6  # 6 hours

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos"


def _get_api_key() -> str:
    return os.getenv("YOUTUBE_API_KEY", "")


def _cache_key(skill_name: str) -> str:
    return f"yt_{skill_name.lower().strip()}"


async def fetch_youtube_videos(skill_name: str, max_results: int = 5) -> List[Dict]:
    """Fetch top educational YouTube videos for a given skill name."""
    key = _cache_key(skill_name)

    # Check cache
    if key in _cache:
        entry = _cache[key]
        if time.time() - entry["timestamp"] < CACHE_TTL:
            return entry["data"]

    api_key = _get_api_key()
    if not api_key:
        return []

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Step 1: Search for videos
            search_params = {
                "part": "snippet",
                "q": f"Learn {skill_name} tutorial course",
                "type": "video",
                "videoDuration": "medium",  # 4-20 minutes
                "order": "relevance",
                "maxResults": max_results * 2,  # fetch extra to filter
                "key": api_key,
                "relevanceLanguage": "en",
                "safeSearch": "strict",
            }
            search_resp = await client.get(YOUTUBE_API_URL, params=search_params)
            if search_resp.status_code != 200:
                return []

            search_data = search_resp.json()
            items = search_data.get("items", [])
            if not items:
                return []

            video_ids = [item["id"]["videoId"] for item in items if "videoId" in item.get("id", {})]
            if not video_ids:
                return []

            # Step 2: Get video details (duration, view count)
            details_params = {
                "part": "snippet,contentDetails,statistics",
                "id": ",".join(video_ids[:max_results * 2]),
                "key": api_key,
            }
            details_resp = await client.get(YOUTUBE_VIDEO_URL, params=details_params)
            if details_resp.status_code != 200:
                # Fallback to search results only
                results = []
                for item in items[:max_results]:
                    snippet = item.get("snippet", {})
                    results.append({
                        "title": snippet.get("title", ""),
                        "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                        "channel": snippet.get("channelTitle", ""),
                        "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                        "duration": "",
                        "view_count": "",
                        "published_at": snippet.get("publishedAt", "")[:10],
                    })
                _cache[key] = {"data": results, "timestamp": time.time()}
                return results

            details_data = details_resp.json()
            detail_items = details_data.get("items", [])

            # Build rich results
            results = []
            for vid in detail_items:
                snippet = vid.get("snippet", {})
                stats = vid.get("statistics", {})
                content = vid.get("contentDetails", {})

                view_count = int(stats.get("viewCount", 0))
                duration_iso = content.get("duration", "")

                # Parse ISO 8601 duration
                duration_str = _parse_duration(duration_iso)

                results.append({
                    "title": snippet.get("title", ""),
                    "url": f"https://www.youtube.com/watch?v={vid['id']}",
                    "channel": snippet.get("channelTitle", ""),
                    "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url",
                                 snippet.get("thumbnails", {}).get("medium", {}).get("url", "")),
                    "duration": duration_str,
                    "view_count": _format_views(view_count),
                    "published_at": snippet.get("publishedAt", "")[:10],
                    "_sort_score": view_count,
                })

            # Sort by view count and take top N
            results.sort(key=lambda x: x.get("_sort_score", 0), reverse=True)
            for r in results:
                r.pop("_sort_score", None)
            results = results[:max_results]

            _cache[key] = {"data": results, "timestamp": time.time()}
            return results

    except Exception as e:
        print(f"YouTube API error for '{skill_name}': {e}")
        return []


def _parse_duration(iso_duration: str) -> str:
    """Convert ISO 8601 duration (PT1H2M3S) to readable format."""
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration)
    if not match:
        return ""
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    if hours > 0:
        return f"{hours}h {minutes}m"
    elif minutes > 0:
        return f"{minutes}m {seconds}s"
    return f"{seconds}s"


def _format_views(count: int) -> str:
    """Format view count to readable string."""
    if count >= 1_000_000:
        return f"{count / 1_000_000:.1f}M views"
    elif count >= 1_000:
        return f"{count / 1_000:.1f}K views"
    return f"{count} views"

import asyncio
from app.services.resource_fetcher import fetch_topic_resources

async def test():
    results = await fetch_topic_resources("Variables", "Python")
    for r in results:
        print(f"[{r.get('source')}] {r.get('title')}\n{r.get('url')}\n")

asyncio.run(test())

Troubleshooting the Sarkari Result scraper

If the scraper falls back to sample data, the backend couldn't reach the target sites. Follow these steps locally to diagnose and (optionally) work around the issue.

1) Check DNS/network resolution
   - Open PowerShell and run:

     nslookup www.sarkariresult.com

   - If DNS fails, try resolving another site (e.g., google.com) to compare.

2) Test HTTP access with curl (PowerShell):

     curl -I https://www.sarkariresult.com -UseBasicParsing

   - Check the HTTP status or connection errors.

3) Try a simple Node.js request from the backend folder to see raw error:

     node -e "const https=require('https');https.get('https://www.sarkariresult.com',res=>console.log(res.statusCode),err=>console.error(err.message));"

4) If DNS or network is blocked (common on some networks):
   - Try switching networks (mobile hotspot) or using a VPN.
   - Use a proxy (set HTTP_PROXY / HTTPS_PROXY environment variables before starting the server).

5) If the site uses anti-bot protections, scraping from a local dev machine may still fail. Options:
   - Use a third-party API (SerpApi, ScraperAPI) for reliable scraping (paid).
   - Use official APIs or RSS feeds if available.

6) Logs: check backend terminal for logs like "Attempting to fetch from ..." and the exact error message. Share those logs when asking for help.

If you'd like, I can add optional proxy support to the scraper (respecting site terms) or integrate a paid scraping API.

Using free scraping proxy services (AllOrigins / Jina)
---------------------------------------------------
If your machine can't resolve or connect to the target site, you can try routing requests through a free scraping proxy. Two supported options are:

- AllOrigins (api.allorigins.win) - returns raw HTML via a simple URL wrapper
- Jina (r.jina.ai) - mirror that returns raw HTML for public pages

To enable a proxy for the scraper, set the environment variable `SCRAPER_API` before starting the backend. Example (PowerShell):

```powershell
# Use AllOrigins
$env:SCRAPER_API = 'allorigins'; npm start

# Use Jina
$env:SCRAPER_API = 'jina'; npm start
```

Notes:
- These free services are convenient for development but can be rate-limited or unreliable in production.
- If you need robust scraping, consider a paid provider (ScraperAPI, SerpApi) or an official API from the data provider.

Courses endpoint (Coursera + YouTube)
------------------------------------

The backend includes a simple course lookup endpoint which aggregates course/video results from Coursera and YouTube.

- Endpoint: GET /api/courses
- Query parameters:
   - query (required): search term, e.g. `python`, `react`, `machine learning`
   - provider (optional): `coursera`, `youtube`, or `all` (default: `all`)
   - limit (optional): max number of results per provider (default: 5)

Example:

```
GET /api/courses?query=python&provider=all&limit=5
```

Notes:
- YouTube results require a Google API key; set `YOUTUBE_API_KEY` in your environment (see `.env.example`).
- Coursera is called via their public course search endpoint; field availability can vary and results are best-effort mapped into a normalized JSON structure.
- If an external provider is unavailable the endpoint will return the successful provider results and log the error for the failing provider.


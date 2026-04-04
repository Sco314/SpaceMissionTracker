#!/usr/bin/env python3
"""
AROW Network Interception Script.

Loads NASA's AROW Unity WebGL page and intercepts all network requests
to discover if the Unity binary fetches telemetry data from a hidden
NASA JSON/WebSocket endpoint.

Usage:
    pip install playwright
    playwright install chromium
    python intercept_arow.py

If a telemetry endpoint is found, it will be printed and saved to
arow_endpoints.json for integration into the dashboard.
"""
import asyncio
import json
from datetime import datetime

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("Install playwright: pip install playwright && playwright install chromium")
    exit(1)

AROW_URL = "https://www.nasa.gov/missions/artemis-ii/arow/"
IGNORE_PATTERNS = ['.wasm', '.data', '.js', '.css', 'fonts', '.png', '.jpg',
                   '.ico', '.svg', '.woff', 'google', 'fontawesome', 'gtm',
                   'analytics', 'digitalgov']

async def intercept_arow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        captured = []
        interesting = []

        async def handle_request(request):
            url = request.url
            if not any(pat in url.lower() for pat in IGNORE_PATTERNS):
                print(f"[REQ] {request.method} {url}")
                captured.append({
                    "type": "request",
                    "method": request.method,
                    "url": url,
                    "timestamp": datetime.utcnow().isoformat(),
                })

        async def handle_response(response):
            url = response.url
            if not any(pat in url.lower() for pat in IGNORE_PATTERNS):
                content_type = response.headers.get('content-type', '')
                try:
                    body = await response.text()
                    entry = {
                        "type": "response",
                        "url": url,
                        "status": response.status,
                        "content_type": content_type,
                        "body_preview": body[:2000],
                        "body_length": len(body),
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                    captured.append(entry)

                    # Check if this looks like telemetry data
                    if any(kw in body.lower() for kw in
                           ['velocity', 'position', 'telemetry', 'vector',
                            'altitude', 'distance', 'orion', 'trajectory']):
                        print(f"\n*** TELEMETRY ENDPOINT FOUND ***")
                        print(f"    URL: {url}")
                        print(f"    Content-Type: {content_type}")
                        print(f"    Body preview: {body[:500]}")
                        interesting.append(entry)

                except Exception:
                    pass

        page.on("request", handle_request)
        page.on("response", handle_response)

        print(f"Loading AROW page: {AROW_URL}")
        print("Waiting 45 seconds for Unity to boot and fetch data...\n")

        await page.goto(AROW_URL)
        await asyncio.sleep(45)

        # Also probe Unity's window scope
        try:
            unity_probe = await page.evaluate("""() => {
                const keys = Object.keys(window).filter(k =>
                    k.toLowerCase().includes('unity') ||
                    k.toLowerCase().includes('orion') ||
                    k.toLowerCase().includes('telemetry') ||
                    k.toLowerCase().includes('artemis') ||
                    k.toLowerCase().includes('arow')
                );
                const canvas = document.getElementById('unity-canvas');
                return {
                    unityGlobals: keys,
                    canvasFound: !!canvas,
                    canvasWidth: canvas?.width,
                    canvasHeight: canvas?.height,
                };
            }""")
            print(f"\nUnity probe results: {json.dumps(unity_probe, indent=2)}")
        except Exception as e:
            print(f"Unity probe failed: {e}")

        await browser.close()

        # Save results
        output = {
            "scan_time": datetime.utcnow().isoformat(),
            "total_requests": len(captured),
            "interesting_endpoints": interesting,
            "all_captured": captured,
        }

        with open("arow_endpoints.json", "w") as f:
            json.dump(output, f, indent=2)

        print(f"\n{'='*60}")
        print(f"Total non-asset requests captured: {len(captured)}")
        print(f"Interesting telemetry endpoints: {len(interesting)}")
        print(f"Results saved to arow_endpoints.json")

        if interesting:
            print(f"\n*** JACKPOT! Found {len(interesting)} telemetry endpoint(s)! ***")
            for ep in interesting:
                print(f"  - {ep['url']}")
        else:
            print(f"\nNo obvious telemetry endpoints found.")
            print("AROW may use embedded ephemeris or internal NASA endpoints.")

        return output

if __name__ == "__main__":
    asyncio.run(intercept_arow())

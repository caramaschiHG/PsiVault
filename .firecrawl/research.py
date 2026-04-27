import requests
from bs4 import BeautifulSoup
import json
import re
import time
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

def search_ddg(query, max_results=5):
    """Search DuckDuckGo HTML version and return results"""
    url = 'https://html.duckduckgo.com/html/'
    params = {'q': query}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        results = []
        for r in soup.select('.result__a')[:max_results]:
            href = r.get('href')
            if href and href.startswith('http'):
                results.append({'title': r.get_text(strip=True), 'url': href})
        return results
    except Exception as e:
        print(f'DDG search error: {e}')
        return []

def fetch_article(url):
    """Fetch and extract article text"""
    try:
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        # Remove scripts, styles, nav, footer, ads
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form']):
            tag.decompose()
        # Try to find main content
        main = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile('content|article|post|entry'))
        if main:
            text = main.get_text(separator='\n', strip=True)
        else:
            text = soup.get_text(separator='\n', strip=True)
        # Clean up whitespace
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        text = '\n'.join(lines)
        return text[:15000]  # limit length
    except Exception as e:
        print(f'Fetch error for {url}: {e}')
        return ''

def save_results(name, results):
    os.makedirs('.firecrawl', exist_ok=True)
    path = f'.firecrawl/{name}.json'
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f'Saved {path}')

queries = {
    'ehr-usability': 'EHR EMR usability UX patterns mental health psychologists best practices',
    'clinical-notes': 'clinical note-taking UX design patterns electronic health records documentation',
    'dark-mode-healthcare': 'dark mode vs light mode healthcare software research study visual ergonomics',
    'accessibility-healthcare': 'WCAG accessibility healthcare apps electronic medical records usability',
    'calm-ux': 'calm UX slow software clinical settings healthcare interface focus anxiety',
    'micro-interactions': 'micro-interactions healthcare software UX feedback patterns nurses doctors',
    'therapy-software-mistakes': 'common UX mistakes practice management software therapists psychologists EHR',
}

for name, query in queries.items():
    print(f'\n=== Searching: {query} ===')
    results = search_ddg(query, max_results=5)
    articles = []
    for r in results:
        print(f"Fetching: {r['title'][:80]}... ({r['url']})")
        text = fetch_article(r['url'])
        if text:
            articles.append({'title': r['title'], 'url': r['url'], 'content': text})
        time.sleep(1.5)
    save_results(name, articles)
    print(f'Got {len(articles)} articles')

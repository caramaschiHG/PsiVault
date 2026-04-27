import requests
import json
import time
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'

def search_pmc(query, max_results=10):
    search_url = base + 'esearch.fcgi'
    params = {
        'db': 'pmc',
        'term': query,
        'retmode': 'json',
        'retmax': max_results,
        'sort': 'relevance'
    }
    r = requests.get(search_url, params=params, timeout=30)
    data = r.json()
    ids = data.get('esearchresult', {}).get('idlist', [])
    return ids

def fetch_summaries(ids):
    if not ids:
        return []
    summary_url = base + 'esummary.fcgi'
    params = {
        'db': 'pmc',
        'id': ','.join(ids),
        'retmode': 'json'
    }
    r = requests.get(summary_url, params=params, timeout=30)
    data = r.json()
    results = []
    for uid in ids:
        doc = data.get('result', {}).get(uid, {})
        results.append({
            'pmcid': f'PMC{uid}',
            'title': doc.get('title', ''),
            'authors': [a.get('name', '') for a in doc.get('authors', [])][:3],
            'source': doc.get('source', ''),
            'pubdate': doc.get('pubdate', ''),
        })
    return results

queries = [
    ('electronic health record usability', 'ehr-usability'),
    ('electronic health record documentation burden burnout', 'doc-burden'),
    ('EHR cognitive workload physicians', 'cognitive-workload'),
    ('health record visualization cognitive load', 'viz-cognitive'),
    ('clinical decision support alert fatigue', 'alert-fatigue'),
    ('mental health electronic record user experience', 'mental-health-ehr'),
    ('healthcare user interface design accessibility', 'healthcare-accessibility'),
]

all_results = {}
for q, name in queries:
    print(f'Searching: {q}')
    ids = search_pmc(q, max_results=8)
    print(f'  Found {len(ids)} IDs')
    if ids:
        summaries = fetch_summaries(ids)
        all_results[name] = summaries
        for a in summaries:
            print(f'  - {a["title"][:90]}')
    time.sleep(0.5)

os.makedirs('.firecrawl', exist_ok=True)
with open('.firecrawl/pubmed_results.json', 'w', encoding='utf-8') as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)
print('Saved pubmed_results.json')

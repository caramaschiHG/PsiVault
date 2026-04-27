import requests
import json
import time

# PubMed E-utilities search
def search_pubmed(query, max_results=10):
    base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'
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

def fetch_pmc_abstracts(ids):
    if not ids:
        return []
    base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'
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
            'pmcid': uid,
            'title': doc.get('title', ''),
            'authors': [a.get('name', '') for a in doc.get('authors', [])][:3],
            'source': doc.get('source', ''),
            'pubdate': doc.get('pubdate', ''),
        })
    return results

queries = [
    ('EHR usability user interface design', 'ehr-usability'),
    ('electronic health record clinical documentation burden', 'doc-burden'),
    ('health information technology cognitive workload physicians', 'cognitive-workload'),
    ('dark mode display polarity visual performance reading', 'dark-mode-research'),
    ('healthcare accessibility WCAG disability', 'accessibility-healthcare'),
    ('calm technology slow interface design anxiety', 'calm-tech'),
    ('clinical decision support alert fatigue', 'alert-fatigue'),
]

all_results = {}
for q, name in queries:
    print(f'Searching: {q}')
    ids = search_pubmed(q, max_results=8)
    print(f'  Found {len(ids)} IDs')
    if ids:
        abstracts = fetch_pmc_abstracts(ids)
        all_results[name] = abstracts
        for a in abstracts:
            print(f'  - {a["title"][:100]}...')
    time.sleep(0.5)

with open('.firecrawl/pubmed_results.json', 'w', encoding='utf-8') as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)
print('Saved pubmed_results.json')

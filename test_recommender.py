import os
import json
import re
import argparse
from pymongo import MongoClient
from dotenv import load_dotenv


def tokenize(text):
    if not text:
        return set()
    # normalize: replace non-alphanum with space, lowercase
    text = re.sub(r"[^0-9a-zA-Z]+", " ", text).lower()
    toks = {t for t in text.split() if len(t) > 1}
    return toks


def skill_name_tokens(skill_name):
    return tokenize(skill_name)


def load_profile(mongo_uri, user_id):
    client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True)
    db = client.skillence_db
    profile = db.profiles.find_one({'user_id': user_id})
    client.close()
    return profile


def extract_profile_tokens(profile):
    tokens = set()
    if not profile:
        return tokens
    pd = profile.get('profile_data') or profile.get('resume_data') or {}

    # career summary / about
    for key in ['careerSummary', 'career_summary', 'career_summary_text', 'career_summary_text']:
        if key in pd and pd.get(key):
            tokens |= tokenize(pd.get(key))

    # contact_info ignored
    # skills list (could be list of strings or categories)
    skills = pd.get('skills') or []
    if isinstance(skills, list):
        for s in skills:
            if isinstance(s, str):
                tokens |= tokenize(s)
            elif isinstance(s, dict):
                # skill categories: {category:..., skills:[..]}
                for v in s.get('skills', []):
                    tokens |= tokenize(v)

    # projects -> technologies and descriptions
    projects = pd.get('projects') or []
    for p in projects:
        if isinstance(p, dict):
            tokens |= tokenize(p.get('description') or p.get('name') or '')
            techs = p.get('technologies') or p.get('technologies', [])
            if isinstance(techs, list):
                for t in techs:
                    tokens |= tokenize(t)
            elif isinstance(techs, str):
                tokens |= tokenize(techs)

    # certifications, achievements, experience titles
    for arr_key in ['certifications', 'achievements', 'education', 'work_experience', 'experience']:
        arr = pd.get(arr_key) or []
        for item in arr:
            if isinstance(item, dict):
                for v in item.values():
                    if isinstance(v, str):
                        tokens |= tokenize(v)
            elif isinstance(item, str):
                tokens |= tokenize(item)

    # also include top-level parsing of raw text fields
    for k, v in pd.items():
        if isinstance(v, str):
            tokens |= tokenize(v)

    return tokens


def score_occupations(profile_tokens, jobs, top_k=10):
    results = []
    for job in jobs:
        req = job.get('required') or []
        opt = job.get('optional') or []

        # tokenized forms
        req_token_sets = [(s, skill_name_tokens(s)) for s in req]
        opt_token_sets = [(s, skill_name_tokens(s)) for s in opt]

        req_matches = 0
        req_matched_names = []
        for name, toks in req_token_sets:
            if toks & profile_tokens:
                req_matches += 1
                req_matched_names.append(name)

        opt_matches = 0
        opt_matched_names = []
        for name, toks in opt_token_sets:
            if toks & profile_tokens:
                opt_matches += 1
                opt_matched_names.append(name)

        req_score = req_matches / max(1, len(req))
        opt_score = opt_matches / max(1, len(opt)) if len(opt) > 0 else 0

        # weighted score
        score = 0.7 * req_score + 0.3 * opt_score

        results.append({
            'occupation_code': job.get('occupation_code'),
            'title': job.get('title'),
            'score': score,
            'required_matches': req_matched_names,
            'optional_matches': opt_matched_names,
            'req_count': len(req),
            'opt_count': len(opt)
        })

    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--user-id', required=True)
    parser.add_argument('--onet', default='onet_jobs.json')
    parser.add_argument('--top', type=int, default=10)
    args = parser.parse_args()

    load_dotenv()
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        print('MONGODB_URI not set in .env')
        return

    # load profile
    profile = load_profile(MONGODB_URI, args.user_id)
    if not profile:
        print('Profile not found for user', args.user_id)
        return

    profile_tokens = extract_profile_tokens(profile)
    print('Extracted profile tokens (sample):', list(profile_tokens)[:30])

    # load jobs
    if not os.path.exists(args.onet):
        print('onet jobs file not found at', args.onet)
        return
    with open(args.onet, 'r', encoding='utf-8') as f:
        jobs = json.load(f)

    results = score_occupations(profile_tokens, jobs, top_k=args.top)

    print('\nTop recommendations:')
    for i, r in enumerate(results, start=1):
        print(f"{i}. {r['title']} ({r['occupation_code']}) - score={r['score']:.3f}")
        print('   required matches:', r['required_matches'])
        print('   optional matches:', r['optional_matches'])
        print()


if __name__ == '__main__':
    main()

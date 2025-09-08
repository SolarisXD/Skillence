import os
import json
import re
import argparse
import google.generativeai as genai
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd


def setup_gemini():
    """Setup Gemini AI with API key"""
    load_dotenv()
    api_key = os.getenv('GEMINI_API')
    if api_key:
        genai.configure(api_key=api_key)
        return True
    return False


def tokenize(text):
    """Enhanced tokenization with better handling"""
    if not text:
        return set()
    # normalize: replace non-alphanum with space, lowercase
    text = re.sub(r"[^0-9a-zA-Z\+\#]+", " ", text).lower()
    toks = {t for t in text.split() if len(t) > 1}
    # Remove pure numbers and common noise
    toks = {t for t in toks if not t.isdigit() and len(t) > 2}
    return toks


def extract_technical_skills(profile):
    """Extract technical skills with enhanced priority"""
    tech_skills = set()
    
    if not profile:
        return tech_skills
    
    pd = profile.get('profile_data', {})
    
    # High priority: explicit technical skills
    skills = pd.get('skills', {})
    if isinstance(skills, dict):
        tech_list = skills.get('technical', [])
        if isinstance(tech_list, list):
            for skill in tech_list:
                tech_skills.add(skill.lower())
    
    # Extract from project descriptions - focus on technologies
    projects = pd.get('projects', [])
    for project in projects:
        if isinstance(project, dict):
            # Project name often contains tech stack
            name = project.get('name', '')
            tech_skills.update(tokenize(name))
            
            # Project description - extract technical terms
            desc = project.get('description', '')
            if desc:
                # Look for common patterns like API names, frameworks, etc.
                tech_patterns = re.findall(r'\b(?:API|ML|AI|TensorFlow|PyTorch|React|Node|Python|JavaScript|Azure|AWS|MongoDB|Flask|Docker|Kubernetes|Git|GitHub|SQL|NoSQL|REST|GraphQL|Express|Vue|Angular|Django|FastAPI|Pandas|NumPy|Scikit|OpenCV|BERT|GPT|Transformer|Neural|Machine Learning|Deep Learning|Computer Vision|Natural Language Processing|NLP|OCR|Database|Backend|Frontend|Full Stack|DevOps|Cloud|Microservices|Serverless)\b', desc, re.IGNORECASE)
                tech_skills.update([t.lower() for t in tech_patterns])
                
            # Technologies array if available
            techs = project.get('technologies', [])
            if isinstance(techs, list):
                for tech in techs:
                    tech_skills.add(tech.lower())
    
    # Extract from certifications - often contain technical terms
    certs = pd.get('certifications', [])
    for cert in certs:
        if isinstance(cert, dict):
            name = cert.get('name', '')
            tech_patterns = re.findall(r'\b(?:Python|Java|C\+\+|JavaScript|React|Angular|Vue|Node|Machine Learning|AI|Data Science|AWS|Azure|GCP|Docker|Kubernetes|MongoDB|SQL|Git|GitHub|TensorFlow|PyTorch|Scikit|Pandas|NumPy|Flask|Django|FastAPI|REST|API|Database|Cloud|DevOps|Agile|Scrum)\b', name, re.IGNORECASE)
            tech_skills.update([t.lower() for t in tech_patterns])
    
    return tech_skills


def extract_profile_tokens(profile):
    """Extract all profile tokens with enhanced categorization"""
    tech_skills = extract_technical_skills(profile)
    general_tokens = set()
    
    if not profile:
        return tech_skills, general_tokens
    
    pd = profile.get('profile_data', {})
    
    # Extract general tokens from other fields
    for key in ['achievements', 'education']:
        items = pd.get(key, [])
        for item in items:
            if isinstance(item, dict):
                for v in item.values():
                    if isinstance(v, str):
                        general_tokens.update(tokenize(v))
            elif isinstance(item, str):
                general_tokens.update(tokenize(item))
    
    # Remove overlap - prioritize technical skills
    general_tokens = general_tokens - tech_skills
    
    return tech_skills, general_tokens


def load_technology_skills(data_dir):
    """Load technology skills from O*NET data"""
    tech_file = os.path.join(data_dir, 'Technology Skills.xlsx')
    if not os.path.exists(tech_file):
        print(f"Warning: {tech_file} not found")
        return {}
    
    try:
        df = pd.read_excel(tech_file)
        tech_by_job = {}
        
        for _, row in df.iterrows():
            soc_code = row['O*NET-SOC Code']
            example = str(row.get('Example', '')).lower()
            commodity = str(row.get('Commodity Title', '')).lower()
            hot_tech = row.get('Hot Technology', 'N')
            
            if soc_code not in tech_by_job:
                tech_by_job[soc_code] = {'hot': [], 'regular': []}
            
            # Add both example and commodity title as technologies
            for tech in [example, commodity]:
                if tech and len(tech) > 3 and tech != 'nan':
                    if hot_tech == 'Y':
                        tech_by_job[soc_code]['hot'].append(tech)
                    else:
                        tech_by_job[soc_code]['regular'].append(tech)
        
        return tech_by_job
    except Exception as e:
        print(f"Error loading technology skills: {e}")
        return {}


def enhance_jobs_with_tech(jobs, tech_skills_by_job):
    """Enhance job data with technology skills"""
    for job in jobs:
        soc_code = job['occupation_code']
        if soc_code in tech_skills_by_job:
            job['hot_technologies'] = tech_skills_by_job[soc_code]['hot']
            job['technologies'] = tech_skills_by_job[soc_code]['regular']
        else:
            job['hot_technologies'] = []
            job['technologies'] = []
    return jobs


def filter_relevant_jobs(jobs, target_soc_prefixes=['15-', '17-']):
    """Filter jobs to only relevant technical categories"""
    filtered = []
    for job in jobs:
        soc_code = job['occupation_code']
        if any(soc_code.startswith(prefix) for prefix in target_soc_prefixes):
            filtered.append(job)
    return filtered


def calculate_tech_match_score(profile_tech_skills, job_tech_skills, hot_tech_skills):
    """Calculate technology matching score"""
    profile_set = set(profile_tech_skills)
    job_set = set(job_tech_skills)
    hot_set = set(hot_tech_skills)
    
    # Exact matches
    hot_matches = profile_set & hot_set
    regular_matches = profile_set & (job_set - hot_set)
    
    # Partial matches (contains)
    hot_partial = sum(1 for p in profile_set for h in hot_set if p in h or h in p)
    regular_partial = sum(1 for p in profile_set for j in (job_set - hot_set) if p in j or j in p)
    
    # Scoring: hot tech gets higher weight
    hot_score = len(hot_matches) * 3 + hot_partial * 1.5
    regular_score = len(regular_matches) * 2 + regular_partial * 1
    
    total_score = hot_score + regular_score
    
    return {
        'total_score': total_score,
        'hot_matches': list(hot_matches),
        'regular_matches': list(regular_matches),
        'hot_partial': hot_partial,
        'regular_partial': regular_partial
    }


def use_gemini_for_matching(profile_summary, job_title, job_skills, tech_skills):
    """Use Gemini AI to assess job-profile match"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = f"""
        Analyze how well this candidate profile matches the job position.

        Candidate Profile Summary:
        Technical Skills: {', '.join(tech_skills) if tech_skills else 'None specified'}
        Profile Summary: {profile_summary}

        Job Position:
        Title: {job_title}
        Required Skills: {', '.join(job_skills[:10])}  # Limit to first 10 skills
        Technologies: {', '.join(tech_skills[:5])}  # Limit to first 5 tech skills

        Rate the match on a scale of 0-10 where:
        - 0-3: Poor match (different field entirely)
        - 4-6: Moderate match (some transferable skills)
        - 7-8: Good match (strong skill alignment)
        - 9-10: Excellent match (perfect fit)

        Consider:
        1. Technical skill alignment
        2. Domain expertise relevance
        3. Experience level appropriateness

        Respond with only a number between 0-10.
        """
        
        response = model.generate_content(prompt)
        score_text = response.text.strip()
        
        # Extract numeric score
        score_match = re.search(r'(\d+(?:\.\d+)?)', score_text)
        if score_match:
            return float(score_match.group(1)) / 10.0  # Normalize to 0-1
        
    except Exception as e:
        print(f"Gemini API error: {e}")
    
    return 0.5  # Default neutral score


def score_occupations_enhanced(profile, jobs, top_k=10, use_ai=True):
    """Enhanced occupation scoring with multiple factors"""
    tech_skills, general_tokens = extract_profile_tokens(profile)
    
    # Create profile summary for AI
    pd = profile.get('profile_data', {})
    profile_summary = f"Technical skills: {list(tech_skills)[:10]}. Projects: {[p.get('name', '') for p in pd.get('projects', [])]}"
    
    results = []
    
    for job in jobs:
        # Traditional skill matching
        req = job.get('required', [])
        opt = job.get('optional', [])
        
        # Technology matching
        hot_tech = job.get('hot_technologies', [])
        regular_tech = job.get('technologies', [])
        
        tech_match = calculate_tech_match_score(tech_skills, regular_tech, hot_tech)
        
        # Traditional token matching
        req_token_sets = [(s, tokenize(s)) for s in req]
        opt_token_sets = [(s, tokenize(s)) for s in opt]
        
        all_profile_tokens = tech_skills | general_tokens
        
        req_matches = sum(1 for name, toks in req_token_sets if toks & all_profile_tokens)
        opt_matches = sum(1 for name, toks in opt_token_sets if toks & all_profile_tokens)
        
        req_score = req_matches / max(1, len(req))
        opt_score = opt_matches / max(1, len(opt)) if len(opt) > 0 else 0
        
        # Traditional weighted score
        traditional_score = 0.6 * req_score + 0.4 * opt_score
        
        # Technology score (normalized)
        tech_score = min(1.0, tech_match['total_score'] / 10.0)
        
        # AI-enhanced score
        ai_score = 0.5
        if use_ai and setup_gemini():
            ai_score = use_gemini_for_matching(
                profile_summary, 
                job['title'], 
                req + opt, 
                hot_tech + regular_tech
            )
        
        # Combined final score with heavy weight on technology and AI
        final_score = (
            0.3 * traditional_score +
            0.4 * tech_score +
            0.3 * ai_score
        )
        
        results.append({
            'occupation_code': job['occupation_code'],
            'title': job['title'],
            'score': final_score,
            'tech_score': tech_score,
            'traditional_score': traditional_score,
            'ai_score': ai_score,
            'tech_matches': tech_match,
            'required_matches': [name for name, toks in req_token_sets if toks & all_profile_tokens],
            'optional_matches': [name for name, toks in opt_token_sets if toks & all_profile_tokens],
            'hot_technologies': hot_tech[:5],  # Show first 5
            'technologies': regular_tech[:5]   # Show first 5
        })
    
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]


def load_profile(mongo_uri, user_id):
    """Load profile from MongoDB"""
    client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True)
    db = client.skillence_db
    profile = db.profiles.find_one({'user_id': user_id})
    client.close()
    return profile


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--user-id', required=True)
    parser.add_argument('--onet', default='backend/app/career_data/onet_occupations_data.json')
    parser.add_argument('--top', type=int, default=10)
    parser.add_argument('--data-dir', default='backend/app/career_data')
    parser.add_argument('--no-ai', action='store_true', help='Disable AI-enhanced scoring')
    args = parser.parse_args()

    load_dotenv()
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        print('MONGODB_URI not set in .env')
        return

    # Load profile
    profile = load_profile(MONGODB_URI, args.user_id)
    if not profile:
        print('Profile not found for user', args.user_id)
        return

    # Load jobs
    if not os.path.exists(args.onet):
        print('onet jobs file not found at', args.onet)
        return
    
    with open(args.onet, 'r', encoding='utf-8') as f:
        jobs = json.load(f)

    print(f"Loaded {len(jobs)} total occupations")

    # Load and enhance with technology skills
    tech_skills_by_job = load_technology_skills(args.data_dir)
    jobs = enhance_jobs_with_tech(jobs, tech_skills_by_job)
    
    # Filter to relevant technical jobs
    relevant_jobs = filter_relevant_jobs(jobs)
    print(f"Filtered to {len(relevant_jobs)} relevant technical occupations")

    # Extract profile information
    tech_skills, general_tokens = extract_profile_tokens(profile)
    print(f"Extracted {len(tech_skills)} technical skills:", list(tech_skills)[:10])
    
    # Score occupations
    use_ai = not args.no_ai
    results = score_occupations_enhanced(profile, relevant_jobs, top_k=args.top, use_ai=use_ai)

    print('\n' + '='*80)
    print('TOP JOB RECOMMENDATIONS')
    print('='*80)
    
    for i, r in enumerate(results, start=1):
        print(f"\n{i}. {r['title']} ({r['occupation_code']})")
        print(f"   Final Score: {r['score']:.3f} (Tech: {r['tech_score']:.3f}, Traditional: {r['traditional_score']:.3f}, AI: {r['ai_score']:.3f})")
        
        if r['tech_matches']['hot_matches']:
            print(f"   🔥 Hot Tech Matches: {', '.join(r['tech_matches']['hot_matches'])}")
        if r['tech_matches']['regular_matches']:
            print(f"   💻 Tech Matches: {', '.join(r['tech_matches']['regular_matches'])}")
        
        if r['required_matches']:
            print(f"   ✅ Required Skills: {', '.join(r['required_matches'][:5])}")
        
        if r['hot_technologies']:
            print(f"   🌟 Job Hot Technologies: {', '.join(r['hot_technologies'])}")


if __name__ == '__main__':
    main()

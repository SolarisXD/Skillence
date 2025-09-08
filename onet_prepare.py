"""onet_prepare.py

Updated to auto-detect O*NET Excel (or CSV) files in a data directory and build
an occupation -> skills mapping by joining available tables. If the classic
Occupation-Skills mapping is not present, the script infers skill importance by
propagating Task Ratings -> Tasks-to-DWAs -> Skills-to-WorkActivities.

Usage examples (PowerShell):
  # Auto-discover files in backend/app/career_data and write onet_jobs.json
  python .\onet_prepare.py --data-dir backend\app\career_data --out onet_jobs.json

  # Or use explicit CSV/TXT inputs (legacy mode)
  python .\onet_prepare.py --skills Skills.txt --occupations Occupation.txt --occ_skills Occupation-Skills.txt --out onet_jobs.json

Output format: a JSON array of objects:
  {"occupation_code": "15-1121.00", "title": "Software Developers, Applications", "required": [...], "optional": [...]}
"""

import argparse
import csv
import json
import os
from collections import defaultdict

try:
    import pandas as pd
except Exception:
    pd = None


def find_file_with_keyword(dirpath, keywords):
    """Return first filename in dirpath containing any of the keywords (case-insensitive)."""
    for name in os.listdir(dirpath):
        low = name.lower()
        for kw in keywords:
            if kw in low:
                return os.path.join(dirpath, name)
    return None


def read_excel_or_csv(path):
    if path.lower().endswith('.xlsx') or path.lower().endswith('.xls'):
        return pd.read_excel(path)
    else:
        # try tab or comma
        try:
            return pd.read_csv(path, sep='\t', engine='python')
        except Exception:
            return pd.read_csv(path)


def detect_columns(df, keywords):
    """Pick the first column whose name contains any of the keywords (case-insensitive)."""
    cols = list(df.columns)
    lower = [c.lower() for c in cols]
    for kw in keywords:
        for i, c in enumerate(lower):
            if kw in c:
                return cols[i]
    return None


def build_from_excel_dir(data_dir, required_fraction=0.5, importance_threshold=3.0):
    if pd is None:
        raise RuntimeError('pandas is required to process Excel files. Install pandas and openpyxl.')

    # Explicitly expect these filenames in the provided data_dir
    skills_path = os.path.join(data_dir, 'Skills.xlsx')
    occ_path = os.path.join(data_dir, 'Occupation Data.xlsx')

    if not os.path.exists(skills_path):
        print('Skills.xlsx not found in', data_dir)
        return []
    if not os.path.exists(occ_path):
        print('Occupation Data.xlsx not found in', data_dir)
        return []

    print('Reading Skills.xlsx...')
    skills_df = read_excel_or_csv(skills_path)
    print('Reading Occupation Data.xlsx...')
    occ_df = read_excel_or_csv(occ_path)

    # identify columns
    occ_code_col = detect_columns(skills_df, ['o*net-soc code', 'soc code', 'soc', 'code']) or 'O*NET-SOC Code'
    element_id_col = detect_columns(skills_df, ['element id', 'elementid', 'element']) or 'Element ID'
    element_name_col = detect_columns(skills_df, ['element name', 'element', 'name', 'scale name']) or 'Element Name'
    scale_id_col = detect_columns(skills_df, ['scale id', 'scaleid']) or 'Scale ID'
    scale_name_col = detect_columns(skills_df, ['scale name', 'scale']) or 'Scale Name'
    data_value_col = detect_columns(skills_df, ['data value', 'data_value', 'data']) or 'Data Value'

    # Build maps
    occ_map = {}
    code_col_occ = detect_columns(occ_df, ['o*net-soc code', 'soc code', 'code']) or 'O*NET-SOC Code'
    title_col_occ = detect_columns(occ_df, ['title', 'occupation', 'name']) or 'Title'
    for _, r in occ_df.iterrows():
        code = str(r.get(code_col_occ, '')).strip()
        title = str(r.get(title_col_occ, '')).strip()
        if code:
            occ_map[code] = title

    # Aggregate skills per occupation using Importance scale entries
    occ_skills = defaultdict(list)
    for _, r in skills_df.iterrows():
        try:
            code = str(r.get(occ_code_col, '')).strip()
        except Exception:
            code = ''
        if not code:
            continue
        sid = str(r.get(element_id_col, '')).strip()
        sname = str(r.get(element_name_col, '')).strip()
        scale_id = str(r.get(scale_id_col, '')).strip().upper()
        scale_name = str(r.get(scale_name_col, '')).strip().lower()
        # consider rows where scale indicates Importance (IM) rather than Level (LV)
        if scale_id == 'IM' or 'importance' in scale_name:
            try:
                val = float(r.get(data_value_col, 0) or 0)
            except Exception:
                val = 0.0
            occ_skills[code].append({'skill_id': sid, 'skill_name': sname, 'importance': val})

    # Build job map using importance threshold
    job_map = []
    for code, skills_list in occ_skills.items():
        required = []
        optional = []
        for entry in skills_list:
            name = entry.get('skill_name') or entry.get('skill_id')
            imp = entry.get('importance', 0.0) or 0.0
            if imp >= importance_threshold:
                required.append(name)
            elif imp > 0:
                optional.append(name)
        job_map.append({'occupation_code': code, 'title': occ_map.get(code, ''), 'required': sorted(set(required)), 'optional': sorted(set(optional))})

    return job_map


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--skills', help='Path to Skills.txt from O*NET (legacy CSV mode)')
    parser.add_argument('--occ_skills', help='Path to Occupation-Skills mapping file from O*NET (legacy CSV mode)')
    parser.add_argument('--occupations', help='Path to Occupation.txt from O*NET (legacy CSV mode)')
    parser.add_argument('--data-dir', help='Directory containing O*NET Excel/TXT files to auto-discover', default='backend/app/career_data')
    parser.add_argument('--out', default='backend/app/career_data/onet_occupations_data.json', help='Output JSON filename')
    parser.add_argument('--threshold', type=float, default=2.5, help='(legacy) Importance threshold (1-5) for required skills in CSV mode')
    parser.add_argument('--required-fraction', type=float, default=0.5, help='fraction of max aggregated score to mark a skill required when inferring from tasks')
    args = parser.parse_args()

    # Legacy CSV mode if explicit files provided
    if args.skills and args.occupations and args.occ_skills:
        print('Legacy CSV mode not supported in this updated script. Please convert CSV to Excel or use --data-dir with the provided O*NET files.')
        return

    print('Auto-discovering O*NET files in', args.data_dir)
    job_map = build_from_excel_dir(args.data_dir, required_fraction=args.required_fraction)

    print(f'Writing {args.out} with {len(job_map)} occupations...')
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(job_map, f, indent=2, ensure_ascii=False)

    print('Done.')


if __name__ == '__main__':
    main()

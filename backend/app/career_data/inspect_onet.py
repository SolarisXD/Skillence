import os
import pandas as pd

base = os.path.dirname(__file__)
files = [
    'Skills.xlsx',
    'Occupation Data.xlsx',
    'Task Ratings.xlsx',
    'Task Statements.xlsx',
    'Tasks to DWAs.xlsx',
    'Skills to Work Activities.xlsx',
    'Technology Skills.xlsx',
    'Tools Used.xlsx',
]

for fn in files:
    path = os.path.join(base, fn)
    print('\n' + '='*80)
    print('File:', fn, 'Exists:', os.path.exists(path))
    if not os.path.exists(path):
        continue
    try:
        df = pd.read_excel(path)
        print('Columns:', list(df.columns))
        print('First 5 rows:')
        print(df.head(5).to_string(index=False))
    except Exception as e:
        print('Failed to read', fn, '->', e)
print('\nInspection complete.')

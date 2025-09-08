import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URI = os.getenv('MONGODB_URI')
if not MONGODB_URI:
    print('MONGODB_URI not set in .env')
    exit(1)

client = MongoClient(MONGODB_URI, tlsAllowInvalidCertificates=True)
db = client.skillence_db

user_id = '68bc6276eb47e38d2ad9c5e3'
print('Querying profiles for user_id=', user_id)
profile = db.profiles.find_one({'user_id': user_id})
if not profile:
    print('No profile found')
else:
    # remove _id if present
    profile.pop('_id', None)
    import json
    print(json.dumps(profile, indent=2, default=str))

client.close()

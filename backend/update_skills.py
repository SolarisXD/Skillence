import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.data.skills_data import SKILLS_DATA

# Default courses and practices per category
category_defaults = {
    "Web Development": {
        "courses": [
            {"name": "The Web Developer Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/"},
            {"name": "CS50's Web Programming", "platform": "edX", "url": "https://www.edx.org/"}
        ],
        "practice": [
            {"name": "Frontend Mentor", "url": "https://www.frontendmentor.io/"},
            {"name": "HackerRank Web", "url": "https://www.hackerrank.com/"}
        ],
        "youtube": [
            {"title": "Web Development In 2024", "url": "https://www.youtube.com/watch?v=zJSY8tbf_ys"},
            {"title": "100+ Web Development Things you Should Know", "url": "https://www.youtube.com/watch?v=erEgovG9WBs"}
        ],
        "articles": [
            {"title": "MDN Web Docs", "url": "https://developer.mozilla.org/"},
            {"title": "CSS Tricks", "url": "https://css-tricks.com/"}
        ]
    },
    "Cloud & DevOps": {
        "courses": [
            {"name": "DevOps Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/"},
            {"name": "Docker & Kubernetes", "platform": "Coursera", "url": "https://www.coursera.org/"}
        ],
        "practice": [
            {"name": "KodeKloud", "url": "https://kodekloud.com/"},
            {"name": "Killercoda", "url": "https://killercoda.com/"}
        ],
        "youtube": [
            {"title": "DevOps Roadmap", "url": "https://www.youtube.com/watch?v=9pZ2xmsSDdo"},
            {"title": "What is DevOps?", "url": "https://www.youtube.com/watch?v=Xrgk023l4lI"}
        ],
        "articles": [
            {"title": "AWS Architecture Center", "url": "https://aws.amazon.com/architecture/"},
            {"title": "DevOps Practices", "url": "https://aws.amazon.com/devops/what-is-devops/"}
        ]
    },
    "AI & Data": {
        "courses": [
            {"name": "Machine Learning Specialization", "platform": "Coursera", "url": "https://www.coursera.org/specializations/machine-learning-introduction"}
        ],
        "practice": [
            {"name": "Kaggle", "url": "https://www.kaggle.com/"}
        ],
        "youtube": [
            {"title": "Machine Learning Roadmap", "url": "https://www.youtube.com/watch?v=pHIbE0e7ZLQ"}
        ],
        "articles": [
            {"title": "Towards Data Science", "url": "https://towardsdatascience.com/"}
        ]
    },
    "Programming": {
        "courses": [
            {"name": "100 Days of Code", "platform": "Udemy", "url": "https://www.udemy.com/course/100-days-of-code/"}
        ],
        "practice": [
            {"name": "LeetCode", "url": "https://leetcode.com/"}
        ],
        "youtube": [
            {"title": "How to Learn to Code", "url": "https://www.youtube.com/watch?v=k9WqpQp8OqA"}
        ],
        "articles": [
            {"title": "StackOverflow Developer Survey", "url": "https://survey.stackoverflow.co/"}
        ]
    },
    "Cybersecurity": {
        "courses": [
            {"name": "Complete Cyber Security Course", "platform": "Udemy", "url": "https://www.udemy.com/course/the-complete-internet-security-privacy-course-volume-1/"}
        ],
        "practice": [
            {"name": "Hack The Box", "url": "https://www.hackthebox.com/"}
        ],
        "youtube": [
            {"title": "Cybersecurity Roadmap", "url": "https://www.youtube.com/watch?v=z5nc984hR5Q"}
        ],
        "articles": [
            {"title": "OWASP Top Ten", "url": "https://owasp.org/www-project-top-ten/"}
        ]
    },
    "Mobile Development": {
        "courses": [
            {"name": "Complete Mobile App Dev", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "Exercism", "url": "https://exercism.org/"}
        ],
        "youtube": [
            {"title": "Mobile App Development Roadmap", "url": "https://www.youtube.com/watch?v=d_kXnE0d-3I"}
        ],
        "articles": [
            {"title": "Android Developer Guides", "url": "https://developer.android.com/guide"}
        ]
    }
}

for key, skill in SKILLS_DATA.items():
    if "certifications" in skill:
        del skill["certifications"]
    
    category = skill.get("category", "")
    defaults = category_defaults.get(category, category_defaults["Programming"])
    
    # Specific targeted content if available
    if key == "python":
        skill["youtube_videos"] = [
            {"title": "Python for Beginners - Full Course", "url": "https://www.youtube.com/watch?v=eWRfhZUzrAc"}
        ]
        skill["articles"] = [
            {"title": "Real Python Tutorials", "url": "https://realpython.com/"}
        ]
    elif key == "react":
        skill["youtube_videos"] = [
            {"title": "React Course - Beginner's Tutorial", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"}
        ]
        skill["articles"] = [
            {"title": "React Official Documentation", "url": "https://react.dev/"}
        ]
    elif key == "nodejs":
        skill["youtube_videos"] = [
            {"title": "Node.js Crash Course", "url": "https://www.youtube.com/watch?v=fBNz5xF-Kx4"}
        ]
        skill["articles"] = [
            {"title": "Node.js Guide", "url": "https://nodejs.org/en/docs/guides/"}
        ]
    else:
        if "youtube_videos" not in skill or not skill["youtube_videos"]:
            skill["youtube_videos"] = defaults["youtube"]
        if "articles" not in skill or not skill["articles"]:
            skill["articles"] = defaults["articles"]

    # Also make sure practice/courses are populated
    if not skill.get("courses"):
        skill["courses"] = defaults["courses"]
    if not skill.get("practice"):
        skill["practice"] = defaults["practice"]

dumped_dict = json.dumps(SKILLS_DATA, indent=4)
dumped_dict = dumped_dict.replace('null', 'None')
dumped_dict = dumped_dict.replace('true', 'True')
dumped_dict = dumped_dict.replace('false', 'False')

output_code = "from typing import List, Dict, Any\n\nSKILLS_DATA: Dict[str, Any] = " + dumped_dict + "\n"

with open('app/data/skills_data.py', 'w') as f:
    f.write(output_code)

print("success")

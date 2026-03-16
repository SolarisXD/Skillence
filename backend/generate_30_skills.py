import json

# List of 35 languages and technologies to include
languages = [
    ("python", "Python", "Programming", "Python is a high-level, interpreted, general-purpose programming language."),
    ("java", "Java", "Programming", "Java is a high-level, class-based, object-oriented programming language."),
    ("cpp", "C++", "Programming", "C++ is a general-purpose programming language created as an extension of the C programming language."),
    ("csharp", "C#", "Programming", "C# is a modern, object-oriented, and type-safe programming language."),
    ("rust", "Rust", "Programming", "Rust is a multi-paradigm, general-purpose programming language designed for performance and safety."),
    ("php", "PHP", "Web Development", "PHP is a general-purpose scripting language geared toward web development."),
    ("ruby", "Ruby", "Programming", "Ruby is an interpreted, high-level, general-purpose programming language."),
    ("swift", "Swift", "Mobile Development", "Swift is a powerful and intuitive programming language for iOS, iPadOS, macOS, tvOS, and watchOS."),
    ("go", "Go", "Programming", "Go is a statically typed, compiled programming language designed at Google."),
    ("kotlin", "Kotlin", "Mobile Development", "Kotlin is a cross-platform, statically typed, general-purpose programming language with type inference."),
    ("typescript", "TypeScript", "Web Development", "TypeScript is a free and open-source high-level programming language developed by Microsoft."),
    ("javascript", "JavaScript", "Web Development", "JavaScript is a programming language that is one of the core technologies of the World Wide Web."),
    ("dart", "Dart", "Mobile Development", "Dart is a programming language designed for client development, such as for the web and mobile apps."),
    ("scala", "Scala", "Programming", "Scala is a strong statically typed general-purpose programming language which supports both object-oriented programming and functional programming."),
    ("haskell", "Haskell", "Programming", "Haskell is a standardized, general-purpose, purely functional programming language with non-strict semantics and strong static typing."),
    ("r_lang", "R", "AI & Data", "R is a programming language for statistical computing and graphics."),
    ("perl", "Perl", "Programming", "Perl is a family of two high-level, general-purpose, interpreted, dynamic programming languages."),
    ("lua", "Lua", "Programming", "Lua is a lightweight, high-level, multi-paradigm programming language designed primarily for embedded use in applications."),
    ("objective_c", "Objective-C", "Mobile Development", "Objective-C is a general-purpose, object-oriented programming language that adds Smalltalk-style messaging to the C programming language."),
    ("matlab", "MATLAB", "AI & Data", "MATLAB is a proprietary multi-paradigm programming language and numeric computing environment."),
    ("groovy", "Groovy", "Programming", "Apache Groovy is a Java-syntax-compatible object-oriented programming language for the Java platform."),
    ("julia", "Julia", "AI & Data", "Julia is a high-level, high-performance, dynamic programming language."),
    ("elixir", "Elixir", "Programming", "Elixir is a dynamic, functional language designed for building scalable and maintainable applications."),
    ("clojure", "Clojure", "Programming", "Clojure is a dynamic and functional dialect of the Lisp programming language on the Java platform."),
    ("fsharp", "F#", "Programming", "F# is a general-purpose, strictly typed, functional-first, multi-paradigm programming language."),
    ("erlang", "Erlang", "Programming", "Erlang is a general-purpose, concurrent, functional programming language, and a garbage-collected runtime system."),
    ("sql", "SQL", "Database", "SQL is a domain-specific language used in programming and designed for managing data held in a relational database management system."),
    ("bash", "Bash", "DevOps", "Bash is a Unix shell and command language."),
    ("html", "HTML", "Web Development", "The HyperText Markup Language or HTML is the standard markup language for documents designed to be displayed in a web browser."),
    ("css", "CSS", "Web Development", "Cascading Style Sheets (CSS) is a style sheet language used for describing the presentation of a document written in HTML or XML."),
    ("react", "React", "Web Development", "React is a free and open-source front-end JavaScript library for building user interfaces based on UI components."),
    ("angular", "Angular", "Web Development", "Angular is a TypeScript-based free and open-source web application framework."),
    ("vue", "Vue", "Web Development", "Vue.js is an open-source model–view–viewmodel front end JavaScript framework for building user interfaces and single-page applications."),
    ("django", "Django", "Web Development", "Django is a free and open-source, Python-based web framework that follows the model–template–views architectural pattern."),
    ("spring_boot", "Spring Boot", "Web Development", "Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can 'just run'."),
]

image_urls = [
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=2574&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop",
]

generated_skills = {}

for idx, (lang_id, name, category, desc) in enumerate(languages):
    image_url = image_urls[idx % len(image_urls)]
    skill = {
        "id": lang_id,
        "name": name,
        "category": category,
        "description": desc,
        "overview": f"A comprehensive guide to {name}. Mastering {name} is crucial for {category.lower()} modern applications. Dive deep into the core concepts, syntax, and advanced features of {name} to elevate your engineering skills to the next level.",
        "image_url": image_url,
        "roadmap": [
            f"1. Basics of {name}",
            f"2. Object Oriented & Functional Paradigms in {name}",
            f"3. Data Structures & Algorithms using {name}",
            f"4. Building Projects with {name}",
            f"5. Advanced Concepts of {name}",
            f"6. Best Practices & System Design"
        ],
        "roadmap_url": f"https://roadmap.sh/{lang_id}",
        "youtube_videos": [
            {
                "title": f"{name} Full Course for Beginners",
                "url": f"https://www.youtube.com/results?search_query={name}+full+course"
            },
            {
                "title": f"Advanced {name} Concepts",
                "url": f"https://www.youtube.com/results?search_query=advanced+{name}"
            }
        ],
        "articles": [
            {
                "title": f"{name} Official Documentation",
                "url": f"https://www.google.com/search?q={name}+official+documentation"
            },
            {
                "title": f"{name} Best Practices on Medium",
                "url": f"https://medium.com/search?q={name}"
            }
        ],
        "courses": [
            {
                "name": f"The Complete {name} Bootcamp",
                "platform": "Udemy",
                "url": f"https://www.udemy.com/courses/search/?src=ukw&q={name}"
            },
            {
                "name": f"{name} Fundamentals",
                "platform": "Coursera",
                "url": f"https://www.coursera.org/search?query={name}"
            }
        ],
        "practice": [
            {
                "name": f"GeeksforGeeks {name} Tutorial",
                "url": f"https://www.geeksforgeeks.org/{lang_id}-tutorial/"
            },
            {
                "name": f"LeetCode {name} Problems",
                "url": f"https://leetcode.com/problemset/all/?search={name}"
            },
            {
                "name": f"HackerRank {name}",
                "url": f"https://www.hackerrank.com/domains/{lang_id}"
            }
        ]
    }
    
    # Custom specific overrides for accurate links
    if lang_id == "python":
        skill["practice"][0]["url"] = "https://www.geeksforgeeks.org/python-programming-language/"
    elif lang_id == "java":
        skill["practice"][0]["url"] = "https://www.geeksforgeeks.org/java/"
    elif lang_id == "cpp":
        skill["practice"][0]["url"] = "https://www.geeksforgeeks.org/c-plus-plus/"
    elif lang_id == "javascript":
        skill["practice"][0]["url"] = "https://www.geeksforgeeks.org/javascript/"
    
    generated_skills[lang_id] = skill


dumped_dict = json.dumps(generated_skills, indent=4)
# convert true/false/null depending on what's there
dumped_dict = dumped_dict.replace('null', 'None')
dumped_dict = dumped_dict.replace('true', 'True')
dumped_dict = dumped_dict.replace('false', 'False')

output_code = "from typing import List, Dict, Any\n\nSKILLS_DATA: Dict[str, Any] = " + dumped_dict + "\n"

with open('app/data/skills_data.py', 'w') as f:
    f.write(output_code)

print(f"Successfully wrote {len(generated_skills)} skills to skills_data.py!")

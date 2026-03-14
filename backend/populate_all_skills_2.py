import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def make_skill(id_str, name, category, desc, overview, image_url, phases, roadmap_url, videos, articles, courses, practice):
    return {
        "id": id_str,
        "name": name,
        "category": category,
        "description": desc,
        "overview": overview,
        "image_url": image_url,
        "roadmap": phases,
        "roadmap_url": roadmap_url,
        "youtube_videos": videos,
        "articles": articles,
        "courses": courses,
        "practice": practice
    }

def make_phase(phase_num, title, desc, time, topics):
    return {
        "phase": f"Phase {phase_num}: {title}",
        "description": desc,
        "estimated_time": time,
        "topics": topics
    }

def make_topic(t_id, name, resources):
    return {"id": t_id, "name": name, "resources": resources}

def make_res(title, url, type_str, source):
    return {"title": title, "url": url, "type": type_str, "source": source}

SKILLS = {}

# React
react_phases = [
    make_phase(1, "Foundations", "JSX and Components", "1-2 Weeks", [
        make_topic("jsx", "JSX & Rendering", [make_res("React Docs: Writing Markup", "https://react.dev/learn/writing-markup-with-jsx", "documentation", "React")]),
        make_topic("components", "Functional Components", [make_res("Your First Component", "https://react.dev/learn/your-first-component", "article", "React")])
    ]),
    make_phase(2, "Core Concepts", "State and Props", "2-3 Weeks", [
        make_topic("state", "useState Hook", [make_res("State: A Component's Memory", "https://react.dev/learn/state-a-components-memory", "documentation", "React")]),
        make_topic("props", "Passing Props", [make_res("Passing Props to a Component", "https://react.dev/learn/passing-props-to-a-component", "article", "React")])
    ]),
    make_phase(3, "Data Structures / Core Techniques", "Effects and Lifecycle", "2-3 Weeks", [
        make_topic("effects", "useEffect Hook", [make_res("Synchronizing with Effects", "https://react.dev/learn/synchronizing-with-effects", "documentation", "React")]),
        make_topic("refs", "Refs and DOM", [make_res("Manipulating the DOM with Refs", "https://react.dev/learn/manipulating-the-dom-with-refs", "article", "React")])
    ]),
    make_phase(4, "Advanced Topics", "Context, Styling, Routing", "3-5 Weeks", [
        make_topic("context", "Context API", [make_res("Passing Data Deeply with Context", "https://react.dev/learn/passing-data-deeply-with-context", "documentation", "React")]),
        make_topic("routing", "React Router", [make_res("React Router Docs", "https://reactrouter.com/", "documentation", "React Router")])
    ]),
    make_phase(5, "Real-World Projects & System Design", "Frameworks and Perf", "Ongoing", [
        make_topic("nextjs", "Next.js & SSR", [make_res("Next.js Tutorial", "https://nextjs.org/learn", "course", "Vercel")]),
        make_topic("perf", "Performance Optimization", [make_res("React Profiler", "https://react.dev/reference/react/Profiler", "documentation", "React")])
    ])
]

SKILLS["react"] = make_skill("react", "React", "Web Development", "Declarative, efficient frontend library.", "React utilizes a Virtual DOM for blazing-fast rendering and an ecosystem full of state-management libraries (Redux, Zustand).", "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop", react_phases, "https://roadmap.sh/react", [{"title": "React Course", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"}], [{"title": "React Docs", "url": "https://react.dev/"}], [{"name": "React Complete Guide", "platform": "Udemy", "url": "https://www.udemy.com/"}], [{"name": "Frontend Mentor", "url": "https://www.frontendmentor.io/"}])

# Python
python_phases = [
    make_phase(1, "Foundations", "Variables and Loops", "2-3 Weeks", [
        make_topic("py-basics", "Syntax, Lists, Dictionaries", [make_res("Python 3 Docs", "https://docs.python.org/3/tutorial/index.html", "documentation", "Python.org")]),
        make_topic("py-control", "Control Flow & Functions", [make_res("Real Python Functions", "https://realpython.com/defining-your-own-python-function/", "article", "Real Python")])
    ]),
    make_phase(2, "Core Concepts", "Classes & OOP", "3-4 Weeks", [
        make_topic("py-oop", "Object Oriented Programming", [make_res("OOP in Python 3", "https://realpython.com/python3-object-oriented-programming/", "article", "Real Python")]),
        make_topic("py-modules", "Modules and Packages", [make_res("Python Modules", "https://docs.python.org/3/tutorial/modules.html", "documentation", "Python.org")])
    ]),
    make_phase(3, "Data Structures / Core Techniques", "Generators, Contexts", "3-5 Weeks", [
        make_topic("py-adv", "Decorators & Generators", [make_res("Primer on Python Decorators", "https://realpython.com/primer-on-python-decorators/", "article", "Real Python")]),
        make_topic("py-iter", "Iterators & Context Managers", [make_res("Iterators in Python", "https://realpython.com/python-iterators-iterables/", "article", "Real Python")])
    ]),
    make_phase(4, "Advanced Topics", "Concurrency & Web", "4-6 Weeks", [
        make_topic("py-async", "AsyncIO & Threading", [make_res("Async IO in Python", "https://realpython.com/async-io-python/", "article", "Real Python")]),
        make_topic("py-web", "Frameworks (Django/FastAPI)", [make_res("FastAPI Docs", "https://fastapi.tiangolo.com/", "documentation", "Tiangolo")])
    ]),
    make_phase(5, "Real-World Projects & System Design", "AI & Data Science", "Ongoing", [
        make_topic("py-data", "Pandas & Numpy", [make_res("10 Minutes to pandas", "https://pandas.pydata.org/docs/user_guide/10min.html", "documentation", "Pandas")]),
        make_topic("py-ml", "Machine Learning Basics", [make_res("Scikit-Learn Tutorial", "https://scikit-learn.org/stable/tutorial/index.html", "documentation", "Scikit")])
    ])
]

SKILLS["python"] = make_skill("python", "Python", "Programming", "High-level, interpreted language.", "Python has become the undisputed king of Data Science, AI, and backend web development prototyping.", "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=2574&auto=format&fit=crop", python_phases, "https://roadmap.sh/python", [{"title": "Python for Beginners", "url": "https://www.youtube.com/watch?v=eWRfhZUzrAc"}], [{"title": "Real Python", "url": "https://realpython.com/"}], [{"name": "100 Days of Code", "platform": "Udemy", "url": "https://www.udemy.com/"}], [{"name": "LeetCode Python", "url": "https://leetcode.com/"}])

# Java
java_phases = [
    make_phase(1, "Foundations", "JVM and Basics", "2-3 Weeks", [
        make_topic("java-intro", "JVM, JRE, JDK", [make_res("Intro to Java", "https://dev.java/learn/", "documentation", "Oracle")]),
        make_topic("java-basics", "Primitive Types & Loops", [make_res("Java Basics", "https://www.baeldung.com/java-primitives", "article", "Baeldung")])
    ]),
    make_phase(2, "Core Concepts", "OOP and Interfaces", "3-5 Weeks", [
        make_topic("java-oop", "Classes, Inheritance, Polymorphism", [make_res("OOP Principles", "https://www.baeldung.com/java-oop", "article", "Baeldung")]),
        make_topic("java-interfaces", "Interfaces & Abstract Classes", [make_res("Java Interfaces", "https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html", "documentation", "Oracle")])
    ]),
    make_phase(3, "Data Structures / Core Techniques", "Collections", "3-4 Weeks", [
        make_topic("java-collections", "List, Set, Map", [make_res("Java Collections", "https://www.baeldung.com/java-collections", "article", "Baeldung")]),
        make_topic("java-generics", "Generics", [make_res("Generics in Java", "https://docs.oracle.com/javase/tutorial/java/generics/index.html", "documentation", "Oracle")])
    ]),
    make_phase(4, "Advanced Topics", "Concurrency & Streams", "4-6 Weeks", [
        make_topic("java-concurrency", "Threads & Executors", [make_res("Java Concurrency", "https://www.baeldung.com/java-concurrency", "article", "Baeldung")]),
        make_topic("java-streams", "Lambdas & Streams API", [make_res("Java 8 Streams", "https://www.baeldung.com/java-8-streams", "article", "Baeldung")])
    ]),
    make_phase(5, "Real-World Projects & System Design", "Spring Boot", "Ongoing", [
        make_topic("java-spring", "Spring Boot Framework", [make_res("Spring Boot Docs", "https://spring.io/projects/spring-boot", "documentation", "Spring")]),
        make_topic("java-hibernate", "JPA & Hibernate", [make_res("Hibernate ORM", "https://hibernate.org/orm/", "documentation", "Hibernate")])
    ])
]

SKILLS["java"] = make_skill("java", "Java", "Programming", "Enterprise-scale object oriented language.", "Java is the backbone of massive enterprise architectures, Android development, and large-scale data processing systems.", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop", java_phases, "https://roadmap.sh/java", [{"title": "Java Tutorial", "url": "https://www.youtube.com/watch?v=eIrMbAQSU34"}], [{"title": "Baeldung", "url": "https://www.baeldung.com/"}], [{"name": "Java Masterclass", "platform": "Udemy", "url": "https://www.udemy.com/"}], [{"name": "HackerRank Java", "url": "https://www.hackerrank.com/domains/java"}])

# Cyber Security
cyber_phases = [
    make_phase(1, "Foundations", "Networking and Admin", "4-6 Weeks", [
        make_topic("cs-net", "TCP/IP, OSI Model, DNS", [make_res("Networking Basics", "https://www.cisco.com/c/en/us/solutions/small-business/resource-center/networking/networking-basics.html", "article", "Cisco")]),
        make_topic("cs-os", "Linux Administration", [make_res("Linux Journey", "https://linuxjourney.com/", "practice", "LinuxJourney")])
    ]),
    make_phase(2, "Core Concepts", "Threats and Crypto", "4-8 Weeks", [
        make_topic("cs-threats", "Malware, Ransomware, Phishing", [make_res("Threat Landscape", "https://www.kaspersky.com/resource-center", "article", "Kaspersky")]),
        make_topic("cs-crypto", "Cryptography (Symmetric/Asymmetric)", [make_res("Applied Crypto", "https://crypto.stanford.edu/~dabo/cs255/", "course", "Stanford")])
    ]),
    make_phase(3, "Data Structures / Core Techniques", "Network Security", "5-7 Weeks", [
        make_topic("cs-firewalls", "Firewalls, IDS/IPS", [make_res("Palo Alto Networks", "https://www.paloaltonetworks.com/cyberpedia/what-is-a-firewall", "article", "Palo Alto")]),
        make_topic("cs-vuln", "Vulnerability Scanning", [make_res("Nmap Guide", "https://nmap.org/book/man.html", "documentation", "Nmap")])
    ]),
    make_phase(4, "Advanced Topics", "Pen-testing and AppSec", "6-10 Weeks", [
        make_topic("cs-pentest", "Penetration Testing (Metasploit)", [make_res("Metasploit Unleashed", "https://www.offensive-security.com/metasploit-unleashed/", "documentation", "OffSec")]),
        make_topic("cs-appsec", "OWASP Top 10 (SQLi, XSS)", [make_res("OWASP Top 10", "https://owasp.org/www-project-top-ten/", "article", "OWASP")])
    ]),
    make_phase(5, "Real-World Projects & System Design", "Socs and Risk", "Ongoing", [
        make_topic("cs-soc", "SOC Analyst & SIEM", [make_res("Splunk Enterprise", "https://www.splunk.com/", "documentation", "Splunk")]),
        make_topic("cs-risk", "Risk Management Frameworks", [make_res("NIST Cybersecurity Framework", "https://www.nist.gov/cyberframework", "documentation", "NIST")])
    ])
]

SKILLS["cyber_security"] = make_skill("cyber_security", "Cyber Security", "Cybersecurity", "Protect computers from digital attacks.", "Cyber security covers everything from Ethical Hacking, AppSec, and Penetration Testing to Risk Management.", "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670&auto=format&fit=crop", cyber_phases, "https://roadmap.sh/cyber-security", [{"title": "Cybersecurity Full Course", "url": "https://www.youtube.com/watch?v=U_P23SqJaDc"}], [{"title": "OWASP", "url": "https://owasp.org/"}], [{"name": "Security+ Cert", "platform": "Udemy", "url": "https://www.udemy.com/"}], [{"name": "TryHackMe", "url": "https://tryhackme.com/"}])

# C++
cpp_phases = [
    make_phase(1, "Foundations", "Basics & Pointers", "2-3 Weeks", [
        make_topic("cpp-basics", "Syntax, Loops, Arrays", [make_res("LearnCpp", "https://www.learncpp.com/", "documentation", "LearnCpp.com")]),
        make_topic("cpp-ptr", "Pointers and References", [make_res("Pointers in C++", "https://www.cplusplus.com/doc/tutorial/pointers/", "article", "cplusplus.com")])
    ]),
    make_phase(2, "Core Concepts", "OOP", "3-4 Weeks", [
        make_topic("cpp-oop", "Classes and Constructors", [make_res("C++ Classes", "https://en.cppreference.com/w/cpp/language/classes", "documentation", "cppreference")]),
        make_topic("cpp-poly", "Polymorphism & Virtual", [make_res("Virtual Functions", "https://www.geeksforgeeks.org/virtual-function-cpp/", "article", "GeeksforGeeks")])
    ]),
    make_phase(3, "Data Structures / Core Techniques", "Memory & STL", "4-6 Weeks", [
        make_topic("cpp-mem", "Dynamic Memory & Smart Pointers", [make_res("Smart Pointers", "https://learn.microsoft.com/en-us/cpp/cpp/smart-pointers-modern-cpp", "documentation", "Microsoft")]),
        make_topic("cpp-stl", "Standard Template Library", [make_res("STL Containers", "https://en.cppreference.com/w/cpp/container", "documentation", "cppreference")])
    ]),
    make_phase(4, "Advanced Topics", "Concurrency & Metaprogramming", "5-8 Weeks", [
        make_topic("cpp-conc", "Threading & Mutexes", [make_res("C++ Threading", "https://en.cppreference.com/w/cpp/thread", "documentation", "cppreference")]),
        make_topic("cpp-meta", "Templates & Metaprogramming", [make_res("C++ Templates", "https://en.cppreference.com/w/cpp/language/templates", "documentation", "cppreference")])
    ]),
    make_phase(5, "Real-World Projects & System Design", "Game Engines & Systems", "Ongoing", [
        make_topic("cpp-game", "Unreal Engine C++", [make_res("Unreal Docs", "https://docs.unrealengine.com/", "documentation", "Epic Games")]),
        make_topic("cpp-opt", "Low-Level Performance Optimization", [make_res("Optimizing C++", "https://agner.org/optimize/", "article", "Agner Fog")])
    ])
]

SKILLS["cpp"] = make_skill("cpp", "C++", "Programming", "Highly performant systems language.", "C++ provides developers with extensive control over system resources and memory allocation. Used in Unreal Engine and high frequency trading.", "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop", cpp_phases, "https://roadmap.sh/cpp", [{"title": "C++ Full Course", "url": "https://www.youtube.com/watch?v=vLnPwxZdW4Y"}], [{"title": "cppreference", "url": "https://en.cppreference.com/w/"}], [{"name": "Beginning C++", "platform": "Udemy", "url": "https://www.udemy.com/"}], [{"name": "LeetCode C++", "url": "https://leetcode.com/"}])

# Export Script logic
import os
import sys

def run_update():
    # Read the ORIGINAL dict
    try:
        from app.data.skills_data import SKILLS_DATA
        old_data = SKILLS_DATA
    except ImportError:
        old_data = {}

    import json
    
    # We update the keys we redefined here, leaving frontend & backend intact 
    # since they are already properly 5-phase. Wait, no, I'll just write them too manually or just fetch them from the old dict.
    for k, v in SKILLS.items():
        old_data[k] = v
        
    # Re-write the python file
    code = "from typing import List, Dict, Any\n\nSKILLS_DATA: Dict[str, Any] = " + json.dumps(old_data, indent=4).replace('null', 'None').replace('true', 'True').replace('false', 'False') + "\n"
    
    with open('app/data/skills_data.py', 'w') as f:
        f.write(code)
        
    print("Regenerated app/data/skills_data.py")
    
    # Mongo population
    import pymongo
    from pymongo import MongoClient
    from dotenv import load_dotenv

    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    
    try:
        client = MongoClient(mongo_uri)
        db = client["career_ai"]
        skills_col = db["skills"]
        skills_col.delete_many({})
        count = 0
        for skill_id, skill_data in old_data.items():
            skills_col.insert_one(skill_data)
            count += 1
        print(f"Populated {count} skills.")
    except Exception as e:
        print(f"Mongo Error: {e}")

if __name__ == "__main__":
    run_update()

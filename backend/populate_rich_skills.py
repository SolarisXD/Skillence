import json
import os
import sys
import pymongo
from pymongo import MongoClient
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def make_skill(id_str, name, category, desc, overview, image_url, phases, roadmap_url, videos, articles, courses, practice):
    return {
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
        "practice": practice,
        "prerequisites": [],
        "career_roles": [],
        "use_cases": []
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

# Define resources for frontend
fe_phases = [
    make_phase(1, "Internet & Foundations", "Understand the absolute basics of how the web works.", "1-2 Weeks", [
        make_topic("fe-internet", "How the Internet Works", [make_res("MDN: How the Web Works", "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works", "article", "MDN")])
    ]),
    make_phase(2, "HTML & CSS Core", "Learn to structure and style web pages properly.", "3-4 Weeks", [
        make_topic("fe-html", "Semantic HTML", [make_res("HTML Crash Course", "https://www.freecodecamp.org/news/html-crash-course/", "article", "freeCodeCamp")])
    ]),
    make_phase(3, "JavaScript Deep Dive", "Adding interactivity and logic to the browser.", "4-6 Weeks", [
        make_topic("fe-js", "ES6+ and DOM", [make_res("JavaScript Info", "https://javascript.info/", "documentation", "Ilya Kantor")])
    ]),
    make_phase(4, "Frontend Frameworks", "Learn industry-standard reactive frameworks like React/Vue.", "4-8 Weeks", [
        make_topic("fe-react", "React Fundamentals", [make_res("React Docs", "https://react.dev/", "documentation", "React")])
    ]),
    make_phase(5, "Advanced System Design", "Web Performance, CI/CD, and SSR (Next.js/Nuxt).", "Ongoing", [
        make_topic("fe-ssr", "Server Side Rendering", [make_res("Next.js Foundations", "https://nextjs.org/learn/foundations/about-nextjs", "documentation", "Vercel")])
    ])
]

# Define resources for backend
be_phases = [
    make_phase(1, "Internet & OS Basics", "Understand networking, OS, and terminal commands.", "2-3 Weeks", [
        make_topic("be-os", "OS and Terminal", [make_res("Linux Journey", "https://linuxjourney.com/", "practice", "LinuxJourney")])
    ]),
    make_phase(2, "Backend Languages", "Learn a server-side language (Python, Node, Go, Java).", "4-6 Weeks", [
        make_topic("be-lang", "Language Mastery", [make_res("Python standard library", "https://docs.python.org/3/", "documentation", "Python.org")])
    ]),
    make_phase(3, "Databases & ORMs", "Master Relational (SQL) and NoSQL databases.", "4-8 Weeks", [
        make_topic("be-sql", "SQL & Postgres", [make_res("PostgreSQL Tutorial", "https://www.postgresqltutorial.com/", "article", "Postgresqltutorial")])
    ]),
    make_phase(4, "APIs & Arch", "REST, GraphQL, microservices.", "4-6 Weeks", [
        make_topic("be-api", "REST APIs", [make_res("REST API Guidelines", "https://restfulapi.net/", "article", "REST API")])
    ]),
    make_phase(5, "Scale & Deployment", "Docker, Kubernetes, CI/CD.", "Ongoing", [
        make_topic("be-docker", "Containerization", [make_res("Docker Getting Started", "https://docs.docker.com/get-started/", "documentation", "Docker")])
    ])
]

# React
react_phases = [
    make_phase(1, "Foundations", "JSX and Components", "1-2 Weeks", [
        make_topic("react-jsx", "JSX & Rendering", [make_res("React Docs: Writing Markup", "https://react.dev/learn/writing-markup-with-jsx", "documentation", "React")])
    ]),
    make_phase(2, "Core Concepts", "State and Props", "2-3 Weeks", [
        make_topic("react-state", "useState Hook", [make_res("State: A Component's Memory", "https://react.dev/learn/state-a-components-memory", "documentation", "React")])
    ]),
    make_phase(3, "Effects", "Effects and Lifecycle", "2-3 Weeks", [
        make_topic("react-effects", "useEffect Hook", [make_res("Synchronizing with Effects", "https://react.dev/learn/synchronizing-with-effects", "documentation", "React")])
    ]),
    make_phase(4, "Advanced Topics", "Context, Styling, Routing", "3-5 Weeks", [
        make_topic("react-context", "Context API", [make_res("Passing Data Deeply with Context", "https://react.dev/learn/passing-data-deeply-with-context", "documentation", "React")])
    ]),
    make_phase(5, "Ecosystem", "Frameworks and Perf", "Ongoing", [
        make_topic("react-nextjs", "Next.js & SSR", [make_res("Next.js Tutorial", "https://nextjs.org/learn", "course", "Vercel")])
    ])
]

python_phases = [
    make_phase(1, "Foundations", "Variables and Loops", "2-3 Weeks", [make_topic("py-basics", "Syntax, Lists", [make_res("Python 3", "https://docs.python.org/3/tutorial/index.html", "documentation", "Python")])]),
    make_phase(2, "Core Concepts", "Classes & OOP", "3-4 Weeks", [make_topic("py-oop", "OOP", [make_res("OOP in Python", "https://realpython.com/python3-object-oriented-programming/", "article", "Real Python")])]),
    make_phase(3, "Data Structs", "Generators, Contexts", "3-5 Weeks", [make_topic("py-adv", "Generators", [make_res("Decorators", "https://realpython.com/primer-on-python-decorators/", "article", "Real Python")])]),
    make_phase(4, "Advanced", "Concurrency & Web", "4-6 Weeks", [make_topic("py-web", "Frameworks", [make_res("FastAPI", "https://fastapi.tiangolo.com/", "documentation", "Tiangolo")])]),
    make_phase(5, "Ecosystem", "AI & Data Science", "Ongoing", [make_topic("py-data", "Pandas", [make_res("Pandas", "https://pandas.pydata.org/", "documentation", "Pandas")])])
]

java_phases = [
    make_phase(1, "Foundations", "JVM and Basics", "2-3 Weeks", [make_topic("java-intro", "JVM", [make_res("Java", "https://dev.java/learn/", "documentation", "Oracle")])]),
    make_phase(2, "Core Concepts", "OOP and Interfaces", "3-5 Weeks", [make_topic("java-oop", "Classes", [make_res("OOP", "https://www.baeldung.com/java-oop", "article", "Baeldung")])]),
    make_phase(3, "Collections", "List, Set, Map", "3-4 Weeks", [make_topic("java-col", "Collections", [make_res("Java Maps", "https://www.baeldung.com/java-collections", "article", "Baeldung")])]),
    make_phase(4, "Advanced", "Concurrency & Streams", "4-6 Weeks", [make_topic("java-stream", "Streams", [make_res("Java 8 Streams", "https://www.baeldung.com/java-8-streams", "article", "Baeldung")])]),
    make_phase(5, "Ecosystem", "Spring Boot", "Ongoing", [make_topic("java-spring", "Spring", [make_res("Spring Boot Docs", "https://spring.io/projects/spring-boot", "documentation", "Spring")])])
]

cyber_phases = [
    make_phase(1, "Foundations", "Networking", "4-6 Weeks", [make_topic("cs-net", "TCP/IP", [make_res("Network Basics", "https://www.cisco.com/", "article", "Cisco")])]),
    make_phase(2, "Core Concepts", "Threats", "4-8 Weeks", [make_topic("cs-threats", "Malware", [make_res("Threat Landscape", "https://www.kaspersky.com/", "article", "Kaspersky")])]),
    make_phase(3, "Security", "Network Security", "5-7 Weeks", [make_topic("cs-fw", "Firewalls", [make_res("Nmap Guide", "https://nmap.org/", "documentation", "Nmap")])]),
    make_phase(4, "Advanced", "Pen-testing", "6-10 Weeks", [make_topic("cs-pen", "Penetration Testing", [make_res("OWASP Top 10", "https://owasp.org/", "article", "OWASP")])]),
    make_phase(5, "Ecosystem", "Socs", "Ongoing", [make_topic("cs-soc", "SOC Analyst", [make_res("Splunk", "https://www.splunk.com/", "documentation", "Splunk")])])
]

cpp_phases = [
    make_phase(1, "Foundations", "Basics & Pointers", "2-3 Weeks", [make_topic("cpp-basics", "Syntax, Loops", [make_res("LearnCpp", "https://www.learncpp.com/", "documentation", "LearnCpp.com")])]),
    make_phase(2, "Core Concepts", "OOP", "3-4 Weeks", [make_topic("cpp-oop", "Classes", [make_res("C++ Classes", "https://en.cppreference.com/w/cpp/language/classes", "documentation", "cppreference")])]),
    make_phase(3, "Techniques", "Memory & STL", "4-6 Weeks", [make_topic("cpp-stl", "STL", [make_res("STL Containers", "https://en.cppreference.com/w/", "documentation", "cppreference")])]),
    make_phase(4, "Advanced", "Concurrency", "5-8 Weeks", [make_topic("cpp-conc", "Threading", [make_res("C++ Threading", "https://en.cppreference.com/w/cpp/thread", "documentation", "cppreference")])]),
    make_phase(5, "Ecosystem", "Game Engines", "Ongoing", [make_topic("cpp-game", "Unreal Engine", [make_res("Unreal Docs", "https://docs.unrealengine.com/", "documentation", "Epic")])])
]

csharp_phases = [
    make_phase(1, "Foundations", "Basics", "2-3 Weeks", [make_topic("cs-basics", "Syntax", [make_res("C# Docs", "https://learn.microsoft.com/en-us/dotnet/csharp/", "documentation", "Microsoft")])]),
    make_phase(2, "Core Concepts", "OOP", "2-4 Weeks", [make_topic("cs-oop", "Classes", [make_res("OOP in C#", "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/", "article", "Microsoft")])]),
    make_phase(3, "Techniques", "LINQ", "3-4 Weeks", [make_topic("cs-linq", "LINQ Queries", [make_res("LINQ", "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", "documentation", "Microsoft")])]),
    make_phase(4, "Advanced", "Async", "3-5 Weeks", [make_topic("cs-async", "Async/Await", [make_res("Async Programming", "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/", "article", "Microsoft")])]),
    make_phase(5, "Ecosystem", ".NET & Unity", "Ongoing", [make_topic("cs-net", ".NET Core", [make_res(".NET Guides", "https://dotnet.microsoft.com/learn", "course", "Microsoft")])])
]

rust_phases = [
    make_phase(1, "Foundations", "Ownership", "3-4 Weeks", [make_topic("rust-basics", "The Book", [make_res("Rust Book", "https://doc.rust-lang.org/book/", "documentation", "Rust Lang")])]),
    make_phase(2, "Core Concepts", "Structs & Enums", "3-4 Weeks", [make_topic("rust-struct", "Data Types", [make_res("Rust Enums", "https://doc.rust-lang.org/book/ch06-00-enums.html", "article", "Rust")])]),
    make_phase(3, "Techniques", "Lifetimes", "4-6 Weeks", [make_topic("rust-life", "Lifetimes", [make_res("Validating References", "https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html", "article", "Rust")])]),
    make_phase(4, "Advanced", "Concurrency", "4-6 Weeks", [make_topic("rust-conc", "Fearless Concurrency", [make_res("Threads", "https://doc.rust-lang.org/book/ch16-00-concurrency.html", "article", "Rust")])]),
    make_phase(5, "Ecosystem", "WebAssembly", "Ongoing", [make_topic("rust-wasm", "WASM", [make_res("Rust WASM", "https://rustwasm.github.io/docs/book/", "documentation", "RustWasm")])])
]

php_phases = [
    make_phase(1, "Foundations", "Basics", "1-2 Weeks", [make_topic("php-basics", "Syntax", [make_res("PHP Docs", "https://www.php.net/manual/en/", "documentation", "PHP")])]),
    make_phase(2, "Core Concepts", "OOP", "2-3 Weeks", [make_topic("php-oop", "Classes", [make_res("PHP OOP", "https://www.php.net/manual/en/language.oop5.php", "article", "PHP")])]),
    make_phase(3, "Techniques", "Databases", "3-4 Weeks", [make_topic("php-db", "PDO", [make_res("PHP Data Objects", "https://www.php.net/manual/en/book.pdo.php", "article", "PHP")])]),
    make_phase(4, "Advanced", "Security", "3-5 Weeks", [make_topic("php-sec", "Sanitization", [make_res("PHP Security", "https://phptherightway.com/#security", "article", "PHP The Right Way")])]),
    make_phase(5, "Ecosystem", "Laravel", "Ongoing", [make_topic("php-laravel", "Laravel", [make_res("Laravel Docs", "https://laravel.com/docs", "documentation", "Laravel")])])
]

ruby_phases = [
    make_phase(1, "Foundations", "Basics", "1-2 Weeks", [make_topic("ruby-basics", "Syntax", [make_res("Ruby Docs", "https://www.ruby-lang.org/en/documentation/", "documentation", "Ruby")])]),
    make_phase(2, "Core Concepts", "OOP", "2-3 Weeks", [make_topic("ruby-oop", "Classes", [make_res("Ruby OOP", "https://rubymonk.com/", "article", "RubyMonk")])]),
    make_phase(3, "Techniques", "Blocks", "2-4 Weeks", [make_topic("ruby-blocks", "Blocks & Procs", [make_res("Ruby Blocks", "https://www.rubyguides.com/2016/02/ruby-procs-and-lambdas/", "article", "Ruby Guides")])]),
    make_phase(4, "Advanced", "Metaprogramming", "3-5 Weeks", [make_topic("ruby-meta", "Metaprogramming", [make_res("Metaprogramming Ruby", "https://rubymonk.com/learning/books/2-metaprogramming-ruby", "article", "RubyMonk")])]),
    make_phase(5, "Ecosystem", "Rails", "Ongoing", [make_topic("ruby-rails", "Ruby on Rails", [make_res("Rails Guides", "https://guides.rubyonrails.org/", "documentation", "Rails")])])
]

swift_phases = [
    make_phase(1, "Foundations", "Basics", "2-3 Weeks", [make_topic("swift-basics", "Syntax", [make_res("Swift.org", "https://www.swift.org/documentation/", "documentation", "Swift")])]),
    make_phase(2, "Core Concepts", "Optionals", "2-4 Weeks", [make_topic("swift-opt", "Optionals", [make_res("Optionals Guide", "https://docs.swift.org/swift-book/LanguageGuide/TheBasics.html", "article", "Apple")])]),
    make_phase(3, "Techniques", "Protocols", "3-5 Weeks", [make_topic("swift-proto", "Protocols", [make_res("Protocols", "https://docs.swift.org/swift-book/LanguageGuide/Protocols.html", "article", "Apple")])]),
    make_phase(4, "Advanced", "Concurrency", "4-6 Weeks", [make_topic("swift-async", "Async/Await", [make_res("Concurrency", "https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html", "article", "Apple")])]),
    make_phase(5, "Ecosystem", "SwiftUI", "Ongoing", [make_topic("swift-ui", "SwiftUI", [make_res("SwiftUI Tutorials", "https://developer.apple.com/tutorials/swiftui/", "course", "Apple")])])
]


NEW_SKILLS_DATA = {
    "frontend": make_skill(
        "frontend", "Frontend Development", "Web Development", "Build beautiful user interfaces.", 
        "Frontend focuses on constructing the visual aspects of web applications, ensuring a seamless user experience.",
        "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2670&auto=format&fit=crop", 
        fe_phases, "https://roadmap.sh/frontend", [], [], [], []
    ),
    "backend": make_skill(
        "backend", "Backend Development", "Web Development", "Power applications with server-side logic.",
        "Backend powers the application architecture, APIs, authentication, and fast data querying behind the scenes.",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
        be_phases, "https://roadmap.sh/backend", [], [], [], []
    ),
    "react": make_skill("react", "React", "Web Development", "Declarative UI Framework.", "Virtual DOM rendering for complex applications.", "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670", react_phases, "https://roadmap.sh/react", [], [], [], []),
    "python": make_skill("python", "Python", "Programming", "High level scripted programming.", "Number one for Data Science and versatile.", "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=2574", python_phases, "https://roadmap.sh/python", [], [], [], []),
    "java": make_skill("java", "Java", "Programming", "Enterprise class OOP.", "Run anywhere with the JVM.", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670", java_phases, "https://roadmap.sh/java", [], [], [], []),
    "cyber_security": make_skill("cyber_security", "Cyber Security", "Cybersecurity", "Network defense and hacking.", "Pen-testing, AppSec, Risk Assessment.", "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670", cyber_phases, "https://roadmap.sh/cyber-security", [], [], [], []),
    "cpp": make_skill("cpp", "C++", "Programming", "Highly performant systems.", "Used in Game development and finance.", "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670", cpp_phases, "https://roadmap.sh/cpp", [], [], [], []),
    "csharp": make_skill("csharp", "C#", "Programming", "Microsoft's .NET language.", "Enterprise Web APIs and Unity Game Dev.", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670", csharp_phases, "", [], [], [], []),
    "rust": make_skill("rust", "Rust", "Programming", "Memory safety and low latency.", "System toolings, WASM, and Web Servers.", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670", rust_phases, "", [], [], [], []),
    "php": make_skill("php", "PHP", "Programming", "The web's most popular backend.", "Powers WordPress and server-rendered tools.", "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2670", php_phases, "", [], [], [], []),
    "ruby": make_skill("ruby", "Ruby", "Programming", "Developer happiness first.", "Known for the famous Ruby on Rails.", "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670", ruby_phases, "", [], [], [], []),
    "swift": make_skill("swift", "Swift", "Programming", "Apple's UI language.", "The undisputed champion for iOS development.", "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=2574", swift_phases, "", [], [], [], [])
}

def populate_database(db_url):
    client = MongoClient(db_url)
    db = client.career_ai
    skills_collection = db.skills
    result = skills_collection.delete_many({})
    print(f"Cleared {result.deleted_count} existing skills from database.")

    for skill_id, skill_data in NEW_SKILLS_DATA.items():
        skills_collection.insert_one(skill_data)
        print(f"Successfully inserted detailed skill: {skill_data['name']}")

if __name__ == "__main__":
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    print(f"Connecting to MongoDB at: {mongo_uri}")
    populate_database(mongo_uri)

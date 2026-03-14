import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

NEW_SKILLS_DATA = {
    "frontend": {
        "id": "frontend",
        "name": "Frontend Development",
        "category": "Web Development",
        "description": "Step by step guide to becoming a modern frontend developer. Learn how to build user interfaces, handle state management, and create engaging web applications.",
        "overview": "Frontend development handles the visual and interactive aspects of a website that users interact with. Modern frontend development requires proficiency in HTML, CSS, and JavaScript, along with expertise in component-based frameworks like React, Vue, or Angular. You must also understand web performance, accessibility metrics, responsive design, and CSS architecture to build scalable single-page applications.",
        "image_url": "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2564&auto=format&fit=crop",
        "roadmap": [
            "1. Internet Basics",
            "2. HTML, CSS, JavaScript",
            "3. Version Control Systems",
            "4. Web Security Knowledge",
            "5. Package Managers (npm, yarn)",
            "6. CSS Architecture",
            "7. Frameworks (React, Vue, Angular)"
        ],
        "roadmap_url": "https://roadmap.sh/frontend",
        "youtube_videos": [
            {"title": "Web Development In 2024 - A Practical Guide", "url": "https://www.youtube.com/watch?v=zJSY8tbf_ys"},
            {"title": "100+ Web Development Things you Should Know", "url": "https://www.youtube.com/watch?v=erEgovG9WBs"}
        ],
        "articles": [
            {"title": "MDN Web Docs", "url": "https://developer.mozilla.org/"},
            {"title": "CSS Tricks", "url": "https://css-tricks.com/"}
        ],
        "courses": [
            {"name": "The Web Developer Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/"},
            {"name": "CS50's Web Programming", "platform": "edX", "url": "https://www.edx.org/"}
        ],
        "practice": [
            {"name": "Frontend Mentor", "url": "https://www.frontendmentor.io/"},
            {"name": "HackerRank Web", "url": "https://www.hackerrank.com/"}
        ]
    },
    "backend": {
        "id": "backend",
        "name": "Backend Development",
        "category": "Web Development",
        "description": "Step by step guide to becoming a modern backend developer. Learn how to build scalable APIs, handle databases, and implement server-side logic securely.",
        "overview": "Backend development focuses on the server, databases, and application logic behind the scenes. It involves choosing languages like Python, Java, Node.js, or Go to build performant and secure APIs (REST, GraphQL, gRPC). Backend engineers also deal with database schema design (SQL vs NoSQL), caching strategies (Redis), message brokers (RabbitMQ/Kafka), and cloud deployment environments to ensure the system can handle large amounts of traffic efficiently.",
        "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "1. Internet and OS Basics",
            "2. Pick a Language (Python, Go, Node.js, Java)",
            "3. Relational Codebases & SQL",
            "4. APIs (REST, GraphQL, gRPC)",
            "5. Caching and Security",
            "6. CI/CD and Docker",
            "7. Message Brokers"
        ],
        "roadmap_url": "https://roadmap.sh/backend",
        "youtube_videos": [
            {"title": "Backend Web Development - A Complete Overview", "url": "https://www.youtube.com/watch?v=XBu54ncjgus"},
            {"title": "APIs for Beginners", "url": "https://www.youtube.com/watch?v=GZvSYJDk-us"}
        ],
        "articles": [
            {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer"},
            {"title": "REST API Best Practices", "url": "https://restfulapi.net/"}
        ],
        "courses": [
            {"name": "Backend Development and APIs", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/"},
            {"name": "Complete Node.js Developer", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "LeetCode Backend System Design", "url": "https://leetcode.com/discuss/interview-question/system-design"},
            {"name": "HackerRank SQL", "url": "https://www.hackerrank.com/domains/sql"}
        ]
    },
    "react": {
        "id": "react",
        "name": "React",
        "category": "Web Development",
        "description": "React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.",
        "overview": "Maintained by Meta, React is the most popular frontend framework for modern web applications. It utilizes a Virtual DOM for blazing-fast rendering and an ecosystem full of state-management libraries (Redux, Zustand) and routing solutions (React Router, Next.js). Mastering React involves deeply understanding component lifecycles, functional hooks, context API, and advanced performance optimization techniques.",
        "image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "1. JSX and Components",
            "2. Props vs State",
            "3. Component Lifecycle and Hooks",
            "4. Routing (React Router)",
            "5. Context API & State Management",
            "6. React Ecosystem (Next.js)"
        ],
        "roadmap_url": "https://roadmap.sh/react",
        "youtube_videos": [
            {"title": "React Course - Beginner's Tutorial", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"},
            {"title": "Learn React In 30 Minutes", "url": "https://www.youtube.com/watch?v=hQAHSlTtcmY"}
        ],
        "articles": [
            {"title": "React Official Documentation", "url": "https://react.dev/"},
            {"title": "Overreacted by Dan Abramov", "url": "https://overreacted.io/"}
        ],
        "courses": [
            {"name": "React - The Complete Guide", "platform": "Udemy", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"},
            {"name": "Epic React", "platform": "EpicWeb", "url": "https://epicreact.dev/"}
        ],
        "practice": [
            {"name": "Frontend Mentor", "url": "https://www.frontendmentor.io/"},
            {"name": "CodeSandbox React Templates", "url": "https://codesandbox.io/"}
        ]
    },
    "python": {
        "id": "python",
        "name": "Python",
        "category": "Programming",
        "description": "Python is a high-level, interpreted, general-purpose programming language widely known for its extremely clean code readability.",
        "overview": "Python has become the undisputed king of Data Science, Artificial Intelligence, and highly rapid web development prototyping (via Django and FastAPI). Its extensive standard library and massive open-source ecosystem (PyPI) provide instant solutions for almost any domain, including system administration scripting, statistical modeling, and 3D graphics generation.",
        "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=2574&auto=format&fit=crop",
        "roadmap": [
            "1. Syntax Basics & Data Types",
            "2. Data Structures",
            "3. Object-Oriented Programming",
            "4. Advanced (Decorators, Generators)",
            "5. Memory Management",
            "6. Package Managers (pip, poetry)"
        ],
        "roadmap_url": "https://roadmap.sh/python",
        "youtube_videos": [
            {"title": "Python for Beginners - Full Course", "url": "https://www.youtube.com/watch?v=eWRfhZUzrAc"},
            {"title": "Advanced Python in 1 Hour", "url": "https://www.youtube.com/watch?v=vVj_0yX-x8w"}
        ],
        "articles": [
            {"title": "Real Python Tutorials", "url": "https://realpython.com/"},
            {"title": "The Hitchhiker's Guide to Python", "url": "https://docs.python-guide.org/"}
        ],
        "courses": [
            {"name": "100 Days of Code: Python Pro", "platform": "Udemy", "url": "https://www.udemy.com/course/100-days-of-code/"},
            {"name": "Python for Everybody", "platform": "Coursera", "url": "https://www.coursera.org/"}
        ],
        "practice": [
            {"name": "LeetCode Python", "url": "https://leetcode.com/studyplan/programming-skills/"},
            {"name": "HackerRank Python", "url": "https://www.hackerrank.com/domains/python"}
        ]
    },
    "java": {
        "id": "java",
        "name": "Java",
        "category": "Programming",
        "description": "Java is an object-oriented, heavily typed language known for its 'write once, run anywhere' capability on the JVM.",
        "overview": "Java is the backbone of massive enterprise architectures, Android application development, and large-scale data processing systems. Learning Java involves deeply understanding the Java Virtual Machine (JVM) internals, robust design patterns, thread management, and the massive Spring framework ecosystem for enterprise web services.",
        "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "1. JVM Architecture",
            "2. Java Syntax & OOP",
            "3. Collections Framework",
            "4. Multi-threading",
            "5. Java Streams & Lambdas",
            "6. Build Tools (Maven/Gradle)"
        ],
        "roadmap_url": "https://roadmap.sh/java",
        "youtube_videos": [
            {"title": "Java Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=eIrMbAQSU34"}
        ],
        "articles": [
            {"title": "Baeldung - Java Guides", "url": "https://www.baeldung.com/"}
        ],
        "courses": [
            {"name": "Java Programming Masterclass", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "HackerRank Java", "url": "https://www.hackerrank.com/domains/java"},
            {"name": "CodingBat Java", "url": "https://codingbat.com/java"}
        ]
    },
    "cyber_security": {
        "id": "cyber_security",
        "name": "Cyber Security",
        "category": "Cybersecurity",
        "description": "Discover how to protect computer systems, networks, and confidential data from vicious digital attacks and vulnerabilities.",
        "overview": "Cyber security covers everything from Ethical Hacking, Penetration Testing, and Vulnerability Assessment to Risk Management and Cryptography. You will learn to think like an attacker in order to build impenetrable defense mechanisms. Essential topics include recognizing OWASP Top 10 vulnerabilities, deploying firewalls, network monitoring, and implementing robust Zero Trust architecture schemas.",
        "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "1. IT Fundamentals (Networking, OS)",
            "2. Network Security",
            "3. Systems Security",
            "4. Cryptography",
            "5. Penetration Testing",
            "6. Risk Management"
        ],
        "roadmap_url": "https://roadmap.sh/cyber-security",
        "youtube_videos": [
            {"title": "Cybersecurity Full Course for Beginner", "url": "https://www.youtube.com/watch?v=U_P23SqJaDc"}
        ],
        "articles": [
            {"title": "OWASP Top Ten", "url": "https://owasp.org/www-project-top-ten/"}
        ],
        "courses": [
            {"name": "CompTIA Security+ Certification", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "Hack The Box", "url": "https://www.hackthebox.com/"},
            {"name": "TryHackMe", "url": "https://tryhackme.com/"}
        ]
    },
    "cpp": {
        "id": "cpp",
        "name": "C++",
        "category": "Programming",
        "description": "C++ is a highly performant, compiled language frequently utilized in game engines, high-frequency trading, and operating systems.",
        "overview": "C++ provides developers with extensive control over system resources and memory allocation. It builds upon C by adding object-oriented features, templates, and the powerful Standard Template Library (STL). Professional game development (Unreal Engine), financial systems, and performance-critical software architectures heavily rely on the raw execution speed generated uniquely by C++ binaries.",
        "image_url": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "1. Basic Syntax and Pointers",
            "2. Object Oriented Programming",
            "3. Memory Management (New/Delete, Smart Pointers)",
            "4. Standard Template Library (STL)",
            "5. Concurrency",
            "6. Template Metaprogramming"
        ],
        "roadmap_url": "https://roadmap.sh/cpp",
        "youtube_videos": [
            {"title": "C++ Programming Full Course", "url": "https://www.youtube.com/watch?v=vLnPwxZdW4Y"}
        ],
        "articles": [
            {"title": "C++ Reference", "url": "https://en.cppreference.com/w/"}
        ],
        "courses": [
            {"name": "Beginning C++ Programming", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "LeetCode C++", "url": "https://leetcode.com/"},
            {"name": "HackerRank C++", "url": "https://www.hackerrank.com/domains/cpp"}
        ]
    },
    "csharp": {
        "id": "csharp",
        "name": "C#",
        "category": "Programming",
        "description": "A modern, object-oriented language developed by Microsoft combining the computing power of C++ with the programming ease of Visual Basic.",
        "overview": "C# runs entirely on the .NET framework, making it an exceptional choice for Windows desktop applications, robust enterprise backend infrastructure, and video game development utilizing the Unity engine. C# boasts massive improvements over time with extremely strong typing, asynchronous task functionality, and Language Integrated Query (LINQ) to interact flawlessly with databases in native code.",
        "image_url": "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "1. Basic Syntax and Data Types",
            "2. Classes and Object-Oriented Principles",
            "3. Interfaces and Generics",
            "4. LINQ (Language-Integrated Query)",
            "5. Asynchronous Programming (async/await)",
            "6. .NET Core Fundamentals"
        ],
        "roadmap_url": "https://roadmap.sh/dotnet",
        "youtube_videos": [
            {"title": "C# Full Course for Beginners", "url": "https://www.youtube.com/watch?v=GhQdlIFylQ8"}
        ],
        "articles": [
            {"title": "Microsoft C# Documentation", "url": "https://learn.microsoft.com/en-us/dotnet/csharp/"}
        ],
        "courses": [
            {"name": "C# Masterclass", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "Codewars C#", "url": "https://www.codewars.com/"}
        ]
    },
    "rust": {
        "id": "rust",
        "name": "Rust",
        "category": "Programming",
        "description": "Rust is a blazing-fast and memory-efficient systems programming language that guarantees memory safety and thread safety without a garbage collector.",
        "overview": "Consistently voted the 'most loved programming language', Rust prevents segfaults and data races at compile time via its unique Ownership and Borrowing system. Rust empowers developers to confidently write performant abstractions for embedded systems, WebAssembly (Wasm) frontends, blockchain ecosystems, and highly concurrent networked web servers. ",
        "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2668&auto=format&fit=crop",
        "roadmap": [
            "1. Variables and Mutability",
            "2. Ownership and Borrowing Rules",
            "3. Structs and Enums",
            "4. Pattern Matching",
            "5. Lifetimes",
            "6. Concurrency and Unsafe Rust"
        ],
        "roadmap_url": "https://roadmap.sh/rust",
        "youtube_videos": [
            {"title": "Rust Crash Course", "url": "https://www.youtube.com/watch?v=zF34dRivLOw"}
        ],
        "articles": [
            {"title": "The Rust Programming Language Book", "url": "https://doc.rust-lang.org/book/"}
        ],
        "courses": [
            {"name": "Ultimate Rust Crash Course", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "Rustlings", "url": "https://github.com/rust-lang/rustlings"}
        ]
    },
    "php": {
        "id": "php",
        "name": "PHP",
        "category": "Web Development",
        "description": "PHP is a highly widespread open-source scripting language that is especially suited for backend web development and can be embedded into HTML.",
        "overview": "Powering massive content management systems like WordPress, Drupal, and Joomla, PHP runs roughly 80% of the entire internet's backend. In the modern era, PHP is incredibly robust and object-oriented, particularly through popular enterprise level MVC frameworks like Laravel and Symfony. It provides a simple learning curve but contains deep capabilities for high-throughput scaling.",
        "image_url": "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "1. Basic Syntax and Forms",
            "2. Arrays and Superglobals",
            "3. Session & Cookies",
            "4. Object-Oriented PHP",
            "5. PDO & Database Security",
            "6. Frameworks (Laravel, Symfony)"
        ],
        "roadmap_url": "https://roadmap.sh/php",
        "youtube_videos": [
            {"title": "PHP Programming Course", "url": "https://www.youtube.com/watch?v=OK_JCtrrv-c"}
        ],
        "articles": [
            {"title": "PHP The Right Way", "url": "https://phptherightway.com/"}
        ],
        "courses": [
            {"name": "PHP for Beginners", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "Exercism PHP", "url": "https://exercism.org/tracks/php"}
        ]
    },
    "ruby": {
        "id": "ruby",
        "name": "Ruby",
        "category": "Programming",
        "description": "Ruby is a dynamic, open-source programming language with a focus on absolute simplicity and developer productivity.",
        "overview": "Ruby is designed specifically to make programming a joyful experience, famously utilizing the paradigm that 'everything is an object'. While capable of being used entirely on its own, Ruby reached widespread global dominance due to Ruby on Rails—a highly opinionated, full-stack MVC framework powering major tech giants like GitHub, Shopify, and Airbnb with rapid iterations.",
        "image_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2669&auto=format&fit=crop",
        "roadmap": [
            "1. Variables and Methods",
            "2. Control Flow and Iterators",
            "3. Blocks, Procs, and Lambdas",
            "4. Object-Oriented Programming Classes",
            "5. Modules and Mixins",
            "6. Ruby on Rails Basics"
        ],
        "roadmap_url": "https://roadmap.sh/ruby-on-rails",
        "youtube_videos": [
            {"title": "Ruby Programming Language - Full Course", "url": "https://www.youtube.com/watch?v=t_ispmWmdjY"}
        ],
        "articles": [
            {"title": "Ruby Documentation", "url": "https://ruby-doc.org/"}
        ],
        "courses": [
            {"name": "Complete Ruby on Rails Developer", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "Codewars Ruby", "url": "https://www.codewars.com/"}
        ]
    },
    "swift": {
        "id": "swift",
        "name": "Swift",
        "category": "Mobile Development",
        "description": "Swift is an incredibly robust and intuitive modern programming language created by Apple for building high-quality apps across iOS, Mac, Apple TV, and Apple Watch.",
        "overview": "Replacing Objective-C, Swift is designed to be completely safe against errors (preventing null pointer exceptions) while being blistering fast. The ecosystem integrates heavily with Xcode, utilizing declarative UI technologies like SwiftUI to build gorgeous, deeply integrated applications specifically for Apple's monolithic hardware ecosystem.",
        "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "1. Swift Basics (Optionals, Try/Catch)",
            "2. Structs vs Classes",
            "3. Protocols and Extensions",
            "4. SwiftUI Basics",
            "5. State Management (ObservableObject)",
            "6. Networking & CoreData"
        ],
        "roadmap_url": "https://roadmap.sh/ios",
        "youtube_videos": [
            {"title": "Swift Programming Course for Beginners", "url": "https://www.youtube.com/watch?v=8Xg7E9shq0U"}
        ],
        "articles": [
            {"title": "Swift Documentation", "url": "https://docs.swift.org/swift-book/"}
        ],
        "courses": [
            {"name": "iOS App Development Course", "platform": "Udemy", "url": "https://www.udemy.com/"}
        ],
        "practice": [
            {"name": "Hacking with Swift", "url": "https://www.hackingwithswift.com/"}
        ]
    }
}

dumped_dict = json.dumps(NEW_SKILLS_DATA, indent=4)
# convert true/false/null depending on what's there
dumped_dict = dumped_dict.replace('null', 'None')
dumped_dict = dumped_dict.replace('true', 'True')
dumped_dict = dumped_dict.replace('false', 'False')

output_code = "from typing import List, Dict, Any\n\nSKILLS_DATA: Dict[str, Any] = " + dumped_dict + "\n"

with open('app/data/skills_data.py', 'w') as f:
    f.write(output_code)

print("Updated skills successfully")

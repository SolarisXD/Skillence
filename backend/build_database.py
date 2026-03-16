import json
import os

print("Generating the universal skills database...")

# --- 1. CORE & WEB SKILLS (From previous populate_rich_skills.py) ---
core_skills = {
    "frontend": {
        "id": "frontend",
        "name": "Frontend Development",
        "category": "Web Development",
        "description": "Step by step guide to becoming a modern frontend developer. Learn how to build user interfaces, handle state management, and create engaging web applications.",
        "overview": "Frontend development handles the visual and interactive aspects of a website that users interact with. Modern frontend development requires proficiency in HTML, CSS, and JavaScript, along with expertise in component-based frameworks like React, Vue, or Angular. You must also understand web performance, accessibility metrics, responsive design, and CSS architecture to build scalable single-page applications.",
        "image_url": "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2564&auto=format&fit=crop",
        "roadmap": [
            "Phase 1: Basics", "- Internet Fundamentals", "- HTML Semantic Structure", "- CSS Styling and Layouts", "- Basic JavaScript",
            "Phase 2: Advanced JavaScript", "- DOM Manipulation", "- Fetch and APIs", "- ES6+ Features",
            "Phase 3: Frameworks", "- React / Vue / Angular Basics", "- State Management", "- Component Architecture",
            "Phase 4: Build Tools & Practices", "- Webpack / Vite", "- Git & GitHub", "- Testing (Jest, Cypress)"
        ],
        "roadmap_url": "https://roadmap.sh/frontend",
        "youtube_videos": [{"title": "Web Development In 2024", "url": "https://www.youtube.com/watch?v=zJSY8tbf_ys"}],
        "articles": [{"title": "MDN Web Docs", "url": "https://developer.mozilla.org/"}],
        "courses": [{"name": "The Web Developer Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/"}],
        "practice": [{"name": "Frontend Mentor", "url": "https://www.frontendmentor.io/"}]
    },
    "backend": {
        "id": "backend",
        "name": "Backend Development",
        "category": "Web Development",
        "description": "Step by step guide to becoming a modern backend developer. Learn how to build scalable APIs, handle databases, and implement server-side logic securely.",
        "overview": "Backend development focuses on the server, databases, and application logic behind the scenes. It involves choosing languages like Python, Java, Node.js, or Go to build performant and secure APIs (REST, GraphQL, gRPC).",
        "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "Phase 1: Basics", "- Internet and OS Fundamentals", "- Command Line Basics",
            "Phase 2: Programming", "- Learn Python, Java, Node.js or Go", "- Basic Data Structures", "- Version Control",
            "Phase 3: Databases", "- Relational (PostgreSQL, MySQL)", "- NoSQL (MongoDB)", "- ORMs and Caching (Redis)",
            "Phase 4: APIs & Architecture", "- REST APIs & GraphQL", "- Authentication (JWT, OAuth)", "- Web Security",
            "Phase 5: DevOps & Deployment", "- Docker & Containers", "- CI/CD Pipelines", "- AWS / GCP Deployment"
        ],
        "roadmap_url": "https://roadmap.sh/backend",
        "youtube_videos": [{"title": "Backend Web Development Complete", "url": "https://www.youtube.com/watch?v=XBu54ncjgus"}],
        "articles": [{"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer"}],
        "courses": [{"name": "Backend Development and APIs", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/"}],
        "practice": [{"name": "LeetCode Backend System Design", "url": "https://leetcode.com/"}]
    },
    "cyber_security": {
        "id": "cyber_security",
        "name": "Cyber Security",
        "category": "Cybersecurity",
        "description": "Discover how to protect computer systems, networks, and confidential data from vicious digital attacks and vulnerabilities.",
        "overview": "Cyber security covers everything from Ethical Hacking, Penetration Testing, and Vulnerability Assessment to Risk Management and Cryptography.",
        "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670&auto=format&fit=crop",
        "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670&auto=format&fit=crop",
        "roadmap": [
            "Phase 1: IT Fundamentals", "- Basic Networking (TCP/IP, OSI)", "- Linux Essentials", "- Windows Server Basics",
            "Phase 2: Security Concepts", "- CIA Triad", "- Cryptography Basics", "- Identity & Access Management",
            "Phase 3: Network Security", "- Firewalls and Proxies", "- Intrusion Detection (IDS/IPS)", "- VPNs and Secure Protocols",
            "Phase 4: Offense & Defense", "- Ethical Hacking Basics", "- Vulnerability Assessment", "- Malware Analysis",
            "Phase 5: Certifications & Real World", "- Security+ / CEH / OSCP Prep", "- Incident Response", "- Cloud Security"
        ],
        "roadmap_url": "https://roadmap.sh/cyber-security",
        "youtube_videos": [{"title": "Cybersecurity Full Course", "url": "https://www.youtube.com/watch?v=U_P23SqJaDc"}],
        "articles": [{"title": "OWASP Top Ten", "url": "https://owasp.org/www-project-top-ten/"}],
        "courses": [{"name": "CompTIA Security+ Certification", "platform": "Udemy", "url": "https://www.udemy.com/"}],
        "practice": [{"name": "Hack The Box", "url": "https://www.hackthebox.com/"}]
    }
}

# --- 2. PROGRAMMING LANGUAGES (From generate_30_skills.py) ---
languages = [
    ("python", "Python", "Programming", "Python is a high-level, interpreted, general-purpose programming language."),
    ("java", "Java", "Programming", "Java is a high-level, class-based, object-oriented programming language."),
    ("cpp", "C++", "Programming", "C++ is a general-purpose programming language created as an extension of the C programming language."),
    ("csharp", "C#", "Programming", "C# is a modern, object-oriented, and type-safe programming language."),
    ("rust", "Rust", "Programming", "Rust is a multi-paradigm, general-purpose programming language designed for performance and safety."),
    ("php", "PHP", "Web Development", "PHP is a general-purpose scripting language geared toward web development."),
    ("ruby", "Ruby", "Programming", "Ruby is an interpreted, high-level, general-purpose programming language."),
    ("swift", "Swift", "Mobile Development", "Swift is a powerful and intuitive programming language for iOS, iPadOS, macOS, tvOS, and watchOS."),
    ("react_native", "React Native", "Mobile Development", "React Native is an open-source UI software framework created by Meta Platforms. It is used to develop applications for Android, iOS, and more using React and JavaScript."),
    ("flutter", "Flutter", "Mobile Development", "Flutter is an open-source UI software development kit created by Google for developing cross-platform applications."),
    ("go", "Go", "Programming", "Go is a statically typed, compiled programming language designed at Google."),
    ("kotlin", "Kotlin", "Mobile Development", "Kotlin is a cross-platform, statically typed, general-purpose programming language with type inference."),
    ("typescript", "TypeScript", "Web Development", "TypeScript is a free and open-source high-level programming language developed by Microsoft."),
    ("javascript", "JavaScript", "Web Development", "JavaScript is a programming language that is one of the core technologies of the World Wide Web."),
    ("r_lang", "R", "AI & Data", "R is a programming language for statistical computing and graphics."),
    ("matlab", "MATLAB", "AI & Data", "MATLAB is a proprietary multi-paradigm programming language and numeric computing environment."),
    ("julia", "Julia", "AI & Data", "Julia is a high-level, high-performance, dynamic programming language."),
    ("sql", "SQL", "AI & Data", "SQL is a domain-specific language used in programming and designed for managing data held in a relational database management system."),
    ("react", "React", "Web Development", "React is a free and open-source front-end JavaScript library for building user interfaces based on UI components."),
    ("angular", "Angular", "Web Development", "Angular is a TypeScript-based free and open-source web application framework."),
    ("vue", "Vue", "Web Development", "Vue.js is an open-source model\u2013view\u2013viewmodel front end JavaScript framework."),
    ("django", "Django", "Web Development", "Django is a free and open-source, Python-based web framework."),
]

# --- 3. AI & DATA SKILLS ---
ai_data_tools = [
    ("tensorflow", "TensorFlow", "TensorFlow is an end-to-end open source platform for machine learning."),
    ("pytorch", "PyTorch", "PyTorch is an open source machine learning framework that accelerates the path from research prototyping to production deployment."),
    ("pandas", "Pandas", "Pandas is a fast, powerful, flexible and easy to use open source data analysis and manipulation tool."),
    ("numpy", "NumPy", "NumPy is the fundamental package for scientific computing with Python."),
    ("scikit_learn", "Scikit-Learn", "Scikit-learn is a free software machine learning library for the Python programming language."),
    ("keras", "Keras", "Keras is an API designed for human beings, not machines. It is the industry-strength deep learning standard."),
    ("apache_spark", "Apache Spark", "Apache Spark is a multi-language engine for executing data engineering, data science, and machine learning on single-node machines or clusters."),
    ("hadoop", "Hadoop", "The Apache Hadoop software library is a framework that allows for the distributed processing of large data sets across clusters of computers."),
    ("tableau", "Tableau", "Tableau is a visual analytics platform transforming the way we use data to solve problems."),
    ("power_bi", "Power BI", "Power BI is an interactive data visualization software product developed by Microsoft with primary focus on business intelligence."),
    ("snowflake", "Snowflake", "Snowflake enables data storage, processing, and analytic solutions that are faster, easier to use, and far more flexible than traditional offerings."),
    ("databricks", "Databricks", "Databricks is an enterprise software company founded by the creators of Apache Spark."),
    ("nlp", "Natural Language Processing", "NLP sits at the intersection of computer science, artificial intelligence, and linguistics."),
    ("computer_vision", "Computer Vision", "Computer vision is an interdisciplinary scientific field focused on enabling computers to gain high-level understanding from digital images or videos. Examples include object tracking, facial recognition, and autonomous driving."),
    ("mlops", "MLOps", "MLOps is a set of practices that aims to deploy and maintain machine learning models in production reliably and efficiently. It combines machine learning, DevOps, and data engineering."),
    ("machine_learning", "Machine Learning", "Machine learning is a core field of artificial intelligence focused on building algorithms that can learn from and make predictions on historical data without explicit instructions."),
    ("deep_learning", "Deep Learning", "Deep learning is a subset of machine learning based on artificial neural networks. It powers the most advanced AI architectures today by passing data through multiple transformation layers."),
    ("data_science", "Data Science", "Data science is an interdisciplinary field that extracts actionable knowledge and semantic insights from noisy, structured, and unstructured datasets utilizing statistics and ML algorithms."),
    ("generative_ai", "Generative AI", "Generative AI systems utilize deep generative models (like GANs and Transformers) to autonomously generate high-quality text, graphical images, audio, or other media."),
    ("llm", "Large Language Models", "A Large Language Model (LLM) is a powerful deep learning algorithm that can recognize, summarize, translate, predict and generate completely novel text based on vast datasets."),
    ("langchain", "LangChain", "LangChain is a popular, open-source orchestration framework designed to heavily simplify the creation of advanced applications utilizing Large Language Models (LLMs)."),
    ("huggingface", "Hugging Face", "Hugging Face is the leading collaboration platform and open-source community currently driving cutting-edge ML. It hosts thousands of state-of-the-art pre-trained models and datasets."),
    ("data_engineering", "Data Engineering", "Data engineering strictly focuses on the scalable architectural building of data pipelines that enable the collection, storage, and processing usage of raw data components for ML tasks."),
    ("big_data", "Big Data Analytics", "Big data refers to massive data sets that scale too large or complex to be dealt with by traditional, constrained RDBMS or data-processing application software."),
    ("matplotlib", "Matplotlib", "Matplotlib is the premier graphing and plotting library for the Python programming language, tightly integrating with its numerical mathematics extension NumPy for visualizations."),
    ("seaborn", "Seaborn", "Seaborn is a powerful statistical data visualization library native to Python. Based entirely on matplotlib, it provides a high-level API interface for drawing wildly attractive statistical graphics."),
    ("opencv", "OpenCV", "OpenCV is an astronomically popular open-source computer vision and machine learning software library, providing real-time optimized frameworks for image capturing and analysis."),
    ("reinforcement_learning", "Reinforcement Learning", "Reinforcement learning is a sophisticated area of ML concerned with how autonomous intelligent agents ought to take actions in complex operational environments to maximize reward equations."),
    ("neural_networks", "Neural Networks", "Neural networks reflect the architectural behavior of the human brain's interconnected pathways, allowing computer programs to solve hyper-complex pattern clustering operations.")
]

# --- 4. CLOUD & DEVOPS SKILLS ---
cloud_devops_tools = [
    ("aws", "Amazon Web Services (AWS)", "AWS is the world's most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally."),
    ("azure", "Microsoft Azure", "Microsoft Azure is a cloud computing service created by Microsoft for building, testing, deploying, and managing applications and services through Microsoft-managed data centers."),
    ("gcp", "Google Cloud Platform", "Google Cloud Platform is a suite of cloud computing services that runs on the same infrastructure that Google uses internally for its end-user products."),
    ("docker", "Docker", "Docker is an open platform for developing, shipping, and running applications inside lightweight, portable containers."),
    ("kubernetes", "Kubernetes", "Kubernetes is an open-source container orchestration system for automating software deployment, scaling, and management."),
    ("terraform", "Terraform", "Terraform is an infrastructure as code tool that lets you define both cloud and on-prem resources in human-readable configuration files that you can version, reuse, and share."),
    ("ansible", "Ansible", "Ansible is an open-source software provisioning, configuration management, and application-deployment tool enabling infrastructure as code."),
    ("jenkins", "Jenkins", "Jenkins is an open source automation server that enables developers to reliably build, test, and deploy their software through CI/CD pipelines."),
    ("github_actions", "GitHub Actions", "GitHub Actions makes it easy to automate all your software workflows with world-class CI/CD directly from your GitHub repository."),
    ("linux_admin", "Linux Administration", "Linux system administration covers managing and maintaining Linux-based servers, services, users, and security in enterprise environments."),
    ("nginx", "Nginx", "Nginx is a web server that can also be used as a reverse proxy, load balancer, mail proxy and HTTP cache for high-performance deployments."),
    ("prometheus", "Prometheus & Grafana", "Prometheus is an open-source systems monitoring and alerting toolkit, often paired with Grafana for powerful visualization dashboards."),
    ("cicd", "CI/CD Pipelines", "Continuous Integration and Continuous Delivery (CI/CD) is a method to frequently deliver apps to customers by introducing automation into the stages of app development."),
    ("serverless", "Serverless Computing", "Serverless computing is a cloud computing execution model in which the cloud provider allocates machine resources on demand, taking care of servers entirely on behalf of their customers.")
]

cloud_image_url = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2670&auto=format&fit=crop"

image_urls = [
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=2574&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop",
]
ai_image_url = "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=2574&auto=format&fit=crop"

final_skills = {}

# Merge core skills
for k, v in core_skills.items():
    final_skills[k] = v

valid_roadmap_sh = {
    "frontend": "frontend",
    "backend": "backend",
    "cyber_security": "cyber-security",
    "python": "python",
    "java": "java",
    "cpp": "cpp",
    "go": "go",
    "rust": "rust",
    "javascript": "javascript",
    "typescript": "typescript",
    "php": "php",
    "ruby": "ruby",
    "sql": "sql",
    "react": "react",
    "angular": "angular",
    "vue": "vue",
    "flutter": "flutter",
    "react_native": "react-native",
    "swift": "ios",
    "kotlin": "android",
    "csharp": "aspnet-core",
    "data_science": "ai-data-scientist",
    "machine_learning": "ai-data-scientist",
    "deep_learning": "ai-data-scientist",
    "mlops": "mlops",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "linux_admin": "linux",
    "aws": "aws",
}

# Process languages
for idx, (lang_id, name, category, desc) in enumerate(languages):
    final_skills[lang_id] = {
        "id": lang_id,
        "name": name,
        "category": category,
        "description": desc,
        "overview": f"A comprehensive guide to {name}. Mastering {name} is crucial for {category.lower()} modern applications. Dive deep into the core concepts, syntax, and advanced features of {name} to elevate your engineering skills to the next level.",
        "image_url": image_urls[idx % len(image_urls)],
        "roadmap": [
            f"Phase 1: Foundations",
            f"- Understand the history and core philosophy behind {name}",
            f"- Master basic syntax, data types, and variable declarations",
            f"- Learn control flow (if/else, switch, loops) and error handling",
            f"- Set up your local development environment and CLI tooling",
            f"Phase 2: Core Paradigms",
            f"- Deep dive into object-oriented vs functional paradigms in {name}",
            f"- Master classes, structs, interfaces, and inheritance",
            f"- Understand memory management and garbage collection logic",
            f"Phase 3: Data Structures & Algorithms",
            f"- Arrays, Linked Lists, Trees, and HashMaps implementation in {name}",
            f"- Time complexity (Big O) and performance optimization",
            f"Phase 4: Advanced Concepts & Concurrency",
            f"- Multi-threading, async/await, and asynchronous programming logic",
            f"- Explore the standard library and third-party package managers",
            f"Phase 5: Real-world System Design",
            f"- Build full-scale CRUD applications and API integrations",
            f"- Learn testing frameworks (Unit testing, Integration testing)",
            f"- CI/CD and production deployment"
        ],
        "roadmap_url": None,
        "youtube_videos": [{"title": f"{name} Full Course", "url": f"https://www.youtube.com/results?search_query={name}+full+course"}],
        "articles": [{"title": f"{name} Official Documentation", "url": f"https://www.google.com/search?q={name}+official+docs"}],
        "courses": [{"name": f"The Complete {name} Bootcamp", "platform": "Udemy", "url": f"https://www.udemy.com/courses/search/?q={name}"}],
        "practice": [
            {"name": f"LeetCode {name}", "url": f"https://leetcode.com/problemset/all/?search={name}"},
            {"name": f"GeeksforGeeks {name}", "url": f"https://www.geeksforgeeks.org/"}
        ]
    }

# Process AI & DATA
for ai_id, name, desc in ai_data_tools:
    final_skills[ai_id] = {
        "id": ai_id,
        "name": name,
        "category": "AI & Data",
        "description": desc,
        "overview": f"Deep dive into {name}. It is widely used in the Data Science and Artificial Intelligence ecosystem for processing immense quantities of data and training deep neural networks. Mastering {name} is essential for aspiring Data Scientists and Machine Learning Engineers.",
        "image_url": ai_image_url,
        "roadmap": [
            f"Phase 1: Mathematics & Data Foundation",
            f"- Linear Algebra, Calculus, and Probability Theory essentials",
            f"- Exploratory Data Analysis (EDA) and data wrangling",
            f"- Understanding the specific ecosystem surrounding {name}",
            f"Phase 2: Core Deep-Dive into {name}",
            f"- Syntax patterns, initialization, and core configuration of {name}",
            f"- Building models, setting hyperparameters, and validation",
            f"Phase 3: Architecture & Performance",
            f"- Constructing pipelines and distributed data processing",
            f"- Hardware acceleration processing (GPU, TPU, Neural Engines)",
            f"- Dimensionality reduction and feature engineering",
            f"Phase 4: Advanced Machine Learning/AI Models",
            f"- Neural network layers, CNNs, RNNs, and Transformers",
            f"- Reinforcement learning protocols and tuning strategies",
            f"Phase 5: Production & MLOps",
            f"- Serving models via REST APIs and containerization (Docker)",
            f"- Monitoring inference drift and continuous CI/CD training loops"
        ],
        "roadmap_url": None,
        "youtube_videos": [
            {
                "title": f"{name} Complete Course for Data Science",
                "url": f"https://www.youtube.com/results?search_query={name}+data+science+course"
            },
            {
                "title": f"Mastering {name} in 2 Hours",
                "url": f"https://www.youtube.com/results?search_query={name}+crash+course"
            }
        ],
        "articles": [
            {
                "title": f"Towards Data Science: {name}",
                "url": f"https://towardsdatascience.com/search?q={name}"
            },
            {
                "title": f"{name} Documentation",
                "url": f"https://www.google.com/search?q={name}+documentation"
            }
        ],
        "courses": [
            {
                "name": f"Master {name} for Machine Learning",
                "platform": "Udemy",
                "url": f"https://www.udemy.com/courses/search/?q={name}"
            },
            {
                "name": f"Applied {name} Specialization",
                "platform": "Coursera",
                "url": f"https://www.coursera.org/search?query={name}"
            }
        ],
        "practice": [
            {
                "name": f"Kaggle Datasets & {name} Notebooks",
                "url": f"https://www.kaggle.com/search?q={name}"
            },
            {
                "name": f"HackerRank Artificial Intelligence",
                "url": f"https://www.hackerrank.com/domains/ai"
            }
        ]
    }

# Process CLOUD & DEVOPS
for cd_id, name, desc in cloud_devops_tools:
    final_skills[cd_id] = {
        "id": cd_id,
        "name": name,
        "category": "Cloud & DevOps",
        "description": desc,
        "overview": f"Master {name} to build, deploy, and operate scalable cloud-native infrastructure and CI/CD pipelines. {name} is a critical skill in today's DevOps and Cloud engineering ecosystem used by top tech companies worldwide.",
        "image_url": cloud_image_url,
        "roadmap": [
            f"Phase 1: Foundations",
            f"- Linux fundamentals and shell scripting",
            f"- Networking basics (DNS, TCP/IP, HTTP)",
            f"- Understanding cloud computing concepts",
            f"Phase 2: Core {name} Concepts",
            f"- Getting started with {name} documentation and setup",
            f"- Core services, configuration, and architecture",
            f"- Identity, access management, and security",
            f"Phase 3: Infrastructure as Code & Automation",
            f"- Automating deployments with {name}",
            f"- Infrastructure provisioning and templating",
            f"- Monitoring, logging, and alerting",
            f"Phase 4: Advanced Patterns",
            f"- High availability and disaster recovery",
            f"- Cost optimization and performance tuning",
            f"- Multi-region and multi-cloud strategies",
            f"Phase 5: Certifications & Production",
            f"- Certification preparation resources",
            f"- Real-world production architecture case studies",
            f"- Site Reliability Engineering (SRE) practices"
        ],
        "roadmap_url": None,
        "youtube_videos": [
            {"title": f"{name} Full Course for Beginners", "url": f"https://www.youtube.com/results?search_query={name}+full+course"},
            {"title": f"Advanced {name} Tutorial", "url": f"https://www.youtube.com/results?search_query=advanced+{name}+tutorial"}
        ],
        "articles": [
            {"title": f"{name} Official Documentation", "url": f"https://www.google.com/search?q={name}+official+documentation"},
            {"title": f"{name} Best Practices", "url": f"https://www.google.com/search?q={name}+best+practices"}
        ],
        "courses": [
            {"name": f"Ultimate {name} Bootcamp", "platform": "Udemy", "url": f"https://www.udemy.com/courses/search/?q={name}"},
            {"name": f"{name} Specialization", "platform": "Coursera", "url": f"https://www.coursera.org/search?query={name}"}
        ],
        "practice": [
            {"name": f"{name} Hands-on Labs", "url": f"https://www.google.com/search?q={name}+hands+on+labs"},
            {"name": f"KodeKloud {name}", "url": f"https://kodekloud.com/"}
        ]
    }

# Fix URLs based on validation
for k, v in final_skills.items():
    if k in valid_roadmap_sh:
        v["roadmap_url"] = f"https://roadmap.sh/{valid_roadmap_sh[k]}"
    else:
        v["roadmap_url"] = None

# --- METADATA ENRICHMENT ---
category_meta = {
    "Programming": {
        "prerequisites": ["Basic computer literacy", "Problem-solving mindset", "Text editor familiarity"],
        "career_roles": ["Software Developer", "Full Stack Engineer", "Systems Programmer", "DevOps Engineer"],
        "difficulty": "beginner",
        "estimated_time": "3-6 months",
        "use_cases": ["Web applications", "Mobile apps", "Automation scripts", "Game development"],
    },
    "Web Development": {
        "prerequisites": ["HTML & CSS basics", "JavaScript fundamentals"],
        "career_roles": ["Frontend Developer", "Backend Developer", "Full Stack Engineer", "UI/UX Developer"],
        "difficulty": "intermediate",
        "estimated_time": "4-8 months",
        "use_cases": ["E-commerce sites", "SaaS platforms", "Progressive web apps", "Content management systems"],
    },
    "AI & Data": {
        "prerequisites": ["Python programming", "Linear algebra basics", "Statistics fundamentals"],
        "career_roles": ["Data Scientist", "ML Engineer", "AI Researcher", "Data Analyst"],
        "difficulty": "advanced",
        "estimated_time": "6-12 months",
        "use_cases": ["Predictive analytics", "Natural language processing", "Computer vision", "Recommendation systems"],
    },
    "Cloud & DevOps": {
        "prerequisites": ["Linux basics", "Networking fundamentals", "Command line proficiency"],
        "career_roles": ["Cloud Engineer", "DevOps Engineer", "Site Reliability Engineer", "Platform Engineer"],
        "difficulty": "intermediate",
        "estimated_time": "4-8 months",
        "use_cases": ["Cloud migration", "CI/CD pipelines", "Infrastructure automation", "Containerized deployments"],
    },
    "Mobile Development": {
        "prerequisites": ["Programming fundamentals", "UI/UX design concepts"],
        "career_roles": ["Mobile Developer", "iOS Developer", "Android Developer", "Cross-platform Developer"],
        "difficulty": "intermediate",
        "estimated_time": "4-6 months",
        "use_cases": ["Consumer apps", "Enterprise mobile", "Social media apps", "Fintech mobile apps"],
    },
    "Cybersecurity": {
        "prerequisites": ["Networking basics", "Linux command line", "Basic scripting"],
        "career_roles": ["Security Analyst", "Penetration Tester", "Security Engineer", "SOC Analyst"],
        "difficulty": "advanced",
        "estimated_time": "6-12 months",
        "use_cases": ["Vulnerability assessment", "Incident response", "Compliance auditing", "Threat hunting"],
    },
}

for k, v in final_skills.items():
    cat = v.get("category", "Programming")
    meta = category_meta.get(cat, category_meta["Programming"])
    v.setdefault("prerequisites", meta["prerequisites"])
    v.setdefault("career_roles", meta["career_roles"])
    v.setdefault("difficulty", meta["difficulty"])
    v.setdefault("estimated_time", meta["estimated_time"])
    v.setdefault("use_cases", meta["use_cases"])
    # Enhance courses with ratings and durations
    for c in v.get("courses", []):
        if "rating" not in c:
            c["rating"] = "4.6"
        if "duration" not in c:
            c["duration"] = "20+ hours"
    # Enhance practice with difficulty
    for p in v.get("practice", []):
        if "difficulty" not in p:
            p["difficulty"] = "beginner"

dumped_dict = json.dumps(final_skills, indent=4)
dumped_dict = dumped_dict.replace('null', 'None').replace('true', 'True').replace('false', 'False')
output_code = "from typing import List, Dict, Any\n\nSKILLS_DATA: Dict[str, Any] = " + dumped_dict + "\n"

with open('app/data/skills_data.py', 'w') as f:
    f.write(output_code)

print(f"Successfully assembled {len(final_skills)} skills with rich AI & Data content!")


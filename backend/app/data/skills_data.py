from typing import List, Dict, Any

SKILLS_DATA: Dict[str, Any] = {
    "frontend": {
        "id": "frontend",
        "name": "Frontend Development",
        "category": "Web Development",
        "description": "Step by step guide to becoming a modern frontend developer. Learn how to build user interfaces, handle state management, and create engaging web applications.",
        "overview": "Frontend development handles the visual and interactive aspects of a website that users interact with. Modern frontend development requires proficiency in HTML, CSS, and JavaScript, along with expertise in component-based frameworks like React, Vue, or Angular. You must also understand web performance, accessibility metrics, responsive design, and CSS architecture to build scalable single-page applications.",
        "image_url": "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2564&auto=format&fit=crop",
        "roadmap": [
            {
                "phase": "Phase 1: Foundations",
                "description": "Learn the absolute basics of how the web works, HTML, CSS, and foundational JavaScript logic.",
                "estimated_time": "2-4 Weeks",
                "topics": [
                    {
                        "id": "html-basics",
                        "name": "HTML & Semantic Markup",
                        "resources": [
                            {
                                "title": "HTML: A good basis for accessibility",
                                "url": "https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML",
                                "type": "article",
                                "source": "MDN Docs"
                            }
                        ]
                    },
                    {
                        "id": "css-basics",
                        "name": "CSS Selectors, Box Model, Flexbox/Grid",
                        "resources": [
                            {
                                "title": "A Complete Guide to Flexbox",
                                "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
                                "type": "article",
                                "source": "CSS-Tricks"
                            },
                            {
                                "title": "Learn CSS Grid",
                                "url": "https://cssgrid.io/",
                                "type": "practice",
                                "source": "Wes Bos"
                            }
                        ]
                    },
                    {
                        "id": "js-basics",
                        "name": "JavaScript Fundamentals (Variables, Loops, DOM)",
                        "resources": [
                            {
                                "title": "The Modern JavaScript Tutorial",
                                "url": "https://javascript.info/",
                                "type": "documentation",
                                "source": "javascript.info"
                            }
                        ]
                    }
                ]
            },
            {
                "phase": "Phase 2: Core Concepts",
                "description": "Deep dive into advanced JavaScript, browser APIs, and version control.",
                "estimated_time": "4-6 Weeks",
                "topics": [
                    {
                        "id": "js-advanced",
                        "name": "ES6+ Features (Promises, async/await, closures)",
                        "resources": [
                            {
                                "title": "MDN: Asynchronous JavaScript",
                                "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous",
                                "type": "documentation",
                                "source": "MDN Docs"
                            }
                        ]
                    },
                    {
                        "id": "git-basics",
                        "name": "Git & GitHub workflows",
                        "resources": [
                            {
                                "title": "Learn Git Branching",
                                "url": "https://learngitbranching.js.org/",
                                "type": "practice",
                                "source": "Interactive"
                            }
                        ]
                    },
                    {
                        "id": "web-apis",
                        "name": "Fetch API, LocalStorage, Browser Architecture",
                        "resources": [
                            {
                                "title": "Using Fetch API",
                                "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
                                "type": "documentation",
                                "source": "MDN Docs"
                            }
                        ]
                    }
                ]
            },
            {
                "phase": "Phase 3: Data Structures / Core Techniques",
                "description": "Mastering frontend frameworks and component-driven architecture.",
                "estimated_time": "6-8 Weeks",
                "topics": [
                    {
                        "id": "frameworks",
                        "name": "React / Vue / Angular (Pick one)",
                        "resources": [
                            {
                                "title": "React Official Docs",
                                "url": "https://react.dev/learn",
                                "type": "documentation",
                                "source": "React"
                            },
                            {
                                "title": "Vue.js Documentation",
                                "url": "https://vuejs.org/guide/introduction.html",
                                "type": "documentation",
                                "source": "Vue"
                            }
                        ]
                    },
                    {
                        "id": "state-management",
                        "name": "State Management (Redux, Zustand, Vuex)",
                        "resources": [
                            {
                                "title": "Redux Essentials",
                                "url": "https://redux.js.org/tutorials/essentials/part-1-overview-concepts",
                                "type": "documentation",
                                "source": "Redux"
                            }
                        ]
                    },
                    {
                        "id": "styling-arch",
                        "name": "CSS Architecture (Tailwind, CSS-in-JS, SASS)",
                        "resources": [
                            {
                                "title": "Tailwind CSS Documentation",
                                "url": "https://tailwindcss.com/docs/installation",
                                "type": "documentation",
                                "source": "Tailwind"
                            }
                        ]
                    }
                ]
            },
            {
                "phase": "Phase 4: Advanced Topics",
                "description": "Learn about performance, testing, and modern build tools.",
                "estimated_time": "4-6 Weeks",
                "topics": [
                    {
                        "id": "testing",
                        "name": "Testing (Jest, React Testing Library, Cypress)",
                        "resources": [
                            {
                                "title": "React Testing Library",
                                "url": "https://testing-library.com/docs/react-testing-library/intro/",
                                "type": "documentation",
                                "source": "Testing Library"
                            }
                        ]
                    },
                    {
                        "id": "performance",
                        "name": "Web Performance (Core Web Vitals, Lazy Loading)",
                        "resources": [
                            {
                                "title": "Web Vitals",
                                "url": "https://web.dev/articles/vitals",
                                "type": "article",
                                "source": "web.dev"
                            }
                        ]
                    },
                    {
                        "id": "build-tools",
                        "name": "Build Tools (Vite, Webpack, Babel)",
                        "resources": [
                            {
                                "title": "Vite Guide",
                                "url": "https://vitejs.dev/guide/",
                                "type": "documentation",
                                "source": "Vite"
                            }
                        ]
                    }
                ]
            },
            {
                "phase": "Phase 5: Real-World Projects & System Design",
                "description": "Apply your knowledge by building complex, production-ready applications.",
                "estimated_time": "Ongoing",
                "topics": [
                    {
                        "id": "ssr-ssg",
                        "name": "SSR & SSG (Next.js / Nuxt)",
                        "resources": [
                            {
                                "title": "Next.js Foundations",
                                "url": "https://nextjs.org/learn/foundations/about-nextjs",
                                "type": "documentation",
                                "source": "Next.js"
                            }
                        ]
                    },
                    {
                        "id": "typescript",
                        "name": "TypeScript for large codebases",
                        "resources": [
                            {
                                "title": "TypeScript for JavaScript Programmers",
                                "url": "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html",
                                "type": "documentation",
                                "source": "TypeScript"
                            }
                        ]
                    },
                    {
                        "id": "capstone",
                        "name": "Capstone: Build an E-commerce or Dashboard Portal",
                        "resources": [
                            {
                                "title": "Frontend Mentor Challenges",
                                "url": "https://www.frontendmentor.io/challenges",
                                "type": "practice",
                                "source": "Frontend Mentor"
                            }
                        ]
                    }
                ]
            }
        ],
        "roadmap_url": "https://roadmap.sh/frontend",
        "youtube_videos": [
            {
                "title": "Web Development In 2024 - A Practical Guide",
                "url": "https://www.youtube.com/watch?v=zJSY8tbf_ys"
            },
            {
                "title": "100+ Web Development Things you Should Know",
                "url": "https://www.youtube.com/watch?v=erEgovG9WBs"
            }
        ],
        "articles": [
            {
                "title": "MDN Web Docs",
                "url": "https://developer.mozilla.org/"
            },
            {
                "title": "CSS Tricks",
                "url": "https://css-tricks.com/"
            }
        ],
        "courses": [
            {
                "name": "The Web Developer Bootcamp",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            },
            {
                "name": "CS50's Web Programming",
                "platform": "edX",
                "url": "https://www.edx.org/"
            }
        ],
        "practice": [
            {
                "name": "Frontend Mentor",
                "url": "https://www.frontendmentor.io/"
            },
            {
                "name": "HackerRank Web",
                "url": "https://www.hackerrank.com/"
            }
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
            {
                "phase": "Phase 1: Foundations",
                "description": "Learn the OS, networking basics, and pick a programming language.",
                "estimated_time": "3-5 Weeks",
                "topics": [
                    {
                        "id": "internet-os",
                        "name": "Internet & OS Basics (DNS, HTTP/HTTPS, Linux)",
                        "resources": [
                            {
                                "title": "How the Internet Works",
                                "url": "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work",
                                "type": "article",
                                "source": "MDN Docs"
                            }
                        ]
                    },
                    {
                        "id": "language",
                        "name": "Pick a Language (Python, Node.js, Java, Go)",
                        "resources": [
                            {
                                "title": "Python Official Tutorial",
                                "url": "https://docs.python.org/3/tutorial/",
                                "type": "documentation",
                                "source": "Python.org"
                            }
                        ]
                    },
                    {
                        "id": "version-control-be",
                        "name": "Git & GitHub",
                        "resources": [
                            {
                                "title": "Pro Git Book",
                                "url": "https://git-scm.com/book/en/v2",
                                "type": "article",
                                "source": "Git"
                            }
                        ]
                    }
                ]
            },
            {
                "phase": "Phase 2: Core Concepts",
                "description": "Master relational databases, APIs, and basic web servers.",
                "estimated_time": "5-7 Weeks",
                "topics": [
                    {
                        "id": "sql-db",
                        "name": "Relational Databases & SQL (PostgreSQL, MySQL)",
                        "resources": [
                            {
                                "title": "PostgreSQL Tutorial",
                                "url": "https://www.postgresqltutorial.com/",
                                "type": "article",
                                "source": "PostgreSQL Tutorial"
                            }
                        ]
                    },
                    {
                        "id": "rest-api",
                        "name": "Building RESTful APIs",
                        "resources": [
                            {
                                "title": "REST API Best Practices",
                                "url": "https://restfulapi.net/",
                                "type": "documentation",
                                "source": "RESTfulAPI.net"
                            }
                        ]
                    },
                    {
                        "id": "auth",
                        "name": "Authentication & Authorization (JWT, OAuth)",
                        "resources": [
                            {
                                "title": "Introduction to JSON Web Tokens",
                                "url": "https://jwt.io/introduction",
                                "type": "article",
                                "source": "JWT.io"
                            }
                        ]
                    }
                ]
            },
            {
                "phase": "Phase 3: Data Structures / Core Techniques",
                "description": "Dive into caching, NoSQL, and ORMs.",
                "estimated_time": "4-6 Weeks",
                "topics": [
                    {
                        "id": "nosql",
                        "name": "NoSQL Databases (MongoDB, Redis)",
                        "resources": [
                            {
                                "title": "MongoDB University",
                                "url": "https://learn.mongodb.com/",
                                "type": "course",
                                "source": "MongoDB"
                            }
                        ]
                    },
                    {
                        "id": "orms",
                        "name": "ORMs and Query Builders (Prisma, SQLAlchemy, Hibernate)",
                        "resources": [
                            {
                                "title": "SQLAlchemy Documentation",
                                "url": "https://docs.sqlalchemy.org/en/20/",
                                "type": "documentation",
                                "source": "SQLAlchemy"
                            }
                        ]
                    },
                    {
                        "id": "caching",
                        "name": "Caching Strategies",
                        "resources": [
                            {
                                "title": "Caching Best Practices",
                                "url": "https://aws.amazon.com/caching/best-practices/",
                                "type": "article",
                                "source": "AWS"
                            }
                        ]
                    }
                ]
            },
            {
                "phase": "Phase 4: Advanced Topics",
                "description": "Learn about microservices, message brokers, and CI/CD.",
                "estimated_time": "6-8 Weeks",
                "topics": [
                    {
                        "id": "message-brokers",
                        "name": "Message Brokers (Kafka, RabbitMQ)",
                        "resources": [
                            {
                                "title": "RabbitMQ Tutorials",
                                "url": "https://www.rabbitmq.com/tutorials/tutorial-one-python.html",
                                "type": "documentation",
                                "source": "RabbitMQ"
                            }
                        ]
                    },
                    {
                        "id": "docker",
                        "name": "Docker & Containerization",
                        "resources": [
                            {
                                "title": "Docker 101",
                                "url": "https://docs.docker.com/get-started/",
                                "type": "documentation",
                                "source": "Docker"
                            }
                        ]
                    },
                    {
                        "id": "cicd",
                        "name": "CI/CD Pipelines (GitHub Actions)",
                        "resources": [
                            {
                                "title": "GitHub Actions Documentation",
                                "url": "https://docs.github.com/en/actions",
                                "type": "documentation",
                                "source": "GitHub"
                            }
                        ]
                    }
                ]
            },
            {
                "phase": "Phase 5: Real-World Projects & System Design",
                "description": "Architect scalable systems and deploy them to the cloud.",
                "estimated_time": "Ongoing",
                "topics": [
                    {
                        "id": "system-design",
                        "name": "System Design Fundamentals",
                        "resources": [
                            {
                                "title": "System Design Primer",
                                "url": "https://github.com/donnemartin/system-design-primer",
                                "type": "article",
                                "source": "GitHub"
                            }
                        ]
                    },
                    {
                        "id": "cloud-aws",
                        "name": "Cloud Deployment (AWS, GCP, Azure)",
                        "resources": [
                            {
                                "title": "AWS Ramp-Up Guide: Developer",
                                "url": "https://d1.awsstatic.com/training-and-certification/ramp-up_guides/Ramp-Up_Guide_Developer.pdf",
                                "type": "documentation",
                                "source": "AWS"
                            }
                        ]
                    },
                    {
                        "id": "graphql",
                        "name": "GraphQL & gRPC",
                        "resources": [
                            {
                                "title": "Introduction to GraphQL",
                                "url": "https://graphql.org/learn/",
                                "type": "documentation",
                                "source": "GraphQL.org"
                            }
                        ]
                    }
                ]
            }
        ],
        "roadmap_url": "https://roadmap.sh/backend",
        "youtube_videos": [
            {
                "title": "Backend Web Development - A Complete Overview",
                "url": "https://www.youtube.com/watch?v=XBu54ncjgus"
            },
            {
                "title": "APIs for Beginners",
                "url": "https://www.youtube.com/watch?v=GZvSYJDk-us"
            }
        ],
        "articles": [
            {
                "title": "System Design Primer",
                "url": "https://github.com/donnemartin/system-design-primer"
            },
            {
                "title": "REST API Best Practices",
                "url": "https://restfulapi.net/"
            }
        ],
        "courses": [
            {
                "name": "Backend Development and APIs",
                "platform": "freeCodeCamp",
                "url": "https://www.freecodecamp.org/"
            },
            {
                "name": "Complete Node.js Developer",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "LeetCode Backend System Design",
                "url": "https://leetcode.com/discuss/interview-question/system-design"
            },
            {
                "name": "HackerRank SQL",
                "url": "https://www.hackerrank.com/domains/sql"
            }
        ]
    },
    "react": {
        "id": "react",
        "name": "React",
        "category": "Web Development",
        "description": "React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.",
        "overview": "Maintained by Meta, React is the most popular frontend framework for modern web applications. It utilizes a Virtual DOM for blazing-fast rendering and an ecosystem full of state-management libraries (Redux, Zustand) and routing solutions (React Router, Next.js). Mastering React involves deeply understanding component lifecycles, functional hooks, context API, and advanced performance optimization techniques.",
        "image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
        "prerequisites": ["HTML", "CSS", "JavaScript"],
        "career_roles": ["Frontend Developer", "React Developer", "UI/UX Engineer"],
        "difficulty": "intermediate",
        "estimated_time": "12-16 Weeks",
        "use_cases": ["Single Page Applications", "Dashboards", "E-commerce"],
        "roadmap": [
            {
                "phase": "Phase 1: Foundations",
                "description": "Learn the core concepts of React.",
                "estimated_time": "2-3 Weeks",
                "topics": [
                    { "id": "react-jsx", "name": "JSX and Components", "resources": [
                        {"title": "React – Describing the UI", "url": "https://react.dev/learn/describing-the-ui", "type": "documentation", "source": "React Docs"},
                        {"title": "ReactJS JSX Introduction", "url": "https://www.geeksforgeeks.org/reactjs-introduction-jsx/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "React Components - W3Schools", "url": "https://www.w3schools.com/react/react_components.asp", "type": "article", "source": "W3Schools"}
                    ]},
                    { "id": "react-props-state", "name": "Props vs State", "resources": [
                        {"title": "Passing Props to a Component", "url": "https://react.dev/learn/passing-props-to-a-component", "type": "documentation", "source": "React Docs"},
                        {"title": "State vs Props in ReactJS", "url": "https://www.geeksforgeeks.org/what-are-the-differences-between-props-and-state/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "React State - W3Schools", "url": "https://www.w3schools.com/react/react_state.asp", "type": "article", "source": "W3Schools"}
                    ]}
                ]
            },
            {
                "phase": "Phase 2: Core Concepts",
                "description": "Master component lifecycles and modern React features.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "react-hooks", "name": "Component Lifecycle and Hooks", "resources": [
                        {"title": "Built-in React Hooks", "url": "https://react.dev/reference/react/hooks", "type": "documentation", "source": "React Docs"},
                        {"title": "ReactJS Hooks", "url": "https://www.geeksforgeeks.org/reactjs-hooks/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "React Hooks - W3Schools", "url": "https://www.w3schools.com/react/react_hooks.asp", "type": "article", "source": "W3Schools"}
                    ]},
                    { "id": "react-router", "name": "Routing (React Router)", "resources": [
                        {"title": "React Router Official Docs", "url": "https://reactrouter.com/en/main", "type": "documentation", "source": "React Router"},
                        {"title": "ReactJS Router", "url": "https://www.geeksforgeeks.org/reactjs-router/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "How to Use React Router v6", "url": "https://www.freecodecamp.org/news/how-to-use-react-router-version-6/", "type": "article", "source": "freeCodeCamp"}
                    ]}
                ]
            },
            {
                "phase": "Phase 3: Data Structures / Core Techniques",
                "description": "Handle complex application state and data flow.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "react-context", "name": "Context API & State Management", "resources": [
                        {"title": "Passing Data Deeply with Context", "url": "https://react.dev/learn/passing-data-deeply-with-context", "type": "documentation", "source": "React Docs"},
                        {"title": "React Context API", "url": "https://www.geeksforgeeks.org/react-js-context-api/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "React Context for Beginners", "url": "https://www.freecodecamp.org/news/react-context-for-beginners/", "type": "article", "source": "freeCodeCamp"}
                    ]},
                    { "id": "react-forms", "name": "Form Handling and Validation", "resources": [
                        {"title": "Reacting to Input with State", "url": "https://react.dev/learn/reacting-to-input-with-state", "type": "documentation", "source": "React Docs"},
                        {"title": "ReactJS Forms", "url": "https://www.geeksforgeeks.org/reactjs-forms/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "React Forms - W3Schools", "url": "https://www.w3schools.com/react/react_forms.asp", "type": "article", "source": "W3Schools"}
                    ]}
                ]
            },
            {
                "phase": "Phase 4: Advanced Topics",
                "description": "Optimize performance and build higher-order abstractions.",
                "estimated_time": "2-3 Weeks",
                "topics": [
                    { "id": "react-performance", "name": "useMemo, useCallback, and Memoization", "resources": [
                        {"title": "useMemo Hook Reference", "url": "https://react.dev/reference/react/useMemo", "type": "documentation", "source": "React Docs"},
                        {"title": "React useMemo Hook", "url": "https://www.geeksforgeeks.org/react-js-usememo-hook/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "React Memo - W3Schools", "url": "https://www.w3schools.com/react/react_memo.asp", "type": "article", "source": "W3Schools"}
                    ]},
                    { "id": "react-patterns", "name": "Custom Hooks and HOCs", "resources": [
                        {"title": "Reusing Logic with Custom Hooks", "url": "https://react.dev/learn/reusing-logic-with-custom-hooks", "type": "documentation", "source": "React Docs"},
                        {"title": "React Custom Hooks", "url": "https://www.geeksforgeeks.org/reactjs-custom-hooks/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "React Custom Hooks - W3Schools", "url": "https://www.w3schools.com/react/react_customhooks.asp", "type": "article", "source": "W3Schools"}
                    ]}
                ]
            },
            {
                "phase": "Phase 5: Real-World Projects & System Design",
                "description": "Learn meta-frameworks and build production apps.",
                "estimated_time": "Ongoing",
                "topics": [
                    { "id": "react-nextjs", "name": "React Ecosystem (Next.js)", "resources": [
                        {"title": "Next.js Official Documentation", "url": "https://nextjs.org/docs", "type": "documentation", "source": "Next.js"},
                        {"title": "Next.js Tutorial", "url": "https://www.geeksforgeeks.org/nextjs/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "The Next.js Handbook", "url": "https://www.freecodecamp.org/news/the-next-js-handbook/", "type": "article", "source": "freeCodeCamp"}
                    ]},
                    { "id": "react-testing", "name": "Testing with RTL and Jest", "resources": [
                        {"title": "React Testing Library Docs", "url": "https://testing-library.com/docs/react-testing-library/intro/", "type": "documentation", "source": "Testing Library"},
                        {"title": "Testing React Components with Jest", "url": "https://www.geeksforgeeks.org/how-to-test-react-components-using-jest/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "How to Write Unit Tests in React", "url": "https://www.freecodecamp.org/news/how-to-write-unit-tests-in-react/", "type": "article", "source": "freeCodeCamp"}
                    ]}
                ]
            }
        ],
        "roadmap_url": "https://roadmap.sh/react",
        "youtube_videos": [
            {
                "title": "React Course - Beginner's Tutorial",
                "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"
            },
            {
                "title": "Learn React In 30 Minutes",
                "url": "https://www.youtube.com/watch?v=hQAHSlTtcmY"
            }
        ],
        "articles": [
            {
                "title": "React Official Documentation",
                "url": "https://react.dev/"
            },
            {
                "title": "Overreacted by Dan Abramov",
                "url": "https://overreacted.io/"
            }
        ],
        "courses": [
            {
                "name": "React - The Complete Guide",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"
            },
            {
                "name": "Epic React",
                "platform": "EpicWeb",
                "url": "https://epicreact.dev/"
            }
        ],
        "practice": [
            {
                "name": "Frontend Mentor",
                "url": "https://www.frontendmentor.io/"
            },
            {
                "name": "CodeSandbox React Templates",
                "url": "https://codesandbox.io/"
            }
        ]
    },
    "python": {
        "id": "python",
        "name": "Python",
        "category": "Programming",
        "description": "Python is a high-level, interpreted, general-purpose programming language widely known for its extremely clean code readability.",
        "overview": "Python has become the undisputed king of Data Science, Artificial Intelligence, and highly rapid web development prototyping (via Django and FastAPI). Its extensive standard library and massive open-source ecosystem (PyPI) provide instant solutions for almost any domain, including system administration scripting, statistical modeling, and 3D graphics generation.",
        "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=2574&auto=format&fit=crop",
        "prerequisites": ["Basic Computer Knowledge", "Logical Thinking"],
        "career_roles": ["Data Scientist", "Backend Developer", "AI Engineer"],
        "difficulty": "beginner",
        "estimated_time": "10-14 Weeks",
        "use_cases": ["Web Backend", "Data Analysis", "Machine Learning"],
        "roadmap": [
            {
                "phase": "Phase 1: Foundations",
                "description": "Understand core Python features.",
                "estimated_time": "2-3 Weeks",
                "topics": [
                    { "id": "py-syntax", "name": "Syntax Basics & Data Types", "resources": [
                        {"title": "Python Data Types", "url": "https://www.geeksforgeeks.org/python-data-types/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Python Data Types - W3Schools", "url": "https://www.w3schools.com/python/python_datatypes.asp", "type": "article", "source": "W3Schools"},
                        {"title": "An Informal Introduction to Python", "url": "https://docs.python.org/3/tutorial/introduction.html", "type": "documentation", "source": "Python Docs"}
                    ]},
                    { "id": "py-control", "name": "Control Flow and Loops", "resources": [
                        {"title": "Loops in Python", "url": "https://www.geeksforgeeks.org/loops-in-python/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Python For Loops - W3Schools", "url": "https://www.w3schools.com/python/python_for_loops.asp", "type": "article", "source": "W3Schools"},
                        {"title": "More Control Flow Tools", "url": "https://docs.python.org/3/tutorial/controlflow.html", "type": "documentation", "source": "Python Docs"}
                    ]}
                ]
            },
            {
                "phase": "Phase 2: Core Concepts",
                "description": "Work with complex data structures and functional programming.",
                "estimated_time": "2-3 Weeks",
                "topics": [
                    { "id": "py-data-struct", "name": "Data Structures", "resources": [
                        {"title": "Python Data Structures", "url": "https://www.geeksforgeeks.org/python-data-structures/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Python Lists - W3Schools", "url": "https://www.w3schools.com/python/python_lists.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Data Structures - Python Docs", "url": "https://docs.python.org/3/tutorial/datastructures.html", "type": "documentation", "source": "Python Docs"}
                    ]},
                    { "id": "py-functions", "name": "Functions and Modules", "resources": [
                        {"title": "Python Functions", "url": "https://www.geeksforgeeks.org/python-functions/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Python Functions - W3Schools", "url": "https://www.w3schools.com/python/python_functions.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Defining Your Own Python Function", "url": "https://realpython.com/defining-your-own-python-function/", "type": "article", "source": "Real Python"}
                    ]}
                ]
            },
            {
                "phase": "Phase 3: Data Structures / Core Techniques",
                "description": "Learn standard paradigms.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "py-oop", "name": "Object-Oriented Programming", "resources": [
                        {"title": "Python OOPs Concepts", "url": "https://www.geeksforgeeks.org/python-oops-concepts/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Python Classes - W3Schools", "url": "https://www.w3schools.com/python/python_classes.asp", "type": "article", "source": "W3Schools"},
                        {"title": "OOP in Python 3", "url": "https://realpython.com/python3-object-oriented-programming/", "type": "article", "source": "Real Python"}
                    ]},
                    { "id": "py-error", "name": "Error Handling and Exceptions", "resources": [
                        {"title": "Python Exception Handling", "url": "https://www.geeksforgeeks.org/python-exception-handling/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Python Try Except - W3Schools", "url": "https://www.w3schools.com/python/python_try_except.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Errors and Exceptions", "url": "https://docs.python.org/3/tutorial/errors.html", "type": "documentation", "source": "Python Docs"}
                    ]}
                ]
            },
            {
                "phase": "Phase 4: Advanced Topics",
                "description": "Write Pythonic, scalable code.",
                "estimated_time": "2-3 Weeks",
                "topics": [
                    { "id": "py-adv", "name": "Advanced (Decorators, Generators)", "resources": [
                        {"title": "Decorators in Python", "url": "https://www.geeksforgeeks.org/decorators-in-python/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Primer on Python Decorators", "url": "https://realpython.com/primer-on-python-decorators/", "type": "article", "source": "Real Python"},
                        {"title": "Python Generators", "url": "https://www.freecodecamp.org/news/python-generators/", "type": "article", "source": "freeCodeCamp"}
                    ]},
                    { "id": "py-memory", "name": "Memory Management", "resources": [
                        {"title": "Memory Management in Python", "url": "https://www.geeksforgeeks.org/memory-management-in-python/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Python Memory Management", "url": "https://realpython.com/python-memory-management/", "type": "article", "source": "Real Python"}
                    ]}
                ]
            },
            {
                "phase": "Phase 5: Real-World Projects & System Design",
                "description": "Create deployable packages.",
                "estimated_time": "1-2 Weeks",
                "topics": [
                    { "id": "py-packages", "name": "Package Managers (pip, poetry)", "resources": [
                        {"title": "pip - Python Package Installer", "url": "https://pip.pypa.io/en/stable/", "type": "documentation", "source": "PyPA"},
                        {"title": "Python Modules and Packages", "url": "https://realpython.com/python-modules-packages/", "type": "article", "source": "Real Python"},
                        {"title": "Python pip", "url": "https://www.geeksforgeeks.org/python-pip/", "type": "article", "source": "GeeksforGeeks"}
                    ]},
                    { "id": "py-api", "name": "Building APIs (FastAPI/Flask)", "resources": [
                        {"title": "FastAPI Official Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "documentation", "source": "FastAPI"},
                        {"title": "Flask Tutorial", "url": "https://www.geeksforgeeks.org/flask-tutorial/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "REST APIs with Flask and Python", "url": "https://www.freecodecamp.org/news/rest-api-tutorial-rest-client-rest-service-and-api-calls-explained-with-code-examples/", "type": "article", "source": "freeCodeCamp"}
                    ]}
                ]
            }
        ],
        "roadmap_url": "https://roadmap.sh/python",
        "youtube_videos": [
            {
                "title": "Python for Beginners - Full Course",
                "url": "https://www.youtube.com/watch?v=eWRfhZUzrAc"
            },
            {
                "title": "Advanced Python in 1 Hour",
                "url": "https://www.youtube.com/watch?v=vVj_0yX-x8w"
            }
        ],
        "articles": [
            {
                "title": "Real Python Tutorials",
                "url": "https://realpython.com/"
            },
            {
                "title": "The Hitchhiker's Guide to Python",
                "url": "https://docs.python-guide.org/"
            }
        ],
        "courses": [
            {
                "name": "100 Days of Code: Python Pro",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/100-days-of-code/"
            },
            {
                "name": "Python for Everybody",
                "platform": "Coursera",
                "url": "https://www.coursera.org/"
            }
        ],
        "practice": [
            {
                "name": "LeetCode Python",
                "url": "https://leetcode.com/studyplan/programming-skills/"
            },
            {
                "name": "HackerRank Python",
                "url": "https://www.hackerrank.com/domains/python"
            }
        ]
    },
    "java": {
        "id": "java",
        "name": "Java",
        "category": "Programming",
        "description": "Java is an object-oriented, heavily typed language known for its 'write once, run anywhere' capability on the JVM.",
        "overview": "Java is the backbone of massive enterprise architectures, Android application development, and large-scale data processing systems. Learning Java involves deeply understanding the Java Virtual Machine (JVM) internals, robust design patterns, thread management, and the massive Spring framework ecosystem for enterprise web services.",
        "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop",
        "prerequisites": ["OOP Understanding", "Basic Data Structures"],
        "career_roles": ["Enterprise Developer", "Android Developer", "Backend Engineer"],
        "difficulty": "intermediate",
        "estimated_time": "14-18 Weeks",
        "use_cases": ["Large-scale Systems", "Android Apps", "Financial Systems"],
        "roadmap": [
            {
                "phase": "Phase 1: Foundations",
                "description": "Learn the Java ecosystem.",
                "estimated_time": "2-3 Weeks",
                "topics": [
                    { "id": "java-jvm", "name": "JVM Architecture", "resources": [
                        {"title": "JVM Architecture", "url": "https://www.geeksforgeeks.org/jvm-works-jvm-architecture/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Understanding JVM Internals", "url": "https://www.baeldung.com/jvm-internals", "type": "article", "source": "Baeldung"},
                        {"title": "JVM - W3Schools", "url": "https://www.w3schools.in/java/jvm-java-virtual-machine", "type": "article", "source": "W3Schools"}
                    ]},
                    { "id": "java-syntax", "name": "Java Syntax & OOP", "resources": [
                        {"title": "Java OOP Concepts", "url": "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Java OOP - W3Schools", "url": "https://www.w3schools.com/java/java_oop.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Object-Oriented Concepts - Oracle", "url": "https://docs.oracle.com/javase/tutorial/java/concepts/", "type": "documentation", "source": "Oracle Docs"}
                    ]}
                ]
            },
            {
                "phase": "Phase 2: Core Concepts",
                "description": "Mastering the standard library.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "java-collections", "name": "Collections Framework", "resources": [
                        {"title": "Java Collections Framework", "url": "https://www.geeksforgeeks.org/collections-in-java-2/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Java Collections - Baeldung", "url": "https://www.baeldung.com/java-collections", "type": "article", "source": "Baeldung"},
                        {"title": "Java ArrayList - W3Schools", "url": "https://www.w3schools.com/java/java_arraylist.asp", "type": "article", "source": "W3Schools"}
                    ]},
                    { "id": "java-exceptions", "name": "Exception Handling", "resources": [
                        {"title": "Exceptions in Java", "url": "https://www.geeksforgeeks.org/exceptions-in-java/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Java Try Catch - W3Schools", "url": "https://www.w3schools.com/java/java_try_catch.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Exception Handling in Java - Baeldung", "url": "https://www.baeldung.com/java-exceptions", "type": "article", "source": "Baeldung"}
                    ]}
                ]
            },
            {
                "phase": "Phase 3: Data Structures / Core Techniques",
                "description": "Advanced Java features.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "java-multithread", "name": "Multi-threading", "resources": [
                        {"title": "Multithreading in Java", "url": "https://www.geeksforgeeks.org/multithreading-in-java/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Java Threads - W3Schools", "url": "https://www.w3schools.com/java/java_threads.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Java Concurrency - Baeldung", "url": "https://www.baeldung.com/java-concurrency", "type": "article", "source": "Baeldung"}
                    ]},
                    { "id": "java-io", "name": "File I/O and NIO", "resources": [
                        {"title": "File Handling in Java", "url": "https://www.geeksforgeeks.org/file-handling-in-java/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Java Files - W3Schools", "url": "https://www.w3schools.com/java/java_files.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Java NIO2 File API - Baeldung", "url": "https://www.baeldung.com/java-nio-2-file-api", "type": "article", "source": "Baeldung"}
                    ]}
                ]
            },
            {
                "phase": "Phase 4: Advanced Topics",
                "description": "Modern Java constructs.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "java-streams", "name": "Java Streams & Lambdas", "resources": [
                        {"title": "Stream API in Java", "url": "https://www.geeksforgeeks.org/stream-in-java/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Java Lambda - W3Schools", "url": "https://www.w3schools.com/java/java_lambda.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Java 8 Streams - Baeldung", "url": "https://www.baeldung.com/java-8-streams", "type": "article", "source": "Baeldung"}
                    ]},
                    { "id": "java-generics", "name": "Generics and Annotations", "resources": [
                        {"title": "Generics in Java", "url": "https://www.geeksforgeeks.org/generics-in-java/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Java Generics - Baeldung", "url": "https://www.baeldung.com/java-generics", "type": "article", "source": "Baeldung"},
                        {"title": "Generics Tutorial - Oracle", "url": "https://docs.oracle.com/javase/tutorial/java/generics/", "type": "documentation", "source": "Oracle Docs"}
                    ]}
                ]
            },
            {
                "phase": "Phase 5: Real-World Projects & System Design",
                "description": "Build tools and enterprise architectures.",
                "estimated_time": "Ongoing",
                "topics": [
                    { "id": "java-build", "name": "Build Tools (Maven/Gradle)", "resources": [
                        {"title": "Introduction to Apache Maven", "url": "https://www.geeksforgeeks.org/introduction-apache-maven-build-automation-tool-java-projects/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Maven Guide - Baeldung", "url": "https://www.baeldung.com/maven-guide", "type": "article", "source": "Baeldung"},
                        {"title": "Gradle Guides", "url": "https://gradle.org/guides/", "type": "documentation", "source": "Gradle"}
                    ]},
                    { "id": "java-spring", "name": "Spring Boot Basics", "resources": [
                        {"title": "Spring Boot Tutorial", "url": "https://www.geeksforgeeks.org/spring-boot/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Spring Boot - Baeldung", "url": "https://www.baeldung.com/spring-boot", "type": "article", "source": "Baeldung"},
                        {"title": "Spring Boot Getting Started", "url": "https://spring.io/guides/gs/spring-boot", "type": "documentation", "source": "Spring.io"}
                    ]}
                ]
            }
        ],
        "roadmap_url": "https://roadmap.sh/java",
        "youtube_videos": [
            {
                "title": "Java Tutorial for Beginners",
                "url": "https://www.youtube.com/watch?v=eIrMbAQSU34"
            }
        ],
        "articles": [
            {
                "title": "Baeldung - Java Guides",
                "url": "https://www.baeldung.com/"
            }
        ],
        "courses": [
            {
                "name": "Java Programming Masterclass",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "HackerRank Java",
                "url": "https://www.hackerrank.com/domains/java"
            },
            {
                "name": "CodingBat Java",
                "url": "https://codingbat.com/java"
            }
        ]
    },
    "cyber_security": {
        "id": "cyber_security",
        "name": "Cyber Security",
        "category": "Cybersecurity",
        "description": "Discover how to protect computer systems, networks, and confidential data from vicious digital attacks and vulnerabilities.",
        "overview": "Cyber security covers everything from Ethical Hacking, Penetration Testing, and Vulnerability Assessment to Risk Management and Cryptography. You will learn to think like an attacker in order to build impenetrable defense mechanisms. Essential topics include recognizing OWASP Top 10 vulnerabilities, deploying firewalls, network monitoring, and implementing robust Zero Trust architecture schemas.",
        "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670&auto=format&fit=crop",
        "prerequisites": ["Networking Basics", "Linux OS"],
        "career_roles": ["Security Analyst", "Penetration Tester", "Security Engineer"],
        "difficulty": "advanced",
        "estimated_time": "16-24 Weeks",
        "use_cases": ["Ethical Hacking", "Vulnerability Assessment", "Cloud Security"],
        "roadmap": [
            {
                "phase": "Phase 1: Foundations",
                "description": "The fundamentals of networks and systems.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "cy-it", "name": "IT Fundamentals (Networking, OS)", "resources": [
                        {"title": "Computer Networking Basics", "url": "https://www.geeksforgeeks.org/basics-computer-networking/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Networking Fundamentals", "url": "https://www.freecodecamp.org/news/computer-networks-and-how-to-actually-understand-them/", "type": "article", "source": "freeCodeCamp"},
                        {"title": "CompTIA A+ Study Guide", "url": "https://www.comptia.org/training/books/a-study-guide", "type": "documentation", "source": "CompTIA"}
                    ]},
                    { "id": "cy-linux", "name": "Linux Security Basics", "resources": [
                        {"title": "Linux Security Tutorial", "url": "https://www.geeksforgeeks.org/linux-security/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Linux Fundamentals - TryHackMe", "url": "https://tryhackme.com/room/linuxfundamentalspart1", "type": "practice", "source": "TryHackMe"},
                        {"title": "Linux Basics for Hackers", "url": "https://www.freecodecamp.org/news/linux-basics/", "type": "article", "source": "freeCodeCamp"}
                    ]}
                ]
            },
            {
                "phase": "Phase 2: Core Concepts",
                "description": "Securing local and wide-area networks.",
                "estimated_time": "4-5 Weeks",
                "topics": [
                    { "id": "cy-netsec", "name": "Network Security", "resources": [
                        {"title": "Network Security Fundamentals", "url": "https://www.geeksforgeeks.org/network-security/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Network Security Module", "url": "https://tryhackme.com/module/network-security", "type": "practice", "source": "TryHackMe"},
                        {"title": "Network Security - W3Schools", "url": "https://www.w3schools.in/cyber-security/network-security", "type": "article", "source": "W3Schools"}
                    ]},
                    { "id": "cy-syssec", "name": "Systems Security", "resources": [
                        {"title": "Operating System Security", "url": "https://www.geeksforgeeks.org/operating-system-security/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "System Security - Cybrary", "url": "https://www.cybrary.it/", "type": "course", "source": "Cybrary"},
                        {"title": "What Is System Security?", "url": "https://www.freecodecamp.org/news/what-is-system-security/", "type": "article", "source": "freeCodeCamp"}
                    ]}
                ]
            },
            {
                "phase": "Phase 3: Data Structures / Core Techniques",
                "description": "Protecting data and communications.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "cy-crypto", "name": "Cryptography", "resources": [
                        {"title": "Cryptography Introduction", "url": "https://www.geeksforgeeks.org/cryptography-introduction/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Cryptography Explained", "url": "https://www.freecodecamp.org/news/what-is-cryptography/", "type": "article", "source": "freeCodeCamp"},
                        {"title": "Crypto 101 Handbook", "url": "https://www.crypto101.io/", "type": "documentation", "source": "Crypto 101"}
                    ]},
                    { "id": "cy-iam", "name": "Identity and Access Management", "resources": [
                        {"title": "Access Control Models", "url": "https://www.geeksforgeeks.org/access-control-models-in-computer-security/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "IAM Fundamentals - AWS", "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html", "type": "documentation", "source": "AWS"},
                        {"title": "Authentication vs Authorization", "url": "https://www.freecodecamp.org/news/whats-the-difference-between-authentication-and-authorisation/", "type": "article", "source": "freeCodeCamp"}
                    ]}
                ]
            },
            {
                "phase": "Phase 4: Advanced Topics",
                "description": "Offensive and defensive measures.",
                "estimated_time": "4-6 Weeks",
                "topics": [
                    { "id": "cy-pentest", "name": "Penetration Testing", "resources": [
                        {"title": "Penetration Testing Tutorial", "url": "https://www.geeksforgeeks.org/penetration-testing/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Intro to Offensive Security", "url": "https://tryhackme.com/room/introtooffensivesecurity", "type": "practice", "source": "TryHackMe"},
                        {"title": "OWASP Testing Guide", "url": "https://owasp.org/www-project-web-security-testing-guide/", "type": "documentation", "source": "OWASP"}
                    ]},
                    { "id": "cy-soc", "name": "Security Operations Center (SOC)", "resources": [
                        {"title": "What is a SOC?", "url": "https://www.geeksforgeeks.org/what-is-soc-security-operation-center/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "SOC Level 1 Path", "url": "https://tryhackme.com/path/outline/soclevel1", "type": "practice", "source": "TryHackMe"},
                        {"title": "Blue Team Handbook", "url": "https://www.sans.org/blue-team/", "type": "documentation", "source": "SANS"}
                    ]}
                ]
            },
            {
                "phase": "Phase 5: Real-World Projects & System Design",
                "description": "Planning and responding.",
                "estimated_time": "2-5 Weeks",
                "topics": [
                    { "id": "cy-risk", "name": "Risk Management", "resources": [
                        {"title": "Cyber Security Risk Management", "url": "https://www.geeksforgeeks.org/risk-management-in-information-security/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "NIST Risk Management Framework", "url": "https://csrc.nist.gov/projects/risk-management/about-rmf", "type": "documentation", "source": "NIST"},
                        {"title": "Risk Assessment Guide", "url": "https://www.freecodecamp.org/news/what-is-risk-management-in-cybersecurity/", "type": "article", "source": "freeCodeCamp"}
                    ]},
                    { "id": "cy-incident", "name": "Incident Response and Forensics", "resources": [
                        {"title": "Incident Response Process", "url": "https://www.geeksforgeeks.org/incident-response-plan/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Digital Forensics Intro", "url": "https://tryhackme.com/room/introdigitalforensics", "type": "practice", "source": "TryHackMe"},
                        {"title": "NIST Incident Handling Guide", "url": "https://csrc.nist.gov/pubs/sp/800/61/r2/final", "type": "documentation", "source": "NIST"}
                    ]}
                ]
            }
        ],
        "roadmap_url": "https://roadmap.sh/cyber-security",
        "youtube_videos": [
            {
                "title": "Cybersecurity Full Course for Beginner",
                "url": "https://www.youtube.com/watch?v=U_P23SqJaDc"
            }
        ],
        "articles": [
            {
                "title": "OWASP Top Ten",
                "url": "https://owasp.org/www-project-top-ten/"
            }
        ],
        "courses": [
            {
                "name": "CompTIA Security+ Certification",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "Hack The Box",
                "url": "https://www.hackthebox.com/"
            },
            {
                "name": "TryHackMe",
                "url": "https://tryhackme.com/"
            }
        ]
    },
    "cpp": {
        "id": "cpp",
        "name": "C++",
        "category": "Programming",
        "description": "C++ is a highly performant, compiled language frequently utilized in game engines, high-frequency trading, and operating systems.",
        "overview": "C++ provides developers with extensive control over system resources and memory allocation. It builds upon C by adding object-oriented features, templates, and the powerful Standard Template Library (STL). Professional game development (Unreal Engine), financial systems, and performance-critical software architectures heavily rely on the raw execution speed generated uniquely by C++ binaries.",
        "image_url": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
        "prerequisites": ["Basic Programming", "Memory Concepts"],
        "career_roles": ["Game Developer", "Systems Programmer", "Quantitative Developer"],
        "difficulty": "advanced",
        "estimated_time": "12-16 Weeks",
        "use_cases": ["Game Engines", "High Performance Computing", "Embedded Systems"],
        "roadmap": [
            {
                "phase": "Phase 1: Foundations",
                "description": "Starting with C++ basics.",
                "estimated_time": "2-3 Weeks",
                "topics": [
                    { "id": "cpp-syntax", "name": "Basic Syntax and Pointers", "resources": [
                        {"title": "C++ Pointers", "url": "https://www.geeksforgeeks.org/cpp-pointers/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "C++ Pointers - W3Schools", "url": "https://www.w3schools.com/cpp/cpp_pointers.asp", "type": "article", "source": "W3Schools"},
                        {"title": "LearnCpp - Introduction", "url": "https://www.learncpp.com/cpp-tutorial/introduction-to-cplusplus/", "type": "documentation", "source": "LearnCpp"}
                    ]},
                    { "id": "cpp-refs", "name": "References and Memory model", "resources": [
                        {"title": "References in C++", "url": "https://www.geeksforgeeks.org/references-in-cpp/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "C++ References - W3Schools", "url": "https://www.w3schools.com/cpp/cpp_references.asp", "type": "article", "source": "W3Schools"},
                        {"title": "C++ Memory Model", "url": "https://en.cppreference.com/w/cpp/language/memory_model", "type": "documentation", "source": "cppreference"}
                    ]}
                ]
            },
            {
                "phase": "Phase 2: Core Concepts",
                "description": "Understanding objects.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "cpp-oop", "name": "Object Oriented Programming", "resources": [
                        {"title": "OOP in C++", "url": "https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "C++ OOP - W3Schools", "url": "https://www.w3schools.com/cpp/cpp_oop.asp", "type": "article", "source": "W3Schools"},
                        {"title": "OOP Concepts - LearnCpp", "url": "https://www.learncpp.com/cpp-tutorial/welcome-to-object-oriented-programming/", "type": "documentation", "source": "LearnCpp"}
                    ]},
                    { "id": "cpp-memory", "name": "Memory Management (New/Delete, Smart Pointers)", "resources": [
                        {"title": "Smart Pointers in C++", "url": "https://www.geeksforgeeks.org/smart-pointers-cpp/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Dynamic Memory in C++", "url": "https://www.w3schools.com/cpp/cpp_new.asp", "type": "article", "source": "W3Schools"},
                        {"title": "C++ Smart Pointers", "url": "https://en.cppreference.com/w/cpp/memory", "type": "documentation", "source": "cppreference"}
                    ]}
                ]
            },
            {
                "phase": "Phase 3: Data Structures / Core Techniques",
                "description": "Using the standard library.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "cpp-stl", "name": "Standard Template Library (STL)", "resources": [
                        {"title": "C++ STL Tutorial", "url": "https://www.geeksforgeeks.org/the-c-standard-template-library-stl/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "C++ STL Overview", "url": "https://www.freecodecamp.org/news/the-c-plus-plus-standard-template-library-stl/", "type": "article", "source": "freeCodeCamp"},
                        {"title": "STL Containers Reference", "url": "https://en.cppreference.com/w/cpp/container", "type": "documentation", "source": "cppreference"}
                    ]},
                    { "id": "cpp-algo", "name": "Algorithms and Iterators", "resources": [
                        {"title": "C++ STL Algorithms", "url": "https://www.geeksforgeeks.org/c-magicians-stl-algorithms/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Iterators in C++", "url": "https://www.geeksforgeeks.org/iterators-c-stl/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Algorithm Library Reference", "url": "https://en.cppreference.com/w/cpp/algorithm", "type": "documentation", "source": "cppreference"}
                    ]}
                ]
            },
            {
                "phase": "Phase 4: Advanced Topics",
                "description": "Writing faster, generic code.",
                "estimated_time": "3-4 Weeks",
                "topics": [
                    { "id": "cpp-concurrency", "name": "Concurrency", "resources": [
                        {"title": "Multithreading in C++", "url": "https://www.geeksforgeeks.org/multithreading-in-cpp/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "C++ Concurrency", "url": "https://en.cppreference.com/w/cpp/thread", "type": "documentation", "source": "cppreference"},
                        {"title": "C++ Threads Tutorial", "url": "https://www.freecodecamp.org/news/how-to-use-threads-in-cplusplus/", "type": "article", "source": "freeCodeCamp"}
                    ]},
                    { "id": "cpp-templates", "name": "Template Metaprogramming", "resources": [
                        {"title": "Templates in C++", "url": "https://www.geeksforgeeks.org/templates-cpp/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "C++ Templates - W3Schools", "url": "https://www.w3schools.com/cpp/cpp_templates.asp", "type": "article", "source": "W3Schools"},
                        {"title": "Templates Reference", "url": "https://en.cppreference.com/w/cpp/language/templates", "type": "documentation", "source": "cppreference"}
                    ]}
                ]
            },
            {
                "phase": "Phase 5: Real-World Projects & System Design",
                "description": "Deploying C++ features.",
                "estimated_time": "Ongoing",
                "topics": [
                    { "id": "cpp-design", "name": "Design Patterns in C++", "resources": [
                        {"title": "Design Patterns in C++", "url": "https://www.geeksforgeeks.org/design-patterns-set-1-introduction/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "Refactoring.Guru - Design Patterns", "url": "https://refactoring.guru/design-patterns/cpp", "type": "documentation", "source": "Refactoring Guru"},
                        {"title": "Design Patterns for C++ Developers", "url": "https://www.freecodecamp.org/news/the-basic-design-patterns-all-developers-need-to-know/", "type": "article", "source": "freeCodeCamp"}
                    ]},
                    { "id": "cpp-make", "name": "CMake and Build Systems", "resources": [
                        {"title": "CMake Tutorial", "url": "https://www.geeksforgeeks.org/cmake-tutorial/", "type": "article", "source": "GeeksforGeeks"},
                        {"title": "CMake Official Tutorial", "url": "https://cmake.org/cmake/help/latest/guide/tutorial/", "type": "documentation", "source": "CMake.org"},
                        {"title": "Modern CMake Guide", "url": "https://cliutils.gitlab.io/modern-cmake/", "type": "documentation", "source": "Modern CMake"}
                    ]}
                ]
            }
        ],
        "roadmap_url": "https://roadmap.sh/cpp",
        "youtube_videos": [
            {
                "title": "C++ Programming Full Course",
                "url": "https://www.youtube.com/watch?v=vLnPwxZdW4Y"
            }
        ],
        "articles": [
            {
                "title": "C++ Reference",
                "url": "https://en.cppreference.com/w/"
            }
        ],
        "courses": [
            {
                "name": "Beginning C++ Programming",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "LeetCode C++",
                "url": "https://leetcode.com/"
            },
            {
                "name": "HackerRank C++",
                "url": "https://www.hackerrank.com/domains/cpp"
            }
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
            {
                "title": "C# Full Course for Beginners",
                "url": "https://www.youtube.com/watch?v=GhQdlIFylQ8"
            }
        ],
        "articles": [
            {
                "title": "Microsoft C# Documentation",
                "url": "https://learn.microsoft.com/en-us/dotnet/csharp/"
            }
        ],
        "courses": [
            {
                "name": "C# Masterclass",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "Codewars C#",
                "url": "https://www.codewars.com/"
            }
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
            {
                "title": "Rust Crash Course",
                "url": "https://www.youtube.com/watch?v=zF34dRivLOw"
            }
        ],
        "articles": [
            {
                "title": "The Rust Programming Language Book",
                "url": "https://doc.rust-lang.org/book/"
            }
        ],
        "courses": [
            {
                "name": "Ultimate Rust Crash Course",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "Rustlings",
                "url": "https://github.com/rust-lang/rustlings"
            }
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
            {
                "title": "PHP Programming Course",
                "url": "https://www.youtube.com/watch?v=OK_JCtrrv-c"
            }
        ],
        "articles": [
            {
                "title": "PHP The Right Way",
                "url": "https://phptherightway.com/"
            }
        ],
        "courses": [
            {
                "name": "PHP for Beginners",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "Exercism PHP",
                "url": "https://exercism.org/tracks/php"
            }
        ]
    },
    "ruby": {
        "id": "ruby",
        "name": "Ruby",
        "category": "Programming",
        "description": "Ruby is a dynamic, open-source programming language with a focus on absolute simplicity and developer productivity.",
        "overview": "Ruby is designed specifically to make programming a joyful experience, famously utilizing the paradigm that 'everything is an object'. While capable of being used entirely on its own, Ruby reached widespread global dominance due to Ruby on Rails\u2014a highly opinionated, full-stack MVC framework powering major tech giants like GitHub, Shopify, and Airbnb with rapid iterations.",
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
            {
                "title": "Ruby Programming Language - Full Course",
                "url": "https://www.youtube.com/watch?v=t_ispmWmdjY"
            }
        ],
        "articles": [
            {
                "title": "Ruby Documentation",
                "url": "https://ruby-doc.org/"
            }
        ],
        "courses": [
            {
                "name": "Complete Ruby on Rails Developer",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "Codewars Ruby",
                "url": "https://www.codewars.com/"
            }
        ]
    },
    "swift": {
        "id": "swift",
        "name": "Swift",
        "category": "Mobile Development",
        "description": "Swift is an incredibly robust and intuitive modern programming language created by Apple for building high-quality apps across iOS, Mac, Apple TV, and Apple Watch.",
        "overview": "Replacing Objective-C, Swift is designed to be completely safe against errors (preventing None pointer exceptions) while being blistering fast. The ecosystem integrates heavily with Xcode, utilizing declarative UI technologies like SwiftUI to build gorgeous, deeply integrated applications specifically for Apple's monolithic hardware ecosystem.",
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
            {
                "title": "Swift Programming Course for Beginners",
                "url": "https://www.youtube.com/watch?v=8Xg7E9shq0U"
            }
        ],
        "articles": [
            {
                "title": "Swift Documentation",
                "url": "https://docs.swift.org/swift-book/"
            }
        ],
        "courses": [
            {
                "name": "iOS App Development Course",
                "platform": "Udemy",
                "url": "https://www.udemy.com/"
            }
        ],
        "practice": [
            {
                "name": "Hacking with Swift",
                "url": "https://www.hackingwithswift.com/"
            }
        ]
    }
}

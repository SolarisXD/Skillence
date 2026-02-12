# 🚀 AI Skillence - AI-Powered Career Intelligence Platform

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Transforming career development through cutting-edge artificial intelligence, data-driven insights, and personalized recommendations.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

AI Skillence is a comprehensive career intelligence platform that leverages artificial intelligence to help professionals make data-driven career decisions. The platform combines machine learning, real-time market insights, and personalized recommendations to unlock career potential and achieve sustainable growth.

### Key Highlights

- 🤖 **AI-Powered Resume Analysis** - Get instant feedback on your resume with detailed scoring
- 📊 **Career Path Recommendations** - Personalized career roadmaps based on your skills and goals
- 💰 **Salary Prediction** - ML-powered salary predictions with 72%+ accuracy
- 📈 **Job Market Trends** - Real-time insights into industry trends and demand
- 💬 **AI Career Chatbot** - 24/7 intelligent career guidance assistant
- 🎯 **Job Offer Evaluator** - Compare and evaluate job offers with data-driven insights
- 📚 **Learning Roadmaps** - Personalized skill development paths

## ✨ Features

### For Job Seekers

- **Resume Parser & Analyzer**
  - AI-powered resume parsing using Azure Document Intelligence
  - Comprehensive scoring across multiple dimensions
  - Actionable improvement suggestions

- **Career Path Recommendations**
  - Personalized career trajectory analysis
  - Skill gap identification
  - Industry-specific recommendations

- **Job Trend Analytics**
  - Real-time job market data visualization
  - Salary trends and forecasts
  - Skills demand analysis

- **AI Career Chatbot**
  - Natural language career guidance
  - Interview preparation tips
  - Career strategy recommendations

### For Career Development

- **Salary Predictor**
  - Deep learning model (72.58% accuracy)
  - Considers 24+ recognized skills
  - Market comparison analysis

- **Learning Plan Generator**
  - Customized skill development roadmaps
  - Resource recommendations
  - Progress tracking

- **Profile Dashboard**
  - Track career progress
  - Manage applications
  - Set goals and milestones

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Lucide React** - Icon library
- **CSS3** - Styling with CSS variables for theming
- **Vite** - Build tool and dev server

### Backend

- **Python 3.8+** - Core language
- **FastAPI** - High-performance web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Primary database
- **PyTorch** - Deep learning framework

### AI/ML Stack

- **PyTorch** - Neural network implementation
- **scikit-learn** - Data preprocessing and metrics
- **NumPy/Pandas** - Data manipulation
- **Azure Document Intelligence** - Resume parsing
- **Google Gemini API** - Natural language processing

### DevOps & Tools

- **Git** - Version control
- **npm/pnpm** - Package management
- **Uvicorn** - ASGI server

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Karma121221/CareerAI.git
cd CareerAI
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# - Database credentials
# - Azure Document Intelligence API key
# - Gemini API key
# - JWT secret key
```

### 3. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE career_ai;
\q

# Run migrations (if applicable)
python -m alembic upgrade head
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
# or
pnpm install

# Create .env file
cp .env.example .env

# Update .env with your backend API URL
# REACT_APP_API_URL=http://localhost:8000
```

### 5. ML Model Setup (Optional)

```bash
# Navigate to backend directory
cd ../backend

# Run the salary prediction model training
python run_salary_pipeline.py

# This will:
# - Process training data
# - Train the neural network
# - Save model checkpoints
# - Generate performance metrics
```

## 💻 Usage

### Running the Application

#### Start Backend Server

```bash
cd backend
python main.py

# Server will start at http://localhost:8000
# API docs available at http://localhost:8000/docs
```

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
# or
pnpm dev

# Application will open at http://localhost:5173
```

### Default Routes

- `/` - Landing page
- `/about` - About the platform and team
- `/blog` - Career insights and tips
- `/help-center` - FAQ and documentation
- `/contact` - Contact form
- `/status` - System status dashboard
- `/dashboard` - User dashboard (requires authentication)

## 📁 Project Structure

```
CareerAI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── About.jsx
│   │   │   ├── Blog.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── HelpCenter.jsx
│   │   │   ├── Status.jsx
│   │   │   ├── MainPage.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProfilePage/
│   │   │   ├── Dashboard/
│   │   │   ├── Career Path Recommendation/
│   │   │   ├── Chatbot/
│   │   │   ├── Job Trend/
│   │   │   └── Reflection Engine/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── career_path.py
│   │   │   ├── chatbot.py
│   │   │   ├── job_trends.py
│   │   │   ├── ml_predictions.py
│   │   │   ├── profile.py
│   │   │   └── resume.py
│   │   ├── services/
│   │   ├── models/
│   │   ├── ml/
│   │   │   ├── models/
│   │   │   ├── training/
│   │   │   ├── inference/
│   │   │   └── data/
│   │   ├── database.py
│   │   └── utils/
│   ├── main.py
│   ├── requirements.txt
│   └── run_salary_pipeline.py
├── docs/
│   ├── DEVELOPMENT_STATUS.md
│   ├── ML_IMPLEMENTATION_GUIDE.md
│   └── SALARY_PREDICTOR_README.md
└── README.md
```

## 📚 API Documentation

### Authentication

```http
POST /auth/register
POST /auth/login
POST /auth/verify-email
```

### Resume Analysis

```http
POST /resume/upload
GET /resume/analysis/{resume_id}
POST /resume/parse
```

### Career Path

```http
POST /career-path/recommend
GET /career-path/roadmap/{user_id}
```

### Job Trends

```http
GET /job-trends/market-data
GET /job-trends/salary-trends
POST /job-trends/predict-salary
```

### Chatbot

```http
POST /chatbot/chat
GET /chatbot/history/{user_id}
```

For detailed API documentation, visit `http://localhost:8000/docs` when the backend server is running.

## 📸 Screenshots

<!-- Add screenshots here -->
_Coming soon - Add your application screenshots here_

### Landing Page
![Landing Page](./docs/screenshots/landing.png)

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### Resume Analysis
![Resume Analysis](./docs/screenshots/resume-analysis.png)

### Career Recommendations
![Career Path](./docs/screenshots/career-path.png)

## 🎥 Demo

<!-- Add demo link here -->
_Live demo: [Add your deployment link here]_

## 👥 Team

This project is developed and maintained by:

### Core Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Karma121221">
        <img src="https://github.com/Karma121221.png" width="100px;" alt="Namit Rustagi"/><br />
        <sub><b>Namit Rustagi</b></sub>
      </a><br />
      <sub>Lead Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/SolarisXD">
        <img src="https://github.com/SolarisXD.png" width="100px;" alt="Rahul Gehlot"/><br />
        <sub><b>Rahul Gehlot</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Manan-S85">
        <img src="https://github.com/Manan-S85.png" width="100px;" alt="Manan"/><br />
        <sub><b>Manan</b></sub>
      </a><br />
      <sub>Backend Developer</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/RAJEEVRANJAN0001">
        <img src="https://github.com/RAJEEVRANJAN0001.png" width="100px;" alt="Rajeev Ranjan"/><br />
        <sub><b>Rajeev Ranjan Pratap Singh</b></sub>
      </a><br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/KshitizCodeHub">
        <img src="https://github.com/KshitizCodeHub.png" width="100px;" alt="Kshitiz"/><br />
        <sub><b>Kshitiz Srivastava</b></sub>
      </a><br />
      <sub>UI/UX Developer</sub>
    </td>
  </tr>
</table>

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Azure Document Intelligence for resume parsing
- Google Gemini for AI-powered chat
- O*NET for occupation data
- All our contributors and supporters

## 📧 Contact

For questions, feedback, or support:

- 📧 Email: [Add your email]
- 🌐 Website: [Add your website]
- 💼 LinkedIn: [Add LinkedIn]

## 🔗 Links

- [Documentation](./docs/README.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

<p align="center">Made with ❤️ by the AI Skillence Team</p>
<p align="center">
  <a href="https://github.com/Karma121221/CareerAI">⭐ Star us on GitHub</a> •
  <a href="#team">👥 Meet the Team</a> •
  <a href="#contributing">🤝 Contribute</a>
</p>

# 🚀 CareerAI - Intelligent Career Guidance Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D0?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/)

CareerAI is a comprehensive, AI-powered career guidance platform that helps professionals make informed career decisions through intelligent resume analysis, personalized career path recommendations, and real-time job market insights.

## ✨ Key Features

### 🎯 **AI-Powered Career Recommendations**
- Advanced career path suggestions using Google Gemini AI
- O*NET occupation database integration with 900+ career options
- Skill-based matching with technical and soft skill analysis
- Personalized scoring algorithms for career fit assessment

### 📄 **Intelligent Resume Processing**
- **Azure AI Document Intelligence** integration for accurate parsing
- Support for PDF and DOCX formats
- Automatic skill extraction and categorization
- Technical skill prioritization and matching

### 📊 **Advanced Job Trend Dashboard**
- Real-time job market analysis and visualization
- **Advanced Filtering System**: Location, industry, experience level, salary range
- **Interactive Charts**: Trend analysis, skill demand, experience distribution
- **Data Export**: CSV/JSON export with chart image generation
- **Auto-refresh capabilities** with configurable intervals

### 💼 **Job Offer Evaluation**
- Comprehensive job offer analysis
- Salary benchmarking and market comparison
- Decision-making framework with scoring metrics

### 👤 **User Profile Management**
- Secure JWT-based authentication
- Comprehensive profile creation and editing
- Skills tracking and portfolio management
- Project and experience documentation

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **Azure AI Document Intelligence** - Resume parsing and analysis
- **Google Gemini AI** - Career recommendations and insights
- **JWT Authentication** - Secure user authentication
- **Pandas/NumPy** - Data analysis and processing

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Recharts** - Interactive data visualization
- **Modern CSS** - Responsive design with animations

### AI & Data
- **O*NET Database** - Official occupation data from the U.S. Department of Labor
- **Google Gemini AI** - Advanced language model for career insights
- **Azure Cognitive Services** - Document analysis and text extraction
- **Custom ML Algorithms** - Skill matching and career scoring

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB instance
- Azure AI Document Intelligence API key
- Google Gemini AI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Karma121221/CareerAI.git
cd CareerAI
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Configuration**

Create a `.env` file in the project root:
```env
# Database
MONGODB_URL=mongodb://localhost:27017/careerai

# Authentication
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Azure AI Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-azure-endpoint
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-azure-key

# Google Gemini AI
GEMINI_API=your-gemini-api-key

# Email Configuration (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
```

### Running the Application

1. **Start the Backend**
```bash
cd backend
python main.py
```
The API will be available at `http://localhost:8000`

2. **Start the Frontend**
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:3000`

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Resume Processing
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume/analysis/{user_id}` - Get resume analysis
- `POST /api/resume/test-upload` - Test upload endpoint

### Career Recommendations
- `POST /api/career-path/recommend` - Get career recommendations
- `GET /api/career-path/occupations` - List available occupations

### Job Trends
- `GET /api/job-trends/data` - Get job trend data
- `GET /api/job-trends/analysis` - Get trend analysis
- `POST /api/job-trends/clear-cache` - Clear data cache
- `GET /api/job-trends/export/csv` - Export data as CSV
- `GET /api/job-trends/export/json` - Export data as JSON

### Profile Management
- `GET /api/profile/me` - Get user profile
- `PUT /api/profile/update` - Update user profile

## 🏗️ Project Structure

```
CareerAI/
├── backend/                     # FastAPI backend application
│   ├── main.py                 # Application entry point
│   ├── requirements.txt        # Python dependencies
│   └── app/
│       ├── database.py         # MongoDB connection
│       ├── models/             # Pydantic data models
│       ├── routers/            # API route handlers
│       ├── services/           # Business logic services
│       └── utils/              # Utility functions
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── styles/            # CSS styling
│   │   └── utils/             # Frontend utilities
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite configuration
├── Docs/                       # Project documentation
├── enhanced_recommender.py     # Career recommendation engine
└── onet_prepare.py            # O*NET data preparation
```

## 🎯 Core Features Deep Dive

### Career Recommendation Algorithm
The system uses a sophisticated multi-factor scoring algorithm:
- **Technical Skills Matching**: Analyzes programming languages, frameworks, and tools
- **Industry Alignment**: Matches experience with career trajectories
- **Hot Technology Bonus**: Prioritizes in-demand skills (AI, ML, Cloud, etc.)
- **O*NET Integration**: Leverages official occupation data for accuracy

### Job Trend Analytics
- **Real-time Data Processing**: Dynamic job market analysis
- **Advanced Filtering**: Multi-dimensional data filtering
- **Export Capabilities**: Professional reporting features
- **Caching System**: Optimized performance with configurable refresh

### Resume Intelligence
- **Multi-format Support**: PDF and DOCX processing
- **Context-aware Parsing**: Understanding of resume structure
- **Skill Categorization**: Automatic technical vs. soft skill classification
- **Experience Analysis**: Career progression insights

## 🚦 Usage Examples

### Getting Career Recommendations
```python
# After authentication and profile setup
response = requests.post('http://localhost:8000/api/career-path/recommend', 
                        headers={'Authorization': f'Bearer {token}'})
recommendations = response.json()['recommendations']
```

### Uploading a Resume
```javascript
const formData = new FormData();
formData.append('file', resumeFile);

const response = await fetch('/api/resume/upload', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`
    },
    body: formData
});
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
npm run test
```

### Code Style
- Backend: Follow PEP 8 guidelines
- Frontend: ESLint configuration included
- Use meaningful variable names and comprehensive documentation

## 🚀 Deployment

### Backend Deployment (Docker)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

## 🛣️ Roadmap

### Current Phase (Q1 2025)
- ✅ Core career recommendation engine
- ✅ Resume parsing with Azure AI
- ✅ Job trend dashboard
- ✅ User authentication system

### Upcoming Features
- 🔄 Interview preparation module
- 🔄 Skill gap analysis
- 🔄 Learning path recommendations
- 🔄 Company culture matching
- 🔄 Salary negotiation insights
- 🔄 Network analysis and recommendations

### Future Enhancements
- 📋 Mobile application
- 📋 Advanced AI coaching
- 📋 Integration with job boards
- 📋 Video interview analysis
- 📋 Career mentor matching

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- [Karma121221]      : (https://github.com/Karma121221)
- [SolarisXD]        : (https://github.com/SolarisXD)
- [Manan-S85]        : (https://github.com/Manan-S85)
- [RAJEEVRANJAN0001] : (https://github.com/RAJEEVRANJAN0001)

## 🤝 Contributors

We thank the following people for their contributions to CareerAI:

### Top Contributors
[![Contributors](https://contrib.rocks/image?repo=Karma121221/CareerAI)](https://github.com/Karma121221/CareerAI/graphs/contributors)

### How to Contribute

We welcome contributions from developers of all skill levels! Here's how you can contribute:

1. **🍴 Fork the Repository**
   ```bash
   git clone https://github.com/Karma121221/CareerAI.git
   ```

2. **🌿 Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **💻 Make Your Changes**
   - Follow our coding standards
   - Add tests for new features
   - Update documentation as needed

4. **🧪 Test Your Changes**
   ```bash
   # Backend tests
   cd backend && python -m pytest
   
   # Frontend tests
   cd frontend && npm test
   ```

5. **📝 Commit and Push**
   ```bash
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **🔄 Create a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Wait for code review and feedback

### Areas We Need Help With

- 🎨 **UI/UX Design**: Improving user interface and experience
- 🤖 **AI/ML**: Enhancing recommendation algorithms
- 📊 **Data Analysis**: Expanding job market insights
- 🧪 **Testing**: Writing comprehensive test suites
- 📚 **Documentation**: Improving guides and tutorials
- 🌐 **Localization**: Adding support for multiple languages

### Contributor Guidelines

- **Code Style**: Follow PEP 8 for Python, ESLint for JavaScript
- **Commit Messages**: Use conventional commit format
- **Documentation**: Update README and docs for new features
- **Testing**: Maintain test coverage above 80%
- **Issues**: Use GitHub issues for bug reports and feature requests

## 🙏 Acknowledgments

- **O*NET**: For providing comprehensive occupation data
- **Azure AI**: For advanced document intelligence capabilities
- **Google Gemini**: For powerful AI-driven insights
- **Open Source Community**: For the amazing tools and libraries

## 📞 Support

- 📧 Email: [your-email@domain.com]
- 🐛 Issues: [GitHub Issues](https://github.com/Karma121221/CareerAI/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Karma121221/CareerAI/discussions)

---

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the CareerAI Team
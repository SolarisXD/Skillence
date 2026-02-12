from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional, List, Dict, Any
from app.services.job_trend_service import JobTrendService
import logging
import pandas as pd
import io
import json
import google.generativeai as genai
import os

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize the job trend service
job_trend_service = JobTrendService()

@router.get("/jobs")
async def get_available_jobs():
    """Get list of available job titles for analysis"""
    try:
        jobs = await job_trend_service.get_available_jobs()
        return {"jobs": jobs, "total": len(jobs)}
    except Exception as e:
        logger.error(f"Error fetching available jobs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch available jobs")

@router.get("/analysis/{job_title}")
async def get_job_analysis(
    job_title: str,
    time_range: Optional[str] = Query("6m", description="Time range: 3m, 6m, 1y, all"),
    location: Optional[str] = Query(None, description="Filter by location"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level"),
    company_size: Optional[str] = Query(None, description="Filter by company size"),
    employment_type: Optional[str] = Query(None, description="Filter by employment type"),
    salary_min: Optional[float] = Query(None, description="Minimum salary filter"),
    salary_max: Optional[float] = Query(None, description="Maximum salary filter"),
    experience_min: Optional[float] = Query(None, description="Minimum years experience"),
    experience_max: Optional[float] = Query(None, description="Maximum years experience")
):
    """Get comprehensive analysis for a specific job title with advanced filtering"""
    try:
        # Build filters dictionary
        filters = {
            "location": location,
            "industry": industry,
            "experience_level": experience_level,
            "company_size": company_size,
            "employment_type": employment_type,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "experience_min": experience_min,
            "experience_max": experience_max
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        analysis = await job_trend_service.get_job_analysis(job_title, time_range, filters)
        if not analysis:
            raise HTTPException(status_code=404, detail=f"No data found for job title: {job_title}")
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing job {job_title}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze job data")

@router.get("/skills/{job_title}")
async def get_skill_demand(
    job_title: str,
    limit: Optional[int] = Query(10, description="Number of top skills to return")
):
    """Get skill demand analysis for a specific job title"""
    try:
        skills = await job_trend_service.get_skill_demand(job_title, limit)
        if not skills:
            raise HTTPException(status_code=404, detail=f"No skill data found for job title: {job_title}")
        return {"job_title": job_title, "skills": skills}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching skills for {job_title}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch skill demand data")

@router.get("/overview")
async def get_market_overview(
    industry: Optional[str] = Query(None, description="Filter by industry"),
    location: Optional[str] = Query(None, description="Filter by location"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level")
):
    """Get general market overview and trending insights"""
    try:
        filters = {
            "industry": industry,
            "location": location,
            "experience_level": experience_level
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        overview = await job_trend_service.get_market_overview(filters)
        return overview
    except Exception as e:
        logger.error(f"Error fetching market overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch market overview")

@router.get("/trends/{job_title}")
async def get_job_trends(
    job_title: str,
    metric: Optional[str] = Query("postings", description="Metric to analyze: postings, salary, benefits")
):
    """Get time-series trend data for a specific job title"""
    try:
        trends = await job_trend_service.get_job_trends(job_title, metric)
        if not trends:
            raise HTTPException(status_code=404, detail=f"No trend data found for job title: {job_title}")
        return {"job_title": job_title, "metric": metric, "trends": trends}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching trends for {job_title}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch trend data")

@router.get("/experience-distribution/{job_title}")
async def get_experience_distribution(job_title: str):
    """Get experience level distribution for a specific job title"""
    try:
        distribution = await job_trend_service.get_experience_distribution(job_title)
        if not distribution:
            raise HTTPException(status_code=404, detail=f"No experience data found for job title: {job_title}")
        return {"job_title": job_title, "distribution": distribution}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching experience distribution for {job_title}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch experience distribution")

@router.get("/cache-info")
async def get_cache_info():
    """Get cache status information"""
    try:
        cache_info = job_trend_service.get_cache_info()
        return cache_info
    except Exception as e:
        logger.error(f"Error fetching cache info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch cache information")

@router.post("/clear-cache")
async def clear_cache():
    """Manually clear the data cache to force refresh"""
    try:
        job_trend_service.clear_cache()
        return {"message": "Cache cleared successfully", "status": "success"}
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clear cache")

@router.get("/filter-options")
async def get_filter_options():
    """Get available filter options from the dataset"""
    try:
        options = await job_trend_service.get_filter_options()
        return options
    except Exception as e:
        logger.error(f"Error fetching filter options: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch filter options")

@router.get("/export/csv")
async def export_job_data_csv(
    job_title: Optional[str] = Query(None, description="Filter by job title"),
    time_range: Optional[str] = Query("all", description="Time range: 3m, 6m, 1y, all"),
    location: Optional[str] = Query(None, description="Filter by location"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level"),
    company_size: Optional[str] = Query(None, description="Filter by company size"),
    employment_type: Optional[str] = Query(None, description="Filter by employment type"),
    salary_min: Optional[float] = Query(None, description="Minimum salary filter"),
    salary_max: Optional[float] = Query(None, description="Maximum salary filter"),
    experience_min: Optional[float] = Query(None, description="Minimum years experience"),
    experience_max: Optional[float] = Query(None, description="Maximum years experience")
):
    """Export filtered job data as CSV"""
    try:
        # Build filters dictionary
        filters = {
            "location": location,
            "industry": industry,
            "experience_level": experience_level,
            "company_size": company_size,
            "employment_type": employment_type,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "experience_min": experience_min,
            "experience_max": experience_max
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        # Get filtered data
        df = await job_trend_service.export_job_data(job_title, filters, time_range)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data found matching the specified filters")
        
        # Convert to CSV
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()
        
        # Create filename
        filename = f"job_data_{job_title or 'all'}_{time_range}.csv"
        
        # Return as streaming response
        response = StreamingResponse(
            io.BytesIO(csv_content.encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting CSV data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export data as CSV")

@router.get("/export/json")
async def export_job_data_json(
    job_title: Optional[str] = Query(None, description="Filter by job title"),
    time_range: Optional[str] = Query("all", description="Time range: 3m, 6m, 1y, all"),
    location: Optional[str] = Query(None, description="Filter by location"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level"),
    company_size: Optional[str] = Query(None, description="Filter by company size"),
    employment_type: Optional[str] = Query(None, description="Filter by employment type"),
    salary_min: Optional[float] = Query(None, description="Minimum salary filter"),
    salary_max: Optional[float] = Query(None, description="Maximum salary filter"),
    experience_min: Optional[float] = Query(None, description="Minimum years experience"),
    experience_max: Optional[float] = Query(None, description="Maximum years experience")
):
    """Export filtered job data as JSON"""
    try:
        # Build filters dictionary
        filters = {
            "location": location,
            "industry": industry,
            "experience_level": experience_level,
            "company_size": company_size,
            "employment_type": employment_type,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "experience_min": experience_min,
            "experience_max": experience_max
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        # Get filtered data
        df = await job_trend_service.export_job_data(job_title, filters, time_range)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data found matching the specified filters")
        
        # Convert to JSON
        data = df.to_dict('records')
        json_content = json.dumps(data, indent=2, default=str)
        
        # Create filename
        filename = f"job_data_{job_title or 'all'}_{time_range}.json"
        
        # Return as streaming response
        response = StreamingResponse(
            io.BytesIO(json_content.encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting JSON data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export data as JSON")


@router.post("/ai-insights")
async def generate_ai_insights(request: Dict[str, Any]):
    """Generate AI-powered insights from job trend data"""
    try:
        # Get the data and filters from request
        data = request.get('data', [])
        filters = request.get('filters', {})
        
        if not data:
            return {"error": "No data provided for analysis"}
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(data)
        
        # Generate insights based on the data
        insights = {
            "trends": "",
            "recommendations": [],
            "skills": []
        }
        
        # Analyze job trends
        if 'job_title' in df.columns:
            top_jobs = df['job_title'].value_counts().head(5)
            total_jobs = len(df)
            
            if total_jobs > 0:
                insights["trends"] = f"Analysis of {total_jobs} job postings shows {top_jobs.iloc[0]} is the most in-demand position with {((top_jobs.iloc[0] / total_jobs) * 100):.1f}% of listings."
        
        # Generate recommendations
        recommendations = []
        
        if 'location' in df.columns:
            top_locations = df['location'].value_counts().head(3)
            if len(top_locations) > 0:
                recommendations.append(f"Consider opportunities in {top_locations.index[0]}, which has the highest job volume")
        
        if 'experience_level' in df.columns:
            exp_dist = df['experience_level'].value_counts()
            if len(exp_dist) > 0:
                recommendations.append(f"Most opportunities target {exp_dist.index[0]} level professionals")
        
        if 'employment_type' in df.columns:
            emp_types = df['employment_type'].value_counts()
            if len(emp_types) > 0:
                recommendations.append(f"{emp_types.index[0]} positions dominate the market")
        
        insights["recommendations"] = recommendations[:3]  # Limit to top 3
        
        # Extract in-demand skills (mock implementation - you can enhance this)
        skills = ["Python", "Data Analysis", "Machine Learning", "SQL", "Communication", "Problem Solving"]
        insights["skills"] = skills[:6]  # Top 6 skills
        
        return insights
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}")
        return {"error": "Failed to generate insights"}


@router.get("/detailed-analysis/{job_title}")
async def get_job_analysis_detailed(job_title: str):
    """Get detailed analysis for job comparison feature"""
    try:
        # Get basic job analysis
        analysis = await job_trend_service.get_job_analysis(job_title)
        
        # Add additional metrics for comparison
        analysis["comparison_metrics"] = {
            "demand_score": len(analysis.get("recent_trends", [])),
            "growth_rate": "5.2%",  # Mock data - calculate from actual trends
            "avg_salary": f"${analysis.get('salary', {}).get('average', 0):,.0f}" if analysis.get('salary', {}).get('average') else "N/A",
            "experience_req": f"{analysis.get('experience', {}).get('average_years', 0):.1f} years" if analysis.get('experience', {}).get('average_years') else "N/A"
        }
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error fetching detailed job analysis for {job_title}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze {job_title}")


@router.post("/ai-insights-gemini")
async def generate_ai_insights_gemini(request: Dict[str, Any]):
    """Generate AI-powered insights using Google Gemini API"""
    try:
        # Configure Gemini API
        genai.configure(api_key=os.getenv('GEMINI_API'))
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Extract request data
        job_title = request.get('jobTitle', 'Software Engineer')
        location = request.get('location', 'Remote')
        experience_level = request.get('experience_level', 'Mid-level')
        industry = request.get('industry', 'Technology')
        
        # Create a concise prompt for Gemini
        prompt = f"""
        As a career advisor, provide brief, actionable insights for:
        
        Job: {job_title} | Location: {location} | Level: {experience_level}
        
        Return as JSON with short, clear responses:
        {{
            "marketOverview": "1-2 sentences about current demand and market outlook",
            "careerAdvice": [
                "Short tip 1 (max 10 words)",
                "Short tip 2 (max 10 words)", 
                "Short tip 3 (max 10 words)"
            ],
            "skillsRecommendations": [
                "Key skill 1",
                "Key skill 2",
                "Key skill 3",
                "Key skill 4"
            ],
            "salaryInsights": "1-2 sentences about salary range and factors"
        }}
        
        Keep responses concise, practical, and easy to scan. Use simple language.
        """
        
        # Generate content using Gemini
        response = model.generate_content(prompt)
        
        if not response.text:
            raise Exception("No response from Gemini API")
        
        # Clean up the response text to extract JSON
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]
        
        # Parse the JSON response
        try:
            insights = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, create a fallback response
            insights = {
                "marketOverview": f"{job_title} market shows steady growth with good opportunities in {location}.",
                "careerAdvice": [
                    "Learn trending technologies",
                    "Build professional network", 
                    "Get relevant certifications"
                ],
                "skillsRecommendations": ["Python", "Communication", "Problem Solving", "Teamwork"],
                "salaryInsights": f"Competitive salaries available. Experience and skills drive compensation."
            }
        
        return insights
        
    except Exception as e:
        logger.error(f"Error generating Gemini AI insights: {str(e)}")
        return {
            "error": "AI insights temporarily unavailable",
            "marketOverview": f"Market analysis for {request.get('jobTitle', 'this role')} unavailable.",
            "careerAdvice": [
                "Develop core skills",
                "Network actively",
                "Stay market-aware"
            ],
            "skillsRecommendations": ["Communication", "Problem Solving", "Technical Skills", "Leadership"],
            "salaryInsights": "Research industry standards for your role and location."
        }

# ============================================================================
# ML-POWERED ENDPOINTS
# ============================================================================

@router.post("/predict-salary")
async def predict_salary_ml(
    skills: List[str] = Query(..., description="List of skills"),
    experience_years: float = Query(..., description="Years of experience"),
    location: str = Query(..., description="Job location"),
    industry: str = Query(..., description="Industry"),
    job_title: Optional[str] = Query(None, description="Job title for comparison"),
    company_size: Optional[str] = Query("Unknown", description="Company size"),
    education: Optional[str] = Query("Bachelor's Degree", description="Education level"),
    employment_type: Optional[str] = Query("Full-time", description="Employment type"),
    experience_level: Optional[str] = Query("Mid-Level", description="Experience level")
):
    """
    Predict salary using ML model based on profile.
    
    Returns personalized salary prediction with market comparison.
    """
    try:
        prediction = await job_trend_service.predict_salary_ml(
            skills=skills,
            experience_years=experience_years,
            location=location,
            industry=industry,
            job_title=job_title,
            company_size=company_size,
            education=education,
            employment_type=employment_type,
            experience_level=experience_level
        )
        
        return prediction
        
    except Exception as e:
        logger.error(f"Error predicting salary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to predict salary")


@router.get("/salary-trends-ml/{job_title}")
async def get_salary_trends_ml(
    job_title: str,
    months: Optional[int] = Query(12, description="Number of months of historical data")
):
    """
    Get salary trends over time with ML analysis.
    
    Returns historical trends and growth analysis.
    """
    try:
        trends = await job_trend_service.get_salary_trends_ml(job_title, months)
        
        if not trends:
            raise HTTPException(
                status_code=404, 
                detail=f"No salary data found for job title: {job_title}"
            )
        
        return trends
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting salary trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get salary trends")


@router.get("/ml-status")
async def get_ml_model_status():
    """
    Get status of ML models (salary predictor, etc.).
    
    Returns model loading status and capabilities.
    """
    try:
        status = await job_trend_service.get_ml_model_status()
        return status
        
    except Exception as e:
        logger.error(f"Error getting ML status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get ML model status")


@router.post("/bulk-salary-predict")
async def bulk_salary_predict(
    profiles: List[Dict[str, Any]]
):
    """
    Predict salaries for multiple profiles at once.
    
    Each profile should contain:
        - skills: List[str]
        - experience_years: float
        - location: str
        - industry: str
        - job_title: Optional[str]
        - ... (other optional fields)
    """
    try:
        predictions = []
        
        for profile in profiles:
            prediction = await job_trend_service.predict_salary_ml(
                skills=profile.get('skills', []),
                experience_years=profile.get('experience_years', 0),
                location=profile.get('location', 'Unknown'),
                industry=profile.get('industry', 'Unknown'),
                job_title=profile.get('job_title'),
                company_size=profile.get('company_size', 'Unknown'),
                education=profile.get('education', "Bachelor's Degree"),
                employment_type=profile.get('employment_type', 'Full-time'),
                experience_level=profile.get('experience_level', 'Mid-Level')
            )
            
            predictions.append({
                "profile": profile.get('job_title', 'Unknown'),
                "prediction": prediction
            })
        
        return {
            "total_profiles": len(profiles),
            "predictions": predictions
        }
        
    except Exception as e:
        logger.error(f"Error in bulk salary prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process bulk predictions")


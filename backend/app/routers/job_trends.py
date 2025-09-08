from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.job_trend_service import JobTrendService
import logging

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
    time_range: Optional[str] = Query("6m", description="Time range: 3m, 6m, 1y, all")
):
    """Get comprehensive analysis for a specific job title"""
    try:
        analysis = await job_trend_service.get_job_analysis(job_title, time_range)
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

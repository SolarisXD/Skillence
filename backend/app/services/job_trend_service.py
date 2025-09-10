import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import Counter
import os
import logging
from functools import lru_cache
import asyncio

logger = logging.getLogger(__name__)

class JobTrendService:
    def __init__(self):
        self.data_path = os.path.join(os.path.dirname(__file__), '..', 'career_data', 'job_trend_data')
        self._data_cache = None
        self._cache_timestamp = None
        self._cache_duration = 3600  # 1 hour cache
        
    def clear_cache(self):
        """Manually clear the data cache"""
        self._data_cache = None
        self._cache_timestamp = None
        logger.info("Data cache cleared manually")
        
    def get_cache_info(self) -> Dict[str, Any]:
        """Get cache status information"""
        if self._cache_timestamp is None:
            return {"cached": False, "last_updated": None, "expires_in": 0}
        
        current_time = datetime.now()
        age_seconds = (current_time - self._cache_timestamp).total_seconds()
        expires_in = max(0, self._cache_duration - age_seconds)
        
        return {
            "cached": self._data_cache is not None,
            "last_updated": self._cache_timestamp.isoformat(),
            "expires_in": int(expires_in),
            "age_seconds": int(age_seconds)
        }
        
    async def _load_data(self) -> pd.DataFrame:
        """Load and cache job trend data from CSV files"""
        current_time = datetime.now()
        
        # Check if cache is valid
        if (self._data_cache is not None and 
            self._cache_timestamp is not None and 
            (current_time - self._cache_timestamp).seconds < self._cache_duration):
            return self._data_cache
        
        try:
            # Load both CSV files
            file1 = os.path.join(self.data_path, 'ai_job_dataset.csv')
            file2 = os.path.join(self.data_path, 'ai_job_dataset1.csv')
            
            dfs = []
            
            if os.path.exists(file1):
                df1 = pd.read_csv(file1)
                dfs.append(df1)
                logger.info(f"Loaded {len(df1)} records from ai_job_dataset.csv")
            
            if os.path.exists(file2):
                df2 = pd.read_csv(file2)
                dfs.append(df2)
                logger.info(f"Loaded {len(df2)} records from ai_job_dataset1.csv")
            
            if not dfs:
                raise FileNotFoundError("No job data files found")
            
            # Combine dataframes
            combined_df = pd.concat(dfs, ignore_index=True)
            
            # Clean and preprocess data
            combined_df = self._clean_data(combined_df)
            
            # Cache the data
            self._data_cache = combined_df
            self._cache_timestamp = current_time
            
            logger.info(f"Successfully loaded and cached {len(combined_df)} job records")
            return combined_df
            
        except Exception as e:
            logger.error(f"Error loading job data: {str(e)}")
            raise
    
    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and preprocess the job data"""
        # Convert posting_date to datetime
        df['posting_date'] = pd.to_datetime(df['posting_date'], errors='coerce')
        
        # Fill missing values
        df['required_skills'] = df['required_skills'].fillna('')
        df['benefits_score'] = pd.to_numeric(df['benefits_score'], errors='coerce').fillna(0)
        df['salary_usd'] = pd.to_numeric(df['salary_usd'], errors='coerce').fillna(0)
        df['years_experience'] = pd.to_numeric(df['years_experience'], errors='coerce').fillna(0)
        
        # Normalize job titles
        df['job_title_normalized'] = df['job_title'].str.strip().str.title()
        
        # Extract skills list
        df['skills_list'] = df['required_skills'].apply(self._parse_skills)
        
        # Calculate days since posting
        current_date = datetime.now()
        df['days_since_posting'] = (current_date - df['posting_date']).dt.days
        
        return df
    
    def _parse_skills(self, skills_str: str) -> List[str]:
        """Parse comma-separated skills string into list"""
        if not skills_str or pd.isna(skills_str):
            return []
        return [skill.strip() for skill in skills_str.split(',') if skill.strip()]
    
    async def get_available_jobs(self) -> List[str]:
        """Get list of available job titles"""
        df = await self._load_data()
        job_titles = df['job_title_normalized'].value_counts()
        # Return jobs with at least 5 postings
        return job_titles[job_titles >= 5].index.tolist()
    
    async def get_job_analysis(self, job_title: str, time_range: str = "6m", filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get comprehensive analysis for a specific job title with advanced filtering"""
        df = await self._load_data()
        
        # Filter by job title (case-insensitive)
        job_data = df[df['job_title_normalized'].str.contains(job_title, case=False, na=False)]
        
        if job_data.empty:
            return None
        
        # Apply time range filter
        job_data = self._apply_time_filter(job_data, time_range)
        
        # Apply advanced filters
        job_data = self._apply_advanced_filters(job_data, filters)
        
        if job_data.empty:
            return None
        
        # Calculate metrics
        total_postings = len(job_data)
        avg_salary = float(job_data['salary_usd'].mean()) if not job_data['salary_usd'].isna().all() else 0.0
        salary_range = {
            "min": float(job_data['salary_usd'].min()) if not job_data['salary_usd'].isna().all() else 0.0,
            "max": float(job_data['salary_usd'].max()) if not job_data['salary_usd'].isna().all() else 0.0,
            "median": float(job_data['salary_usd'].median()) if not job_data['salary_usd'].isna().all() else 0.0
        }
        
        avg_experience = float(job_data['years_experience'].mean()) if not job_data['years_experience'].isna().all() else 0.0
        avg_benefits = float(job_data['benefits_score'].mean()) if not job_data['benefits_score'].isna().all() else 0.0
        
        # Calculate trendiness score
        trendiness_score = self._calculate_trendiness_score(job_data)
        
        # Growth rate calculation
        growth_rate = self._calculate_growth_rate(job_data)
        
        # Popular locations
        top_locations = job_data['company_location'].value_counts().head(5).to_dict()
        
        # Popular industries
        top_industries = job_data['industry'].value_counts().head(5).to_dict()
        
        # Company size distribution
        company_sizes = job_data['company_size'].value_counts().to_dict()
        
        # Remote work statistics
        remote_stats = self._calculate_remote_stats(job_data)
        
        return {
            "job_title": job_title,
            "total_postings": int(total_postings),
            "trendiness_score": round(float(trendiness_score), 1),
            "growth_rate": round(float(growth_rate), 1),
            "salary": {
                "average": round(avg_salary, 0),
                "range": salary_range
            },
            "experience": {
                "average_years": round(avg_experience, 1),
                "distribution": {k: int(v) for k, v in job_data['experience_level'].value_counts().to_dict().items()}
            },
            "benefits_score": round(avg_benefits, 1),
            "locations": {k: int(v) for k, v in top_locations.items()},
            "industries": {k: int(v) for k, v in top_industries.items()},
            "company_sizes": {k: int(v) for k, v in company_sizes.items()},
            "remote_work": remote_stats,
            "time_range": time_range,
            "filters_applied": filters or {}
        }
    
    async def get_skill_demand(self, job_title: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get skill demand analysis for a specific job title"""
        df = await self._load_data()
        
        # Filter by job title
        job_data = df[df['job_title_normalized'].str.contains(job_title, case=False, na=False)]
        
        if job_data.empty:
            return []
        
        # Collect all skills
        all_skills = []
        for skills_list in job_data['skills_list']:
            all_skills.extend(skills_list)
        
        # Count skill frequency
        skill_counts = Counter(all_skills)
        total_jobs = len(job_data)
        
        # Calculate skill demand with percentage
        skills_data = []
        for skill, count in skill_counts.most_common(limit):
            percentage = (count / total_jobs) * 100
            skills_data.append({
                "skill": skill,
                "demand_count": int(count),
                "percentage": round(float(percentage), 1)
            })
        
        return skills_data
    
    async def get_market_overview(self, filters: Dict[str, str] = None) -> Dict[str, Any]:
        """Get general market overview"""
        df = await self._load_data()
        
        # Apply filters if provided
        if filters:
            if 'industry' in filters:
                df = df[df['industry'].str.contains(filters['industry'], case=False, na=False)]
            if 'location' in filters:
                df = df[df['company_location'].str.contains(filters['location'], case=False, na=False)]
            if 'experience_level' in filters:
                df = df[df['experience_level'] == filters['experience_level']]
        
        # Calculate overview metrics
        total_jobs = len(df)
        avg_salary = df['salary_usd'].mean()
        
        # Top trending jobs (by posting frequency in last 30 days)
        recent_jobs = df[df['days_since_posting'] <= 30]
        trending_jobs = recent_jobs['job_title_normalized'].value_counts().head(10).to_dict()
        
        # Top skills across all jobs
        all_skills = []
        for skills_list in df['skills_list']:
            all_skills.extend(skills_list)
        top_skills = dict(Counter(all_skills).most_common(15))
        
        # Experience level distribution
        experience_dist = df['experience_level'].value_counts().to_dict()
        
        # Industry distribution
        industry_dist = df['industry'].value_counts().head(10).to_dict()
        
        # Employment type distribution
        employment_dist = df['employment_type'].value_counts().to_dict()
        
        return {
            "total_jobs": int(total_jobs),
            "average_salary": round(float(avg_salary), 0),
            "trending_jobs": {k: int(v) for k, v in trending_jobs.items()},
            "top_skills": {k: int(v) for k, v in top_skills.items()},
            "experience_distribution": {k: int(v) for k, v in experience_dist.items()},
            "industry_distribution": {k: int(v) for k, v in industry_dist.items()},
            "employment_distribution": {k: int(v) for k, v in employment_dist.items()},
            "filters_applied": filters or {}
        }
    
    async def get_job_trends(self, job_title: str, metric: str = "postings") -> List[Dict[str, Any]]:
        """Get time-series trend data for a job title"""
        df = await self._load_data()
        
        # Filter by job title
        job_data = df[df['job_title_normalized'].str.contains(job_title, case=False, na=False)]
        
        if job_data.empty:
            return []
        
        # Group by month-year for trend analysis
        job_data = job_data.copy()  # Avoid SettingWithCopyWarning
        job_data.loc[:, 'month_year'] = job_data['posting_date'].dt.to_period('M')
        
        if metric == "postings":
            trends = job_data.groupby('month_year').size().reset_index(name='value')
        elif metric == "salary":
            trends = job_data.groupby('month_year')['salary_usd'].mean().reset_index(name='value')
        elif metric == "benefits":
            trends = job_data.groupby('month_year')['benefits_score'].mean().reset_index(name='value')
        else:
            return []
        
        # Convert to list of dictionaries
        trend_data = []
        for _, row in trends.iterrows():
            trend_data.append({
                "date": str(row['month_year']),
                "value": round(float(row['value']), 2)
            })
        
        return sorted(trend_data, key=lambda x: x['date'])
    
    async def get_experience_distribution(self, job_title: str) -> List[Dict[str, Any]]:
        """Get experience level distribution for a job title"""
        df = await self._load_data()
        
        # Filter by job title
        job_data = df[df['job_title_normalized'].str.contains(job_title, case=False, na=False)]
        
        if job_data.empty:
            return []
        
        # Calculate distribution
        exp_dist = job_data['experience_level'].value_counts()
        total = len(job_data)
        
        distribution = []
        for level, count in exp_dist.items():
            percentage = (count / total) * 100
            distribution.append({
                "level": level,
                "count": int(count),
                "percentage": round(float(percentage), 1)
            })
        
        return distribution
    
    def _apply_time_filter(self, df: pd.DataFrame, time_range: str) -> pd.DataFrame:
        """Apply time range filter to dataframe"""
        current_date = datetime.now()
        
        if time_range == "3m":
            cutoff_date = current_date - timedelta(days=90)
        elif time_range == "6m":
            cutoff_date = current_date - timedelta(days=180)
        elif time_range == "1y":
            cutoff_date = current_date - timedelta(days=365)
        else:  # "all"
            return df
        
        return df[df['posting_date'] >= cutoff_date]
    
    def _calculate_trendiness_score(self, job_data: pd.DataFrame) -> float:
        """Calculate trendiness score based on multiple factors"""
        if job_data.empty:
            return 0.0
        
        # Factor 1: Recent posting frequency (40% weight)
        recent_postings = len(job_data[job_data['days_since_posting'] <= 30])
        total_postings = len(job_data)
        recency_score = (recent_postings / max(total_postings, 1)) * 100
        
        # Factor 2: Salary competitiveness (30% weight)
        avg_salary = job_data['salary_usd'].mean()
        # Normalize salary (assuming 50k-200k range)
        salary_score = min((avg_salary - 50000) / 150000 * 100, 100) if avg_salary > 0 else 0
        
        # Factor 3: Benefits score (20% weight)
        avg_benefits = job_data['benefits_score'].mean()
        benefits_score = (avg_benefits / 10) * 100 if avg_benefits > 0 else 0
        
        # Factor 4: Growth trend (10% weight)
        growth_score = max(self._calculate_growth_rate(job_data), 0)
        
        # Weighted average
        trendiness = (
            recency_score * 0.4 +
            salary_score * 0.3 +
            benefits_score * 0.2 +
            growth_score * 0.1
        )
        
        return min(trendiness, 100.0)
    
    def _calculate_growth_rate(self, job_data: pd.DataFrame) -> float:
        """Calculate growth rate based on posting trends"""
        if len(job_data) < 2:
            return 0.0
        
        try:
            # Group by month and calculate trend
            monthly_data = job_data.groupby(job_data['posting_date'].dt.to_period('M')).size()
            
            if len(monthly_data) < 2:
                return 0.0
            
            # Simple growth calculation: compare recent vs older periods
            recent_months = monthly_data.tail(3).mean()
            older_months = monthly_data.head(3).mean()
            
            if older_months > 0:
                growth_rate = ((recent_months - older_months) / older_months) * 100
                return min(max(growth_rate, -50), 100)  # Cap between -50% and 100%
            
            return 0.0
        except Exception:
            return 0.0
    
    def _apply_advanced_filters(self, df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
        """Apply advanced filtering to the dataframe"""
        if not filters:
            return df
        
        filtered_df = df.copy()
        
        # Location filtering
        if 'location' in filters and filters['location']:
            filtered_df = filtered_df[filtered_df['company_location'].str.contains(
                filters['location'], case=False, na=False
            )]
        
        # Industry filtering
        if 'industry' in filters and filters['industry']:
            filtered_df = filtered_df[filtered_df['industry'].str.contains(
                filters['industry'], case=False, na=False
            )]
        
        # Experience level filtering
        if 'experience_level' in filters and filters['experience_level']:
            filtered_df = filtered_df[filtered_df['experience_level'] == filters['experience_level']]
        
        # Company size filtering
        if 'company_size' in filters and filters['company_size']:
            filtered_df = filtered_df[filtered_df['company_size'] == filters['company_size']]
        
        # Salary range filtering
        if 'salary_min' in filters and filters['salary_min']:
            try:
                salary_min = float(filters['salary_min'])
                filtered_df = filtered_df[filtered_df['salary_usd'] >= salary_min]
            except (ValueError, TypeError):
                pass
        
        if 'salary_max' in filters and filters['salary_max']:
            try:
                salary_max = float(filters['salary_max'])
                filtered_df = filtered_df[filtered_df['salary_usd'] <= salary_max]
            except (ValueError, TypeError):
                pass
        
        # Employment type filtering (remote/onsite)
        if 'employment_type' in filters and filters['employment_type']:
            filtered_df = filtered_df[filtered_df['employment_type'] == filters['employment_type']]
        
        # Years of experience filtering
        if 'experience_min' in filters and filters['experience_min']:
            try:
                exp_min = float(filters['experience_min'])
                filtered_df = filtered_df[filtered_df['years_experience'] >= exp_min]
            except (ValueError, TypeError):
                pass
        
        if 'experience_max' in filters and filters['experience_max']:
            try:
                exp_max = float(filters['experience_max'])
                filtered_df = filtered_df[filtered_df['years_experience'] <= exp_max]
            except (ValueError, TypeError):
                pass
        
        return filtered_df
    
    def _calculate_remote_stats(self, job_data: pd.DataFrame) -> Dict[str, Any]:
        """Calculate remote work statistics"""
        total_jobs = len(job_data)
        if total_jobs == 0:
            return {"remote_percentage": 0, "distribution": {}}
        
        # Count employment types
        employment_dist = job_data['employment_type'].value_counts().to_dict()
        
        # Calculate remote percentage (assuming remote/hybrid types contain 'remote' or 'hybrid')
        remote_keywords = ['remote', 'hybrid', 'work from home', 'wfh']
        remote_count = 0
        
        for emp_type, count in employment_dist.items():
            if any(keyword in str(emp_type).lower() for keyword in remote_keywords):
                remote_count += count
        
        remote_percentage = (remote_count / total_jobs) * 100
        
        return {
            "remote_percentage": round(float(remote_percentage), 1),
            "distribution": {k: int(v) for k, v in employment_dist.items()},
            "remote_count": int(remote_count),
            "total_count": int(total_jobs)
        }
    
    async def get_filter_options(self) -> Dict[str, Any]:
        """Get available filter options from the dataset"""
        df = await self._load_data()
        
        return {
            "locations": sorted(df['company_location'].dropna().unique().tolist()),
            "industries": sorted(df['industry'].dropna().unique().tolist()),
            "experience_levels": sorted(df['experience_level'].dropna().unique().tolist()),
            "company_sizes": sorted(df['company_size'].dropna().unique().tolist()),
            "employment_types": sorted(df['employment_type'].dropna().unique().tolist()),
            "salary_range": {
                "min": float(df['salary_usd'].min()) if not df['salary_usd'].isna().all() else 0,
                "max": float(df['salary_usd'].max()) if not df['salary_usd'].isna().all() else 0
            },
            "experience_range": {
                "min": float(df['years_experience'].min()) if not df['years_experience'].isna().all() else 0,
                "max": float(df['years_experience'].max()) if not df['years_experience'].isna().all() else 0
            }
        }
    
    async def export_job_data(self, job_title: str = None, filters: Dict[str, Any] = None, 
                            time_range: str = "all") -> pd.DataFrame:
        """Export filtered job data for download"""
        df = await self._load_data()
        
        # Apply job title filter if specified
        if job_title:
            df = df[df['job_title_normalized'].str.contains(job_title, case=False, na=False)]
        
        # Apply time range filter
        df = self._apply_time_filter(df, time_range)
        
        # Apply advanced filters
        df = self._apply_advanced_filters(df, filters)
        
        # Select and rename columns for export
        export_columns = [
            'job_title', 'company_location', 'industry', 'salary_usd', 
            'years_experience', 'experience_level', 'employment_type',
            'company_size', 'benefits_score', 'required_skills',
            'posting_date', 'days_since_posting'
        ]
        
        # Filter to existing columns
        available_columns = [col for col in export_columns if col in df.columns]
        export_df = df[available_columns].copy()
        
        # Clean up data for export
        export_df['posting_date'] = export_df['posting_date'].dt.strftime('%Y-%m-%d')
        export_df = export_df.fillna('')
        
        return export_df

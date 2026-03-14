from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from main import app

client = TestClient(app)

def run_tests():
    print("Testing GET /api/skills")
    response = client.get("/api/skills")
    assert response.status_code == 200
    skills = response.json()
    assert len(skills) > 0
    print("Found skills:", len(skills))
    
    print("Testing GET /api/skills/search?q=python")
    response = client.get("/api/skills/search?q=python")
    assert response.status_code == 200
    search_res = response.json()
    assert len(search_res) > 0
    assert search_res[0]["id"] == "python"
    print("Search returned correct skill")
    
    print("Testing GET /api/skills/python")
    response = client.get("/api/skills/python")
    assert response.status_code == 200
    skill_detail = response.json()
    assert "roadmap" in skill_detail
    assert "courses" in skill_detail
    print("Got detailed skill correctly")
    
    print("All backend tests for Skill Libraries passed!")

if __name__ == "__main__":
    run_tests()

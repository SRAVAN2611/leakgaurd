import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def test_text_scan_endpoint():
    res = client.post("/api/v1/scans/text", json={
        "content": "My email address is alice@example.com",
        "source": "USER_TYPED"
    })
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    assert data["inputType"] == "Text"
    assert data["threatCount"] >= 1
    assert "[REDACTED" in data["sanitized"] or data["decision"] in ["REDACT", "BLOCK", "WARN"]

def test_code_scan_endpoint():
    res = client.post("/api/v1/scans/code", json={
        "content": "const stripeKey = 'stripe_sec_key_sample_12345678901234567890';",
        "language": "javascript",
        "source": "FILE_UPLOAD"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["inputType"] == "Code"
    assert data["severity"] in ["High", "Critical"]

def test_list_scans_and_analytics():
    res_scans = client.get("/api/v1/scans")
    assert res_scans.status_code == 200
    scans_data = res_scans.json()
    assert "items" in scans_data

    res_analytics = client.get("/api/v1/analytics/overview")
    assert res_analytics.status_code == 200
    analytics_data = res_analytics.json()
    assert "totalScans" in analytics_data
    assert analytics_data["totalScans"] >= 2

def test_policies_crud():
    # Create policy
    res_create = client.post("/api/v1/policies", json={
        "name": "Test Security Rule",
        "description": "Rule created during automated testing",
        "category": "API_KEYS",
        "severity": "Critical",
        "action": "BLOCK",
        "enabled": True
    })
    assert res_create.status_code == 200
    pol = res_create.json()
    pol_id = pol["id"]

    # Toggle status
    res_toggle = client.patch(f"/api/v1/policies/{pol_id}/status")
    assert res_toggle.status_code == 200
    assert res_toggle.json()["enabled"] is False

    # Delete policy
    res_delete = client.delete(f"/api/v1/policies/{pol_id}")
    assert res_delete.status_code == 200

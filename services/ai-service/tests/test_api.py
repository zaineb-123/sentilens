def test_health(client):
    assert client.get("/health").json()["status"] == "ok"


def test_analyze_endpoint(client):
    r = client.post("/analyze", json={"text": "I love the team but the workload is too high."})
    assert r.status_code == 200
    body = r.json()
    assert body["sentiment"]["label"] == "mixed"
    assert {a["key"] for a in body["aspects"]} >= {"team", "workload"}


def test_ready_after_first_request(client):
    client.post("/analyze", json={"text": "Great team."})
    assert client.get("/health/ready").status_code == 200


def test_batch_endpoint(client):
    r = client.post("/analyze/batch", json={"items": [
        {"id": "a", "text": "Great team."}, {"id": "b", "text": "Le salaire est mauvais."}]})
    assert r.status_code == 200 and [x["id"] for x in r.json()["results"]] == ["a", "b"]


def test_invalid_requests(client):
    for payload in ({}, {"text": "   "}, {"text": "x" * 6000}, {"text": "ok", "language_hint": "de"}):
        r = client.post("/analyze", json=payload)
        assert r.status_code == 422 and r.json()["error"]["code"] == "VALIDATION_ERROR"
    assert client.post("/analyze/batch", json={"items": []}).status_code == 422
    too_many = {"items": [{"id": str(i), "text": "ok"} for i in range(101)]}
    assert client.post("/analyze/batch", json=too_many).status_code == 422


def test_internal_key_enforced():
    from fastapi.testclient import TestClient
    from app.config import Settings
    from app.main import create_app
    with TestClient(create_app(Settings(internal_key="k"))) as c:
        assert c.post("/analyze", json={"text": "Great team."}).status_code == 401
        ok = c.post("/analyze", json={"text": "Great team."}, headers={"X-Internal-Key": "k"})
        assert ok.status_code == 200
        assert c.get("/health").status_code == 200  # health stays open for orchestrators

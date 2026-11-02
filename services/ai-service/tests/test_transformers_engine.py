"""Real-model tests. Skipped unless AI_RUN_MODEL_TESTS=1 (needs torch + Hugging Face access)."""
import os

import pytest

pytestmark = pytest.mark.skipif(os.environ.get("AI_RUN_MODEL_TESTS") != "1",
                                reason="set AI_RUN_MODEL_TESTS=1 to run with real models")


@pytest.fixture(scope="module")
def real():
    from app.config import Settings
    from app.engines import EngineState
    return EngineState(Settings(engine="transformers")).require()


@pytest.mark.parametrize("text", [
    "I love the team but the workload is too high.",
    "J'adore mon équipe mais la charge de travail est trop élevée.",
    "أحب فريقي لكن ضغط العمل كبير جدا",
])
def test_real_models_mixed(real, text):
    r = real.analyze(text)
    assert r["sentiment"]["label"] == "mixed"
    a = {x["key"]: x["sentiment"] for x in r["aspects"]}
    assert a.get("team") == "positive" and a.get("workload") == "negative"

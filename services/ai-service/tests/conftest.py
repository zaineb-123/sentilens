import os

os.environ["AI_ENGINE"] = "lexicon"  # unit tests never need the heavy models
os.environ["AI_EAGER_LOAD"] = "false"
os.environ["AI_INTERNAL_KEY"] = ""

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture(scope="session")
def analyzer():
    from app.engines import EngineState
    state = EngineState(Settings())
    return state.require()


@pytest.fixture()
def client():
    with TestClient(create_app(Settings())) as c:
        yield c

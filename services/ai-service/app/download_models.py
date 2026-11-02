"""Pre-download models into the HF cache (run at Docker build time)."""
from .config import get_settings
from .engines import EngineState

if __name__ == "__main__":
    s = get_settings()
    if s.engine == "transformers":
        EngineState(s).load()
        print("models cached")

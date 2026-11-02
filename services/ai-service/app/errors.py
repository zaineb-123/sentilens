class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str, details=None):
        super().__init__(message)
        self.status, self.code, self.message, self.details = status, code, message, details


class EngineError(ApiError):
    """Model backend unavailable or failed. The caller (analysis-service) should retry."""

    def __init__(self, message: str):
        super().__init__(503, "ENGINE_UNAVAILABLE", message)

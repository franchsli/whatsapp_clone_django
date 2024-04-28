"""Exceptions for global use."""
class ModelNotFoundException(Exception):
    def __init__(self, message="NO MODEL FOUND WITH SUCH ARGUMENT") -> None:
        self.message = message
        super().__init__(self.message)

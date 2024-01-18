class UserNotFoundException(Exception):
    def __init__(self, message='NO USER FOUND WITH SUCH ARGUMENT') -> None:
        self.message = message
        super().__init__(self.message)
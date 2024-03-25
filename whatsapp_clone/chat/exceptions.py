class UserNotFoundException(Exception):
    def __init__(self, message='NO USER FOUND WITH SUCH ARGUMENT') -> None:
        self.message = message
        super().__init__(self.message)

class ChatNotFoundException(Exception):
    def __init__(self, message='NO CHAT FOUND WITH SUCH ARGUMENT') -> None:
        self.message = message
        super().__init__(self.message)
    
class StatusNotFoundException(Exception):
    def __init__(self, message='NO STATUS FOUND WITH SUCH ARGUMENT') -> None:
        self.message = message
        super().__init__(self.message)
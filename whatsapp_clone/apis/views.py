from chat.models import Message, Chat, User
from .serializers import UserSerializer, MessageSerializer, ChatSerializer
from rest_framework.viewsets import ModelViewSet
# Create your views here.
class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

class ChatViewSet(ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer


# Create your views here.

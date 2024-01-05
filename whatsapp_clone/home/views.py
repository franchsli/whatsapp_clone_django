from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Message, Chat, Profile
from .serializers import UserSerializer, MessageSerializer, ChatSerializer, ProfileSerializer
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

class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

def home(request):
    return render(request, 'home.html', {})

from django.shortcuts import render
from chat.models import Message, Chat, User, Contact, Status
from .serializers import (
    UserSerializer,
    MessageSerializer,
    ChatSerializer,
    ContactSerializer,
    StatusSerializer,
)
from rest_framework.viewsets import ModelViewSet


# Create your views here.
class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ContactViewSet(ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


class ChatViewSet(ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer


class StatusViewSet(ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

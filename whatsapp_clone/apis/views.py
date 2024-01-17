from django.shortcuts import render
from chat.models import Message, Chat, User, Contact
from .serializers import UserSerializer, MessageSerializer, ChatSerializer, ContactSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response
import rest_framework.status as status
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


# Create your views here.
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def chats_api_view(request):
    user_instance = User.objects.get(id=request.user.id)
    chats = user_instance.chats.all()
    if request.method == 'GET':
        chat_serializer = ChatSerializer(instance=chats, many=True)
        return Response(data=chat_serializer.data, status=status.HTTP_200_OK)



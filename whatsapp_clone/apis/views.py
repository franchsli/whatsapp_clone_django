from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, ModelMultipleChoiceFilter
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
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['phone_number']


class ContactViewSet(ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['phone_number', 'created_by']


class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer





class ChatViewSet(ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
def get_queryset(self):
    queryset = self.queryset.select_related('users')  # Pre-fetch related users

    user_ids = self.request.query_params.getlist('user_id')  # Get a list of user IDs

    if user_ids:
        queryset = queryset.filter(users__id__in=user_ids).distinct()

    return queryset



class StatusViewSet(ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

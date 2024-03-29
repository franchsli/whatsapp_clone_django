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


class ChatFilter(FilterSet):
    users = ModelMultipleChoiceFilter(
        field_name='users',
        to_field_name = 'id',
        queryset=User.objects.all(),
        lookup_expr='exact'
        )
    class Meta:
        model = Chat
        fields = ['users']


class ChatViewSet(ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ChatFilter


class StatusViewSet(ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

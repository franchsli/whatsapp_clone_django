from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

user_router = DefaultRouter()
user_router.register(r'users', views.UserViewSet, 'users')

message_router = DefaultRouter()
message_router.register(r'messages', views.MessageViewSet, 'messages')

chat_router = DefaultRouter()
chat_router.register(r'chats', views.ChatViewSet, 'chats')

profile_router = DefaultRouter()
profile_router.register(r'profiles', views.ProfileViewSet, 'profiles')
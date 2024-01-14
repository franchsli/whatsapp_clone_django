from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

user_router = DefaultRouter()
user_router.register(r'users', views.UserViewSet, 'users')

message_router = DefaultRouter()
message_router.register(r'messages', views.MessageViewSet, 'messages')

chat_router = DefaultRouter()
chat_router.register(r'chats', views.ChatViewSet, 'chats')


urlpatterns = [
    path('', include(user_router.urls)),
    path('', include(message_router.urls)),
    path('', include(chat_router.urls)),
]

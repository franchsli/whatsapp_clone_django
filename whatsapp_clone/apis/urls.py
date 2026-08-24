from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

user_router = DefaultRouter()
user_router.register(r"users", views.UserViewSet, "users")

contact_router = DefaultRouter()
contact_router.register(r"contacts", views.ContactViewSet, "contacts")

message_router = DefaultRouter()
message_router.register(r"messages", views.MessageViewSet, "messages")

chat_router = DefaultRouter()
chat_router.register(r"chats", views.ChatViewSet, "chats")

status_router = DefaultRouter()
status_router.register(r"status", views.StatusViewSet, "status")


urlpatterns = [
    path("", include(user_router.urls)),
    path("", include(contact_router.urls)),
    path("", include(message_router.urls)),
    path("", include(chat_router.urls)),
    path("", include(status_router.urls)),
]

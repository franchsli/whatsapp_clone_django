from django.urls import path

from .consumers import ChatConsumer, StatusConsumer

websocket_urlpatterns = [
    path("", ChatConsumer.as_asgi()),
    path("status/", StatusConsumer.as_asgi()),
]

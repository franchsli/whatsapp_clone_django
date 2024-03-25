from .consumers import ChatConsumer, StatusConsumer
from django.urls import path

websocket_urlpatterns = [
    path('', ChatConsumer.as_asgi()),
    path('/status/', StatusConsumer.as_asgi()),
]
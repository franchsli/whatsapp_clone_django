from django.urls import path
from . import views


urlpatterns = [
    path('', views.chat, name='chat'),
    #htmx
    path('chats/', views.get_chats, name='get_chats')
]

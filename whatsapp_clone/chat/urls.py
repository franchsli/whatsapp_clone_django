from django.urls import path
from . import views


urlpatterns = [
    path('', views.chat, name='chat'),
    #htmx
    path('chats/', views.get_chats, name='get_chats'),
    path('contacts/', views.get_contacts, name='get_contacts')
]

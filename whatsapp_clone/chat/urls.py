from django.urls import path
from . import views


urlpatterns = [
    path('', views.chat, name='chat'),
    #htmx
    path('chats/', views.get_chats, name='get_chats'),
    path('display_chat/<int:pk>', views.display_chat, name='display_chat'),
    path('delete_chat/<int:pk>', views.delete_chat, name='delete_chat'),
    path('contacts/', views.get_contacts, name='get_contacts'),
    path('get_contact/<int:pk>', views.get_contact, name='get_contact'),
    path('edit_contact/<int:pk>', views.edit_contact, name='edit_contact'),
    path('delete_contacts/<int:pk>', views.delete_contact, name='delete_contact'),
    path('get_message/<int:pk>', views.get_message, name='get_message'),
    path('edit_message/<int:pk>', views.edit_message, name='edit_message')
]

from django.urls import path
from . import views


urlpatterns = [
    path('', views.chat, name='chat'),
    #htmx
    path('chats/', views.get_chats, name='get_chats'),
    path('delete_chat/<int:pk>', views.delete_chat, name='delete_chat'),
    path('contacts/', views.get_contacts, name='get_contacts'),
    path('get_contact/<int:pk>', views.get_contact, name='get_contact'),
    path('edit_contact/<int:pk>', views.edit_contact, name='edit_contact'),
    path('delete_contacts/<int:pk>', views.delete_contact, name='delete_contact')
]

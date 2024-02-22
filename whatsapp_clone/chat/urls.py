from django.urls import path
from . import views


urlpatterns = [
    path('', views.chat, name='chat'),
    #htmx
    path('chats/', views.get_chats, name='get_chats'),
    path('archived_chats', views.get_archived_chats, name='archived_chats'),
    path('display_user_ui/', views.display_user_ui, name='display_user_ui'),
    path('display_chat/<int:pk>', views.display_chat, name='display_chat'),
    path('delete_chat/<int:pk>', views.delete_chat, name='delete_chat'),
    path('contacts/', views.get_contacts, name='get_contacts'),
    path('get_contact/<int:pk>', views.get_contact, name='get_contact'),
    path('edit_contact/<int:pk>', views.edit_contact, name='edit_contact'),
    path('delete_contacts/<int:pk>', views.delete_contact, name='delete_contact'),
    path('get_message/<int:pk>', views.get_message, name='get_message'),
    path('edit_message/<int:pk>', views.edit_message, name='edit_message'),
    path('delete_message/<int:chat_id>/<int:message_id>', views.delete_message, name='delete_message'),
    path('update_chat_form/', views.update_chat_form, name='update_chat_form'),
    path('statuses/', views.get_statuses, name='statuses'),
    path('create_status/<str:text>/<str:image>', views.create_status, name='create_status'),
]

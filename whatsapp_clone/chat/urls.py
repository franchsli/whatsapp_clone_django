from django.urls import path
from . import views
from django.conf.urls.static import static
import whatsapp_clone.settings as settings


urlpatterns = [
    path("", views.chat, name="chat"),
    # htmx
    path("chats/<str:archived>", views.chats, name="chats"),
    path("unread_chats/<str:archived>", views.unread_chats, name="unread_chats"),
    path("groups/<str:archived>", views.group_chats, name="groups"),
    path(
        "archive_chat/<int:chat_id>/<str:archive>/",
        views.archive_chat,
        name="archive_chat",
    ),
    path("display_user_ui/", views.display_user_ui, name="display_user_ui"),
    path("display_chat/<int:pk>", views.display_chat, name="display_chat"),
    path("contacts/", views.get_contacts, name="get_contacts"),
    path("get_contact/<int:pk>", views.get_contact, name="get_contact"),
    path("edit_contact/<int:pk>", views.edit_contact, name="edit_contact"),
    path("delete_contacts/<int:pk>", views.delete_contact, name="delete_contact"),
    path("get_message/<int:pk>", views.get_message, name="get_message"),
    path("edit_message/<int:pk>", views.edit_message, name="edit_message"),
    path(
        "delete_message/<int:chat_id>/<int:message_id>",
        views.delete_message,
        name="delete_message",
    ),
    path("star_message/<int:pk>", views.star_message, name="star_message"),
    path("unstar_message/<int:pk>", views.unstar_message, name="unstar_message"),
    path(
        "previous_messages/<int:chat_id>/<str:datetime>/",
        views.get_previous_messages,
        name="previous_messages",
    ),
    path("append_message/<int:chat_id>/", views.append_message, name="append_message"),
    path("starred_messages/", views.starred_messages, name="starred_messages"),
    path("update_chat_form/", views.update_chat_form, name="update_chat_form"),
    path("statuses/", views.get_statuses, name="statuses"),
    path("create_status/", views.create_status, name="create_status"),
    path(
        "mute_contact_statuses/<int:contact_id>/<str:mute>/",
        views.mute_contact_statuses,
        name="mute_contact_statuses",
    ),
    path("user_info/", views.user_info, name="user_info"),
    path("edit_user_info/", views.edit_user_info, name="edit_user_info"),
    path("chats_selection/", views.chats_selection, name="chats_selection"),
    path("leave_group/<str:pk>/<str:archived>", views.leave_group, name="leave_group"),
    path("delete_group/<str:pk>/<str:archived>", views.delete_group, name="delete_group"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

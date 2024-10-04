from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Max
from django.http import HttpResponseNotAllowed
from .models import User, Chat, Contact, Message, Status
from .forms import UserForm, ChatForm, ContactForm, MessageForm, StatusForm
from typing import Union
from .tools import get_contacts_statuses, chat_is_unread_by_user


@login_required
def chat(request):
    chat_form = ChatForm(initial={"users": request.user})
    contact_form = ContactForm(initial={"created_by": request.user})
    status_form = StatusForm(
        initial={"uploaded_by": request.user, "upload_date": timezone.now}
    )
    contacts = request.user.contacts.all().order_by("name")
    archived_unread_chats_num = 0
    for chat in request.user.archived_chats.all():
        if (
            not chat.last_message.read
            and chat.last_message.sender_user.id != request.user.id
        ):
            archived_unread_chats_num += 1

    return render(
        request,
        "index.html",
        {
            "chat_form": chat_form,
            "contacts": contacts,
            "contact_form": contact_form,
            "status_form": status_form,
            "archived_unread_chats_num": archived_unread_chats_num,
        },
    )


# htmx
def chats(request, archived:str):
    archived = True if archived == 'True' else False
    # returns the user chats ordered by the date of the latest message in the chat.
    chats = request.user.chats.annotate(
        last_message_date=Max("message__date")
    ).order_by("-last_message_date")
    user_chats = []
    for chat in chats:
        if chat.archived_by_user(request.user) == archived:
            user_chats.append(chat)
    if not archived:
        return render(
            request, "layouts/partials/components/chats.html", {"chats": user_chats}
        )
    else:
        return render(
        request,
        "layouts/partials/archived_chats.html",
        {"chats": user_chats},)



def unread_chats(request, archived:str):
    archived = True if archived == 'True' else False
    # returns the user chats ordered by the date of the latest message in the chat.
    chats = request.user.chats.annotate(
        last_message_date=Max("message__date")
    ).order_by("-last_message_date")
    user_chats = []
    for chat in chats:
        if chat.archived_by_user(request.user) == archived:
            if chat_is_unread_by_user(chat, request.user):
                user_chats.append(chat) 
            
    return render(
        request, "layouts/partials/components/chats.html", {"chats": user_chats}
    )


def group_chats(request, archived:str):
    # returns the user chats ordered by the date of the latest message in the group.
    archived = True if archived == 'True' else False
    groups = (
        request.user.chats.filter(admins__isnull=False)
        .annotate(last_message_date=Max("message__date"))
        .order_by("-last_message_date")
    )
    chat_groups = []
    for group in groups:
        if group.archived_by_user(request.user) == archived:
            chat_groups.append(group)

    return render(request, "layouts/partials/components/chats.html", {"chats": chat_groups})


def archive_chat(request, chat_id, archive):
    if request.method == "PATCH":
        # converts the str to boolean
        archive = True if archive == "True" else False
        chat = Chat.objects.get(id=chat_id)
        # returns all the desired chats depending on archive arg value
        if archive == True:
            request.user.archived_chats.add(chat)
            return redirect("chats", archived="False")
        else:
            request.user.archived_chats.remove(chat)
            return redirect("chats", archived="True")
    else:
        return HttpResponseNotAllowed(["PATCH"])


def display_user_ui(request):
    if request.method == "GET":
        archived_unread_chats_num = 0
        for chat in request.user.archived_chats.all():
            if (
                not chat.last_message.read
                and chat.last_message.sender_user.id != request.user.id
            ):
                archived_unread_chats_num += 1

        return render(
            request,
            "layouts/partials/user_interface.html",
            {
                "chats": request.user.chats.all(),
                "contacts": request.user.contacts.all().order_by("name"),
                "archived_unread_chats_num": archived_unread_chats_num,
            },
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def display_chat(request, pk):
    if request.method == "GET":
        chat = Chat.objects.get(id=pk)
        unread_messages = chat.message_set.filter(read=False).exclude(
            sender_user__pk=request.user.id
        )
        if unread_messages.exists():
            # retrieves all the unread messages in the chat
            chat_messages = unread_messages.order_by("date")
            for message in chat_messages:
                message.read = True
                message.save()

        else:
            # retrieves the last 20 messages in the chat
            chat_messages = chat.message_set.order_by("-date")[:20:-1]
            for message in chat_messages:
                if not message.read and message.sender_user.pk != request.user.id:
                    message.read = True
                    message.save()

        return render(
            request,
            "layouts/partials/selected-chat.html",
            {"chat": chat, "messages": chat_messages},
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def delete_chat(request, pk):
    if request.method == "PATCH":
        chat:Chat = Chat.objects.get(id=pk)
        request.user.deleted_chats.add(chat)
        if chat.users.count() == 0:
            chat.delete()
        return redirect("chats")
    else:
        return HttpResponseNotAllowed(["PATCH"])


def get_contacts(request):
    if request.method == "GET":
        contacts = request.user.contacts.all()
        return render(
            request, "layouts/partials/components/contacts.html", {"contacts": contacts}
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def get_contact(request, pk):
    if request.method == "GET":
        contact = Contact.objects.get(id=pk)
        return render(
            request, "layouts/partials/components/contact.html", {"contact": contact}
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def edit_contact(request, pk):
    if request.method == "GET":
        contact = Contact.objects.get(id=pk)
        contact_form = ContactForm(instance=contact)
        return render(
            request,
            "layouts/partials/components/edit_contact.html",
            {
                "contact": contact,
                "contact_form": contact_form,
            },
        )
    elif request.method == "POST":
        contact = Contact.objects.get(id=pk)
        contact_form = ContactForm(request.POST, instance=contact)
        if contact_form.is_valid():
            contact_form.save()
        return render(
            request, "layouts/partials/components/contact.html", {"contact": contact}
        )
    else:
        return HttpResponseNotAllowed(["GET", "POST"])


def delete_contact(request, pk):
    if request.method == "DELETE":
        contact = Contact.objects.get(id=pk)
        contact.delete()
        contacts = request.user.contacts.all()
        return render(
            request, "layouts/partials/components/contacts.html", {"contacts": contacts}
        )
    else:
        return HttpResponseNotAllowed(["DELETE"])


def get_message(request, pk):
    if request.method == "GET":
        message = Message.objects.get(id=pk)
        return render(
            request, "layouts/partials/components/message.html", {"message": message}
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def edit_message(request, pk):
    if request.method == "GET":
        message_instance = Message.objects.get(id=pk)
        message_form = MessageForm(instance=message_instance, initial={"edited": True})
        return render(
            request,
            "layouts/partials/components/edit_message.html",
            {
                "message": message_instance,
                "message_form": message_form,
            },
        )
    elif request.method == "POST":
        message_instance = Message.objects.get(id=pk)
        message_form = MessageForm(request.POST, instance=message_instance)
        if message_form.is_valid():
            message_form.save()
        return render(
            request,
            "layouts/partials/components/message.html",
            {"message": message_instance},
        )
    else:
        return HttpResponseNotAllowed(["GET", "POST"])


def delete_message(request, chat_id, message_id):
    if request.method == "DELETE":
        message_instance = Message.objects.get(id=message_id)
        message_instance.delete()
        chat = Chat.objects.get(id=chat_id)
        # retrieves the last 20 messages in the chat
        chat_messages = chat.message_set.order_by("-date")[:20:-1]
        return render(
            request,
            "layouts/partials/components/messages.html",
            {"chat": chat, "messages": chat_messages},
        )
    else:
        return HttpResponseNotAllowed(["DELETE"])


def star_message(request, pk):
    if request.method == "PATCH":
        message = Message.objects.get(id=pk)
        request.user.starred_messages.add(message)
        return render(
            request, "layouts/partials/components/message.html", {"message": message}
        )
    else:
        return HttpResponseNotAllowed(["PATCH"])


def unstar_message(request, pk):
    if request.method == "PATCH":
        message = Message.objects.get(id=pk)
        request.user.starred_messages.remove(message)
        return render(
            request, "layouts/partials/components/message.html", {"message": message}
        )
    else:
        return HttpResponseNotAllowed(["PATCH"])


def get_previous_messages(request, chat_id, datetime):
    """Returns the messages in the chat with the
    given id before the provided datetime
    """
    if request.method == "GET":
        chat = Chat.objects.get(id=chat_id)
        # gets the most recent 20 messages before the given datetime
        chat_messages = chat.message_set.filter(date__lt=datetime).order_by("-date")[
            :20
        ]
        # sorts them in ascending order (datetime)
        chat_messages = chat_messages[::-1]
        return render(
            request,
            "layouts/partials/components/append_messages.html",
            {"chat": chat, "messages": chat_messages},
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def append_message(request, chat_id):
    """Returns the latest message in
    the chat with the given id"""
    if request.method == "GET":
        chat = Chat.objects.get(id=chat_id)
        # gets the latest messaege
        chat_message = chat.message_set.order_by("-date").first()
        chat_message.read = True
        chat_message.save()
        # storing it into a iterable to avoid errors
        # in django template for-loop
        messages_iterable = [chat_message]
        return render(
            request,
            "layouts/partials/components/append_messages.html",
            {"chat": chat, "messages": messages_iterable},
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def starred_messages(request):
    chats_list = list(request.user.chats.values_list("id", flat=True))
    messages = Message.objects.filter(
        chat__in=chats_list, starred_by__id=request.user.id
    )
    return render(
        request, "layouts/partials/starred_messages.html", {"messages": messages}
    )


def update_chat_form(request):
    if request.method == "GET":
        contacts = request.user.contacts.all()
        return render(
            request, "layouts/partials/chat_form_elements.html", {"contacts": contacts}
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def get_statuses(request):
    contacts_statuses = get_contacts_statuses(request.user, False)
    muted_contacts_statuses = get_contacts_statuses(request.user, True)
    # Query for statuses uploaded by the user
    user_statuses = Status.objects.filter(uploaded_by=request.user).order_by(
        "upload_date"
    )

    return render(
        request,
        "layouts/partials/statuses.html",
        {
            "user_statuses": user_statuses,
            "contacts_with_statuses": contacts_statuses,
            "muted_contacts_with_statuses": muted_contacts_statuses,
        },
    )


def mute_contact_statuses(request, contact_id: Union[str, int], mute: bool):
    if request.method == "PATCH":
        try:
            contact_to_mute = Contact.objects.get(id=contact_id)
            contact_to_mute.statuses_muted = True if mute == "True" else False
            contact_to_mute.save()

        except Contact.DoesNotExist:
            raise ObjectDoesNotExist(f"NO CONTACT FOUND WITH SUCH ID: {contact_id}")

        finally:
            return redirect("statuses")
    else:
        return HttpResponseNotAllowed(["PATCH"])


def create_status(request):
    if request.method == "POST":
        # gets the text and the image for the status creation
        text = request.POST.get("text")
        image = request.FILES.get("image")
        # new status creation
        if image or text:
            new_status = Status.objects.create(
                uploaded_by=request.user, upload_date=timezone.now()
            )
            if text:
                new_status.text = text
                new_status.save()

            if image:
                new_status.image.save(
                    f"user_status_{new_status.id}.{image.content_type.split('/')[-1]}",
                    image,
                )
                new_status.save()

        return redirect("statuses")
    else:
        return HttpResponseNotAllowed(["POST"])

def user_settings(request):
    return render(request, "layouts/partials/user_settings.html", {})


def user_info(request):
    if request.method == "GET":
        return render(request, "layouts/partials/user_info.html", {})

    else:
        return HttpResponseNotAllowed(["GET", "POST"])


def edit_user_info(request):
    if request.method == "GET":
        user_instance = User.objects.get(id=request.user.id)
        user_form = UserForm(instance=user_instance)
        return render(
            request,
            "layouts/partials/components/user_form.html",
            {
                "user_form": user_form,
            },
        )
    elif request.method == "POST":
        user_instance = User.objects.get(id=request.user.id)
        user_form = UserForm(request.POST, instance=user_instance)
        if user_form.is_valid():
            user_form.save()
        return redirect("user_info")
    else:
        return HttpResponseNotAllowed(["GET", "POST"])

def chats_selection(request):
    if request.method == "GET":
        return render(request, "layouts/partials/components/chats_selection.html", {})
    else:
        return HttpResponseNotAllowed(["GET"])
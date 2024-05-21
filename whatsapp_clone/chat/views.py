from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Max
from django.http import HttpResponseNotAllowed
from .models import Chat, Contact, Message, Status
from .forms import ChatForm, ContactForm, MessageForm, StatusForm
from typing import Union
from .tools import get_contact_in_chat, get_contacts_statuses, chat_is_unread_by_user


@login_required
def chat(request):
    chats = request.user.chats.all()
    chat_form = ChatForm(initial={"users": request.user})
    contact_form = ContactForm(initial={"created_by": request.user})
    status_form = StatusForm(
        initial={"uploaded_by": request.user, "upload_date": timezone.now}
    )
    contacts = request.user.contact_set.all().order_by("name")

    return render(
        request,
        "index.html",
        {
            "chats": chats,
            "chat_form": chat_form,
            "contacts": contacts,
            "contact_form": contact_form,
            "status_form": status_form,
        },
    )


# htmx
def get_chats(request):
    # returns the user chats ordered by the date of the latest message in the chat.
    chats = request.user.chats.annotate(
        last_message_date=Max("message__date")
    ).order_by("-last_message_date")
    user_chats = []
    for chat in chats:
        contact = get_contact_in_chat(chat, request.user)
        if contact:
            if not contact.archived:
                user_chats.append(chat)
        # if no contact is found it means is an unknow phone
        # display it as normal chat
        else:
            user_chats.append(chat)

    return render(
        request, "layouts/partials/components/chats.html", {"chats": user_chats}
    )


def get_unread_chats(request):
    # returns the user chats ordered by the date of the latest message in the chat.
    chats = request.user.chats.annotate(
        last_message_date=Max("message__date")
    ).order_by("-last_message_date")
    user_chats = []
    for chat in chats:
        contact = get_contact_in_chat(chat, request.user)
        if contact:
            if not contact.archived and chat_is_unread_by_user(chat, request.user):
                user_chats.append(chat)
        # if no contact is found it means is an unknow phone
        # display it as normal chat only if it's unread.
        elif not contact and chat_is_unread_by_user(chat, request.user):
            user_chats.append(chat)

    return render(
        request, "layouts/partials/components/chats.html", {"chats": user_chats}
    )


def get_archived_chats(request):
    # returns the user chats ordered by the date of the latest message in the chat.
    chats = request.user.chats.annotate(
        last_message_date=Max("message__date")
    ).order_by("-last_message_date")
    user_archived_chats = []
    for chat in chats:
        contact = get_contact_in_chat(chat, request.user)
        if contact:
            if contact.archived:
                user_archived_chats.append(chat)

    return render(
        request,
        "layouts/partials/archived_chats.html",
        {"chats": user_archived_chats},
    )


def unread_archived_chats(request):
    # returns the user chats ordered by the date of the latest message in the chat.
    chats = request.user.chats.annotate(
        last_message_date=Max("message__date")
    ).order_by("-last_message_date")
    user_unread_archived_chats = []
    for chat in chats:
        contact = get_contact_in_chat(chat, request.user)
        if contact:
            if contact.archived and chat_is_unread_by_user(chat, request.user):
                user_unread_archived_chats.append(chat)

    return render(
        request,
        "layouts/partials/components/chats.html",
        {"chats": user_unread_archived_chats},
    )
    pass


def get_group_chats(request):
    # returns the user chats ordered by the date of the latest message in the group.
    # EDIT THIS
    groups = (
        request.user.chats.filter(admins__isnull=False)
        .annotate(last_message_date=Max("message__date"))
        .order_by("-last_message_date")
    )

    return render(request, "layouts/partials/components/chats.html", {"chats": groups})


def archive_chat(request, chat_id, archive):
    if request.method == "PATCH":
        # converts the str to boolean
        archive = True if archive == "True" else False
        # arhives or unarchives the contact
        chat = Chat.objects.get(id=chat_id)
        contact = get_contact_in_chat(chat, request.user)
        contact.archived = archive
        contact.save()
        # returns all the desired chats depending on archive arg value
        if archive == True:
            return redirect("get_chats")
        else:
            return redirect("archived_chats")
    else:
        return HttpResponseNotAllowed(["PATCH"])


def display_user_ui(request):
    if request.method == "GET":
        chats = request.user.chats.all()
        contacts = request.user.contact_set.all().order_by("name")

        return render(
            request,
            "layouts/partials/user_interface.html",
            {
                "chats": chats,
                "contacts": contacts,
            },
        )
    else:
        return HttpResponseNotAllowed(["GET"])


def display_chat(request, pk):
    if request.method == "GET":
        chat = Chat.objects.get(id=pk)
        chat_messages = chat.message_set.all().order_by("date")
        for message in chat_messages.iterator():
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
    if request.method == "DELETE":
        chat = Chat.objects.get(id=pk)
        chat.delete()
        chats = request.user.chats.all()
        return render(
            request, "layouts/partials/components/chats.html", {"chats": chats}
        )
    else:
        return HttpResponseNotAllowed(["DELETE"])


def get_contacts(request):
    if request.method == "GET":
        contacts = request.user.contact_set.all()
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
        contacts = request.user.contact_set.all()
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
        chat_messages = chat.message_set.all().order_by("date")
        return render(
            request,
            "layouts/partials/components/messages.html",
            {"chat": chat, "messages": chat_messages},
        )
    else:
        return HttpResponseNotAllowed(["DELETE"])


def update_chat_form(request):
    if request.method == "GET":
        contacts = request.user.contact_set.all()
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
        print(f"TEXT:{text}\nIMAGE:{image}")
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

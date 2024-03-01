from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Q
from django.core.files.base import ContentFile
from .models import User, Chat, Contact, Message, Status
from .forms import ChatForm, ContactForm, MessageForm, StatusForm
from typing import Union, Optional
import base64


@login_required
def chat(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    chat_form = ChatForm(initial={"users": user_instance})
    contact_form = ContactForm(initial={"created_by": user_instance})
    status_form = StatusForm(
        initial={"uploaded_by": user_instance, "upload_date": timezone.now}
    )
    contacts = user_instance.contact_set.all().order_by("name")
    print(user_instance.has_photo)
    print(f"User:{user_instance.get_username()}")
    return render(
        request,
        "index.html",
        {
            "user": user_instance,
            "chats": chats,
            "chat_form": chat_form,
            "contacts": contacts,
            "contact_form": contact_form,
            "status_form": status_form,
        },
    )


# htmx
def get_chats(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    user_chats = []
    for chat in chats:
        contact = get_contact_in_chat(chat, user_instance)
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


def get_archived_chats(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    user_archived_chats = []
    for chat in chats:
        contact = get_contact_in_chat(chat, user_instance)
        if contact:
            if contact.archived:
                user_archived_chats.append(chat)

    return render(
        request, "layouts/partials/archived_chats.html", {"chats": user_archived_chats}
    )


def archive_chat(request, chat_id, archive):
    user_instance = User(id=request.user.id)
    # converts the str to boolean
    archive = True if archive == "True" else False
    # arhives or unarchives the contact
    chat = Chat.objects.get(id=chat_id)
    contact = get_contact_in_chat(chat, user_instance)
    contact.archived = archive
    contact.save()
    # returns all the desired chats depending on archive arg value
    chats = user_instance.chats.all()
    user_chats = []
    for chat in chats:
        contact = get_contact_in_chat(chat, user_instance)
        if contact:
            if not contact.archived and archive == True:
                user_chats.append(chat)
            elif contact.archived and archive == False:
                user_chats.append(chat)
        # if no contact is found it means is an unknow phone
        # display it as normal chat
        elif not contact and archive == True:
            user_chats.append(chat)

    return render(request, "layouts/partials/components/chats.html", {"chats": user_chats})


def display_user_ui(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    chat_form = ChatForm(initial={"users": user_instance})
    contact_form = ContactForm(initial={"created_by": user_instance})
    contacts = user_instance.contact_set.all().order_by("name")
    print(user_instance.has_photo)
    print(f"User:{user_instance.get_username()}")
    return render(
        request,
        "layouts/partials/user_interface.html",
        {
            "user": user_instance,
            "chats": chats,
            "contacts": contacts,
        },
    )


def display_chat(request, pk):
    user_instance = User(id=request.user.id)
    chat = Chat.objects.get(id=pk)
    chat_messages = chat.message_set.all().order_by("date")
    return render(
        request,
        "layouts/partials/selected-chat.html",
        {"user": user_instance, "chat": chat, "messages": chat_messages},
    )


def delete_chat(request, pk):
    user_instance = User(id=request.user.id)
    chat = Chat.objects.get(id=pk)
    chat.delete()
    chats = user_instance.chats.all()
    return render(request, "layouts/partials/components/chats.html", {"chats": chats})


def get_contacts(request):
    user_instance = User(id=request.user.id)
    contacts = user_instance.contact_set.all()
    return render(
        request, "layouts/partials/components/contacts.html", {"contacts": contacts}
    )


def get_contact(request, pk):
    contact = Contact.objects.get(id=pk)
    return render(
        request, "layouts/partials/components/contact.html", {"contact": contact}
    )


def edit_contact(request, pk):
    user_instance = User(id=request.user.id)
    if request.method == "GET":
        contact = Contact.objects.get(id=pk)
        contact_form = ContactForm(instance=contact)
        return render(
            request,
            "layouts/partials/components/edit_contact.html",
            {"contact": contact, "contact_form": contact_form, "user": user_instance},
        )
    else:
        contact = Contact.objects.get(id=pk)
        contact_form = ContactForm(request.POST, instance=contact)
        if contact_form.is_valid():
            contact_form.save()
        return render(
            request, "layouts/partials/components/contact.html", {"contact": contact}
        )


def delete_contact(request, pk):
    user_instance = User(id=request.user.id)
    contact = Contact.objects.get(id=pk)
    contact.delete()
    contacts = user_instance.contact_set.all()
    return render(
        request, "layouts/partials/components/contacts.html", {"contacts": contacts}
    )


def get_message(request, pk):
    message = Message.objects.get(id=pk)
    return render(
        request, "layouts/partials/components/message.html", {"message": message}
    )


def edit_message(request, pk):
    user_instance = User(id=request.user.id)
    if request.method == "GET":
        message_instance = Message.objects.get(id=pk)
        message_form = MessageForm(instance=message_instance)
        return render(
            request,
            "layouts/partials/components/edit_message.html",
            {
                "message": message_instance,
                "message_form": message_form,
                "user": user_instance,
            },
        )
    else:
        message_instance = Message.objects.get(id=pk)
        message_form = MessageForm(request.POST, instance=message_instance)
        if message_form.is_valid():
            message_form.save()
        return render(
            request,
            "layouts/partials/components/message.html",
            {"message": message_instance},
        )


def delete_message(request, chat_id, message_id):
    message_instance = Message.objects.get(id=message_id)
    message_instance.delete()
    chat = Chat.objects.get(id=chat_id)
    chat_messages = chat.message_set.all().order_by("date")
    return render(
        request,
        "layouts/partials/components/messages.html",
        {"chat": chat, "messages": chat_messages},
    )


def update_chat_form(request):
    user_instance = User(id=request.user.id)
    contacts = user_instance.contact_set.all()
    return render(
        request, "layouts/partials/chat_form_elements.html", {"contacts": contacts}
    )


def get_statuses(request):
    if request.method == "GET":
        user_instance = User(id=request.user.id)
        contacts = user_instance.contact_set.filter(statuses_muted=False)
        # Query for statuses uploaded by the user or the user's contacts
        user_statuses = Status.objects.filter(uploaded_by=user_instance)
        contacts_statuses = Status.objects.filter(
            uploaded_by__phone_number__in=contacts.values("phone_number")
        )
        contact_phone_numbers = contacts.values_list("phone_number", flat=True)
        statuses_with_contacts = Status.objects.filter(
            uploaded_by__phone_number__in=contact_phone_numbers
        )
        contacts_with_statuses = {}
        for status in statuses_with_contacts:
            contact = contacts.filter(
                phone_number=status.uploaded_by.phone_number
            ).first()
            if contact:
                contacts_with_statuses.setdefault(contact, []).append(status)
        print(len([value for value in contacts_with_statuses.values()]))
        print([value for value in contacts_with_statuses.values()])

    return render(
        request,
        "layouts/partials/statuses.html",
        {
            "contacts": contacts,
            "user_statuses": user_statuses,
            "contact_statuses": contacts_statuses,
            "contacts_with_statuses": contacts_with_statuses,
        },
    )


def get_muted_statuses(request):
    if request.method == "GET":
        user_instance = User(id=request.user.id)
        muted_contacts = user_instance.contact_set.filter(statuses_muted=True)
        contact_phone_numbers = muted_contacts.values_list("phone_number", flat=True)
        statuses_with_muted_contacts = Status.objects.filter(
            uploaded_by__phone_number__in=contact_phone_numbers
        )
        contacts_with_statuses = {}
        for status in statuses_with_muted_contacts:
            contact = muted_contacts.filter(
                phone_number=status.uploaded_by.phone_number
            ).first()
            if contact:
                contacts_with_statuses.setdefault(contact, []).append(status)
        print(len([value for value in contacts_with_statuses.values()]))
        print([value for value in contacts_with_statuses.values()])

    return render(
        request,
        "layouts/partials/muted_statuses.html",
        {
            "contacts_with_statuses": contacts_with_statuses,
        },
    )


def mute_contact_statuses(request, contact_id):
    try:
        contact_to_mute = Contact.objects.get(id=contact_id)
        contact_to_mute.statuses_muted = True
        contact_to_mute.save()

    except Contact.DoesNotExist:
        print("CONTACT NOT FOUND WITH SUCH ID")

    finally:
        user_instance = User(id=request.user.id)
        contacts = user_instance.contact_set.filter(statuses_muted=False)
        # Query for statuses uploaded by the user or the user's contacts
        user_statuses = Status.objects.filter(uploaded_by=user_instance)
        contacts_statuses = Status.objects.filter(
            uploaded_by__phone_number__in=contacts.values("phone_number")
        )
        contact_phone_numbers = contacts.values_list("phone_number", flat=True)
        statuses_with_contacts = Status.objects.filter(
            uploaded_by__phone_number__in=contact_phone_numbers
        )
        contacts_with_statuses = {}
        for status in statuses_with_contacts:
            contact = contacts.filter(
                phone_number=status.uploaded_by.phone_number
            ).first()
            if contact:
                contacts_with_statuses.setdefault(contact, []).append(status)
        print(len([value for value in contacts_with_statuses.values()]))
        print([value for value in contacts_with_statuses.values()])

        return render(
            request,
            "layouts/partials/statuses.html",
            {
                "contacts": contacts,
                "user_statuses": user_statuses,
                "contact_statuses": contacts_statuses,
                "contacts_with_statuses": contacts_with_statuses,
            },
        )


def unmute_contact_statuses(request, contact_id):
    try:
        contact_to_unmute = Contact.objects.get(id=contact_id)
        contact_to_unmute.statuses_muted = False
        contact_to_unmute.save()

    except Contact.DoesNotExist:
        print("CONTACT NOT FOUND WITH SUCH ID")

    finally:
        user_instance = User(id=request.user.id)
        contacts = user_instance.contact_set.filter(statuses_muted=False)
        # Query for statuses uploaded by the user or the user's contacts
        user_statuses = Status.objects.filter(uploaded_by=user_instance)
        contacts_statuses = Status.objects.filter(
            uploaded_by__phone_number__in=contacts.values("phone_number")
        )
        contact_phone_numbers = contacts.values_list("phone_number", flat=True)
        statuses_with_contacts = Status.objects.filter(
            uploaded_by__phone_number__in=contact_phone_numbers
        )
        contacts_with_statuses = {}
        for status in statuses_with_contacts:
            contact = contacts.filter(
                phone_number=status.uploaded_by.phone_number
            ).first()
            if contact:
                contacts_with_statuses.setdefault(contact, []).append(status)
        print(len([value for value in contacts_with_statuses.values()]))
        print([value for value in contacts_with_statuses.values()])

        return render(
            request,
            "layouts/partials/statuses.html",
            {
                "contacts": contacts,
                "user_statuses": user_statuses,
                "contact_statuses": contacts_statuses,
                "contacts_with_statuses": contacts_with_statuses,
            },
        )


def create_status(request, text: str, image: str):
    user_instance = User(id=request.user.id)
    contacts = user_instance.contact_set.all()
    # Query for statuses uploaded by the user or the user's contacts
    user_statuses = Status.objects.filter(uploaded_by=user_instance)
    contacts_statuses = Status.objects.filter(
        uploaded_by__phone_number__in=contacts.values("phone_number")
    )
    # new status creation
    if image != "" or text != "":
        new_status = Status.objects.create(
            uploaded_by=user_instance, upload_date=timezone.now()
        )
        if text != "":
            new_status.text = text
            new_status.save()

        if image != "":
            file_format, image_string_data = image.split(";base64,")
            # Get the file format extension (png, jpg, jpeg, etc.)
            file_extension = file_format.split("/")[-1]
            image_bytes_data = base64.b64decode(image_string_data)

            image_file = ContentFile(image_bytes_data, f"user_status.{file_extension}")
            new_status.image = image_file
            new_status.save()

    return render(
        request,
        "layouts/partials/statuses.html",
        {
            "contacts": contacts,
            "user_statuses": user_statuses,
            "contact_statuses": contacts_statuses,
        },
    )


# tool functions
def get_contact_in_chat(chat: Chat, logged_user: User) -> Union[Contact, None]:
    """Returns the contact object in the chat among all the users.

    Args:
        chat (Chat): The chat object
        logged_user (User): The currentlly logged user.

    Returns:
        Contact: The contact object in the Chat (if found).
        None: If the contact isn't found
    """
    # gets the user who is not the logged user in the chat
    other_user: User = chat.users.exclude(id=logged_user.pk).first()

    try:
        contact = Contact.objects.get(
            created_by=logged_user, phone_number=other_user.phone_number
        )
        return contact
    except Contact.DoesNotExist:
        print("CONTACT NOT FOUND!")
        return None

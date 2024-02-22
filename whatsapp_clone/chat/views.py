from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Q
from django.core.files.base import ContentFile
from .models import User, Chat, Contact, Message, Status
from .forms import ChatForm, ContactForm, MessageForm, StatusForm
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
    chats = user_instance.chats.filter(archived=False)
    return render(request, "layouts/partials/components/chats.html", {"chats": chats})


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
        contacts = user_instance.contact_set.all()
        # Query for statuses uploaded by the user or the user's contacts
        user_statuses = Status.objects.filter(uploaded_by=user_instance)
        contacts_statuses = Status.objects.filter(
            uploaded_by__phone_number__in=contacts.values("phone_number")
        )
        contact_phone_numbers = contacts.values_list('phone_number', flat=True)
        statuses_with_contacts = Status.objects.filter(uploaded_by__phone_number__in=contact_phone_numbers)
        contacts_with_statuses = {}
        for status in statuses_with_contacts:
            contact = contacts.filter(phone_number=status.uploaded_by.phone_number).first()
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

def get_archived_chats(request):
    pass
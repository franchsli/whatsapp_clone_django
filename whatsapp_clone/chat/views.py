from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import User, Chat, Contact
from .forms import ChatForm, ContactForm

@login_required
def chat(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    chat_form = ChatForm(initial={'users':user_instance})
    contact_form = ContactForm(initial={'created_by':user_instance})
    contacts = user_instance.contact_set.all().order_by('name')
    print(user_instance.has_photo) 
    print(f'User:{user_instance.get_username()}')
    return render(request, 'index.html', {'user':user_instance, 'chats':chats, 'chat_form': chat_form, 'contacts':contacts, 'contact_form':contact_form})

#htmx
def get_chats(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    return render(request, 'layouts/partials/components/chats.html', {'chats':chats})

def delete_chat(request, pk):
    user_instance = User(id=request.user.id)
    chat = Chat.objects.get(id=pk)
    chat.delete()
    chats = user_instance.chats.all()
    return render(request, 'layouts/partials/components/chats.html', {'chats':chats})


def get_contacts(request):
    user_instance = User(id=request.user.id)
    contacts = user_instance.contact_set.all()
    return render(request, 'layouts/partials/components/contacts.html', {'contacts':contacts})

def get_contact(request, pk):
    contact = Contact.objects.get(id=pk)
    return render(request, 'layouts/partials/components/contact.html', {'contact':contact})


def edit_contact(request, pk):
    user_instance = User(id=request.user.id)
    if request.method == 'GET':
        contact = Contact.objects.get(id=pk)
        contact_form = ContactForm(instance=contact)
        return render(request, 'layouts/partials/components/edit_contact.html', {'contact':contact, 'contact_form':contact_form, 'user':user_instance})
    else:
        contact = Contact.objects.get(id=pk)
        contact_form = ContactForm(request.POST, instance=contact)
        if contact_form.is_valid():
            contact_form.save()
        return render(request, 'layouts/partials/components/contact.html', {'contact':contact})


def delete_contact(request, pk):
    user_instance = User(id=request.user.id)
    contact = Contact.objects.get(id=pk)
    contact.delete()
    contacts = user_instance.contact_set.all()
    return render(request, 'layouts/partials/components/contacts.html', {'contacts':contacts})

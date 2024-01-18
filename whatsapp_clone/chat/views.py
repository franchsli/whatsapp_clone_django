from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import User, Chat, Contact
from .forms import ChatForm, ContactForm
from django.http import HttpResponse

@login_required
def chat(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    chat_form = ChatForm(initial={'users':user_instance})
    contact_form = ContactForm(initial={'created_by':user_instance})
    contacts = user_instance.contact_set.all().order_by('name') 
    return render(request, 'index.html', {'chats':chats, 'chat_form': chat_form, 'contacts':contacts, 'contact_form':contact_form})

#htmx
def get_chats(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    return render(request, 'layouts/partials/components/chats.html', {'chats':chats})
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import  Chat
from .models import User
from .forms import ChatForm
from django.http import HttpResponse

@login_required
def chat(request):
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    chat_form = ChatForm()
    if request.method == 'POST':
        chat_form = ChatForm(request.POST)
        if chat_form.is_valid():
            chat_form.save()
        else:
            return HttpResponse(chat_form.errors)
    return render(request, 'index.html', {'chats':chats, 'chat_form': ChatForm()})

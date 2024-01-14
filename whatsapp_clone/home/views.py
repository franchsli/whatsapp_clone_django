from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import  Chat
from .models import User

@login_required
def home(request):
    request.session['pollo'] = 'asado'
    user_instance = User(id=request.user.id)
    chats = user_instance.chats.all()
    return render(request, 'home.html', {'chats':chats})

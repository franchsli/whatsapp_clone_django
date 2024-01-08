from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Profile, Chat
from django.contrib.auth.models import User

@login_required
def home(request):
    request.session['pollo'] = 'asado'
    user_instance = User(id=request.user.id)
    user_profile = Profile(user=user_instance)
    chats = user_profile.chats.all()
    return render(request, 'home.html', {'chats':chats})

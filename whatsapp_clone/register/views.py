from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from .forms import CustomUserCreationForm

# Create your views here.
def register(request):
    data = {
        'form': CustomUserCreationForm()
    }
    if request.method == 'POST':
        ...

def exit(request):
    logout(request)
    return redirect('home')
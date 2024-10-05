from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from .forms import CustomUserCreationForm
from django.http import HttpResponse


# Create your views here.
def register(request):
    data = {"form": CustomUserCreationForm()}
    if request.method == "POST":
        new_user_form = CustomUserCreationForm(request.POST, request.FILES)
        if new_user_form.is_valid():
            new_user = new_user_form.save()
            login(request, new_user)
            return redirect("chat")
        else:
            return HttpResponse(f"INVALID FORM: {new_user_form.errors}")

    return render(request, "registration/register.html", data)


def exit(request):
    logout(request)
    return redirect("chat")

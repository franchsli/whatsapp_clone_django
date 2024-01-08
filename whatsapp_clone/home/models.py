from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.
class Message(models.Model):
    sender_user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    text = models.TextField(blank=False, null=False)
    date = models.DateTimeField(default=timezone.now)

class Chat(models.Model):
    users = models.ForeignKey(User, on_delete=models.CASCADE)
    messages = models.ForeignKey(Message, on_delete=models.CASCADE, blank=True, null=True)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    chats = models.ForeignKey(Chat, on_delete=models.CASCADE, blank=True, null=True)
    phone_number = PhoneNumberField(blank=True)
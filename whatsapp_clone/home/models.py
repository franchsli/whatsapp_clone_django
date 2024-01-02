from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.
class Message(models.Model):
    from_user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    to_user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    text = models.TextField(blank=False, null=False)
    date = models.DateTimeField(default=timezone.now)

class Chat(models.Model):
    from_user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    to_user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    messages = models.ForeignKey(Message, on_delete=models.CASCADE)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    chats = models.ForeignKey(Chat, on_delete=models.CASCADE)
    phone_number = PhoneNumberField()
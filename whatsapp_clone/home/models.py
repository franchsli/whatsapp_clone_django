from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    phone_number = PhoneNumberField(blank=True)

    def __str__(self) -> str:
        return self.user.username


class Chat(models.Model):
    profiles = models.ManyToManyField(Profile, related_name='chats')


class Message(models.Model):
    sender_user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    text = models.TextField(blank=False, null=False)
    date = models.DateTimeField(default=timezone.now)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self) -> str:
        return self.text
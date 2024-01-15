from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, UserManager
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.
class User(AbstractUser, UserManager):
    # custom fields
    phone_number = PhoneNumberField(unique=True)

    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'


class Contact(models.Model):
    name = models.CharField(max_length=36, blank=False, null=False)
    phone_number = models.CharField(max_length=10)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.name

class Chat(models.Model):
    users = models.ManyToManyField(User, related_name='chats')


class Message(models.Model):
    sender_user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=False, null=False)
    date = models.DateTimeField(default=timezone.now)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.text
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, UserManager
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.
class User(AbstractUser, UserManager):
    # custom fields
    phone_number = PhoneNumberField(unique=True)
    photo = models.ImageField(blank=True, null=True, upload_to='user/')

    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'

    @property
    def has_photo(self):
        try:
            return self.photo.url
        except ValueError:
            return False



class Contact(models.Model):
    name = models.CharField(max_length=36, blank=False, null=False)
    phone_number = PhoneNumberField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.name

class Chat(models.Model):
    users = models.ManyToManyField(User, related_name='chats')


class Message(models.Model):
    sender_user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=False, null=False)
    image = models.ImageField(blank=True, null=True, upload_to='messages/')
    date = models.DateTimeField(default=timezone.now)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.text
    
    @property
    def has_image(self):
        try:
            return self.image.url
        except ValueError:
            return False

class Status(models.Model):
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    image = models.ImageField(blank=True, null=True, upload_to='status/')
    upload_date = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return self.text if self.text else self.uploaded_by.username
    
    @property
    def has_image(self):
        try:
            return self.image.url
        except ValueError:
            return False

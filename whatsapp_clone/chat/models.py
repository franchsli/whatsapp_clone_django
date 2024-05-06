from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, UserManager
from phonenumber_field.modelfields import PhoneNumberField


# Create your models here.
class User(AbstractUser, UserManager):
    # custom fields
    phone_number = PhoneNumberField(unique=True)
    photo = models.ImageField(blank=True, null=True, upload_to="user/")

    USERNAME_FIELD = "username"
    EMAIL_FIELD = "email"

    @property
    def has_photo(self):
        return True if self.photo else False


class Contact(models.Model):
    name = models.CharField(max_length=36, blank=False, null=False)
    phone_number = PhoneNumberField()
    statuses_muted = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.name

    @property
    def user_exists(self) -> bool:
        """Returns if a user model exists with the contact object phone_number.

        Returns:
            bool: True if a user model exists with the contact object phone_number,
            False othewise.
        """
        return User.objects.get(phone_number=self.phone_number).exists()


class Chat(models.Model):
    users = models.ManyToManyField(User, related_name="chats")


class Group(Chat):
    admins = models.ManyToManyField(User, related_name="group_chat")
    name = models.CharField(max_length=72)

    def __str__(self) -> str:
        return self.name

    def user_is_admin(self, user: User) -> bool:
        """Returns if the provided user is an admin in the group

        Args:
            user (User): The user object

        Returns:
            bool: True if the User is in the queryset of admins
            False otherwise.
        """
        return user.group_chat.exists()


class Message(models.Model):
    sender_user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=False, null=False)
    image = models.ImageField(blank=True, null=True, upload_to="messages/")
    date = models.DateTimeField(default=timezone.now)
    edited = models.BooleanField(blank=False, null=False, default=False)
    read = models.BooleanField(blank=False, null=False, default=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.text

    @property
    def has_image(self):
        return True if self.image else False


class Status(models.Model):
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    image = models.ImageField(blank=True, null=True, upload_to="status/")
    upload_date = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return self.text

    @property
    def has_image(self):
        return True if self.image else False

    @property
    def has_text(self):
        return len(self.text) > 0

    class Meta:
        verbose_name_plural = "statuses"

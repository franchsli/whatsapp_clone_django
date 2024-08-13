from django.test import TestCase
from .models import User, Status, Message, Chat
from typing import Optional
from django.utils import timezone
from django.core.files.base import ContentFile
from .tools import ENCODED_IMAGE
from faker import Faker
import base64


# Create your tests here.
class UserTest(TestCase):
    def setUp(self) -> None:
        # Fake data variables:
        self.fake = Faker()
        self.fake_name = self.fake.name()
        self.fake_text = self.fake.text()
        self.user = User.objects.create(
            id=1, phone_number="3145538787", username=self.fake_name
        )

    def test_user_has_not_photo(self):
        self.assertFalse(self.user.has_photo)

    def test_user_has_photo(self):
        file_format, image_string_data = ENCODED_IMAGE.split(";base64,")
        # Get the file format extension (png, jpg, jpeg, etc.)
        file_extension = file_format.split("/")[-1]
        image_bytes_data = base64.b64decode(image_string_data)
        image_file = ContentFile(image_bytes_data, f"user_photo.{file_extension}")
        self.user.photo = image_file
        self.user.save()
        self.assertTrue(self.user.has_photo)


class MessageTest(TestCase):
    def setUp(self) -> None:
        # Fake data variables:
        self.fake = Faker()
        self.fake_name = self.fake.name()
        self.fake_text = self.fake.text()

        self.user = User.objects.create(
            id=1, phone_number="3145538787", username=self.fake_name
        )
        self.chat = Chat.objects.create()
        self.chat.users.add(self.user)
        self.message = Message.objects.create(
            id=1, sender_user=self.user, chat=self.chat
        )

    def test_message_has_not_image(self):
        self.assertFalse(self.message.has_image)

    def test_message_has_image(self):
        file_format, image_string_data = ENCODED_IMAGE.split(";base64,")
        # Get the file format extension (png, jpg, jpeg, etc.)
        file_extension = file_format.split("/")[-1]
        image_bytes_data = base64.b64decode(image_string_data)
        image_file = ContentFile(image_bytes_data, f"user_photo.{file_extension}")
        self.message.image = image_file
        self.message.save()
        self.assertTrue(self.message.has_image)


class ChatTest(TestCase):
    def setUp(self) -> None:
        # Fake data variables:
        self.fake = Faker()
        self.fake_name = self.fake.name()
        self.fake_text = self.fake.text()

        self.user = User.objects.create(
            id=1, phone_number="3145538787", username=self.fake_name
        )
        self.another_user = User.objects.create(
            id=2, phone_number="3105538780", username=self.fake_name
        )
        self.chat = Chat.objects.create()
        self.chat.users.add(self.user, self.another_user)
        self.another_chat = Chat.objects.create()
        self.another_chat.users.add(self.user, self.another_user)
        self.message = Message.objects.create(
            id=1, sender_user=self.user, chat=self.chat
        )
        self.another_message = Message.objects.create(
            id=2, sender_user=self.another_user, chat=self.chat
        )
        self.another_chat.admins.add(self.user)
        self.another_chat.save()

    def test_user_is_not_admin(self):
        self.chat.users.add(self.user)
        self.chat.save()
        self.assertFalse(self.chat.user_is_admin(self.user))

    def test_user_is_admin(self):
        self.chat.admins.add(self.user)
        self.chat.save()
        self.assertTrue(self.chat.user_is_admin(self.user))


class StatusTest(TestCase):
    def create_status(
        self,
        id: int,
        status_creator: User,
        text: Optional[str] = None,
        image: Optional[str] = None,
    ) -> None:
        if text or image:
            new_status = Status.objects.create(
                id=id, uploaded_by=status_creator, upload_date=timezone.now()
            )

            if text:
                new_status.text = text
                new_status.save()

            if image:
                file_format, image_string_data = image.split(";base64,")
                # Get the file format extension (png, jpg, jpeg, etc.)
                file_extension = file_format.split("/")[-1]
                image_bytes_data = base64.b64decode(image_string_data)
                image_file = ContentFile(
                    image_bytes_data, f"user_status.{file_extension}"
                )
                new_status.image = image_file
                new_status.save()

    def setUp(self) -> None:
        # Fake data variables:
        self.fake = Faker()
        self.fake_name = self.fake.name()
        self.fake_text = self.fake.text()
        
        self.user = User.objects.create(
            id=1, phone_number="3145538787", username=self.fake_name
        )
        self.status = Status.objects.create(id=1, uploaded_by=self.user)

    def test_user_exists(self):
        self.assertTrue(User.objects.get(id=1).exists())

    def test_status_exists(self):
        self.assertTrue(Status.objects.filter(id=1).exists())

    def test_blank_status_not_created(self):
        self.create_status(2, self.user)
        self.assertFalse(Status.objects.filter(id=2).exists())

    def test_text_only_status_created(self):
        self.create_status(2, self.user, self.fake_text)
        self.assertTrue(Status.objects.filter(id=2).exists())

    def test_image_only_status_created(self):
        self.create_status(3, self.user, image=ENCODED_IMAGE)
        self.assertTrue(Status.objects.filter(id=3).exists())

    def test_status_text_only(self):
        self.create_status(4, self.user, self.fake_text)
        status_instance = Status.objects.get(id=4)
        self.assertTrue(status_instance.has_text and status_instance.has_image == False)

    def test_status_image_only(self):
        self.create_status(5, self.user, image=ENCODED_IMAGE)
        status_instance = Status.objects.get(id=5)
        self.assertTrue(status_instance.has_image and status_instance.has_text == False)

    def test_full_status(self):
        self.create_status(6, self.user, self.fake_text, ENCODED_IMAGE)
        status_instance = Status.objects.get(id=6)
        self.assertTrue(status_instance.has_image and status_instance.has_text)

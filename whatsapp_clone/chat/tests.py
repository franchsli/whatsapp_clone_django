from django.test import TestCase
from .models import User, Status, Message, Chat, Contact
from django.utils import timezone
from django.core.files.base import ContentFile
from .tools import ENCODED_IMAGE, contact_from_user
from .templatetags.filters import replies_to
import base64


# Create your tests here.
class UserTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create(
            id=1, phone_number="3145538787", username="testfranch"
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
        self.user = User.objects.create(
            id=1, phone_number="3145538787", username="testfranch"
        )
        self.another_user = User.objects.create(
            id=2, phone_number="3145538788", username="anotheruser"
        )
        self.chat = Chat.objects.create()
        self.chat.users.add(self.user)
        self.message = Message.objects.create(
            id=1, sender_user=self.user, chat=self.chat
        )
        self.another_chat = Chat.objects.create()
        self.another_chat.users.add(self.user)
        self.another_message = Message.objects.create(
            id=2, sender_user=self.user, chat=self.another_chat
        )

        # Original messages to be replied to
        self.user_original_message = Message.objects.create(
            id=3, sender_user=self.user, chat=self.chat
        )
        self.another_user_original_message = Message.objects.create(
            id=4, sender_user=self.another_user, chat=self.chat
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

    def test_message_is_starred(self):
        self.user.starred_messages.add(self.message)
        self.assertTrue(self.message.starred_by_user(self.user))

    def test_message_is_not_starred(self):
        self.assertFalse(self.another_message.starred_by_user(self.user))

    def test_replies_to_when_user_replies_to_own_message(self):
        self.user_replies_self = Message.objects.create(
            id=5,
            sender_user=self.user,
            chat=self.chat,
            reply_to=self.user_original_message,
        )
        result = replies_to(self.user_replies_self, self.user)
        self.assertEqual(result, f"{self.user.username} (You)")

    def test_replies_to_when_another_user_replies_to_own_message(self):
        self.another_user_replies_self = Message.objects.create(
            id=6,
            sender_user=self.another_user,
            chat=self.chat,
            reply_to=self.another_user_original_message,
        )
        result = replies_to(self.another_user_replies_self, self.another_user)
        self.assertEqual(result, f"{self.another_user.username} (You)")

    def test_replies_to_when_user_replies_to_another_user(self):
        self.user_replies_another_user = Message.objects.create(
            id=7,
            sender_user=self.user,
            chat=self.chat,
            reply_to=self.another_user_original_message,
        )
        result = replies_to(self.user_replies_another_user, self.user)
        self.assertEqual(result, self.another_user.username)

    def test_replies_to_when_another_user_replies_to_user(self):
        self.another_user_replies_user = Message.objects.create(
            id=8,
            sender_user=self.another_user,
            chat=self.chat,
            reply_to=self.user_original_message,
        )
        result = replies_to(self.another_user_replies_user, self.another_user)
        self.assertEqual(result, self.user.username)


class ChatTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create(
            id=1, phone_number="3145538787", username="testfranch"
        )
        self.another_user = User.objects.create(
            id=2, phone_number="3105538780", username="testcontact"
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

    def test_archived_by_user(self):
        self.user.archived_chats.add(self.chat)
        self.assertTrue(self.chat.archived_by_user(self.user))

    def test_not_archived_by_user(self):
        self.assertFalse(self.another_chat.archived_by_user(self.user))


class StatusTest(TestCase):
    def create_status(
        self,
        id: int,
        status_creator: User,
        text: str | None = None,
        image: str | None = None,
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
        self.user = User.objects.create(
            id=1, phone_number="3145538787", username="testfranch"
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
        self.create_status(2, self.user, "HOLA MI GENTEEEEE")
        self.assertTrue(Status.objects.filter(id=2).exists())

    def test_image_only_status_created(self):
        self.create_status(3, self.user, image=ENCODED_IMAGE)
        self.assertTrue(Status.objects.filter(id=3).exists())

    def test_status_text_only(self):
        self.create_status(4, self.user, "ADIOS MI GENTEEEEE")
        status_instance = Status.objects.get(id=4)
        self.assertTrue(status_instance.has_text and not status_instance.has_image)

    def test_status_image_only(self):
        self.create_status(5, self.user, image=ENCODED_IMAGE)
        status_instance = Status.objects.get(id=5)
        self.assertTrue(status_instance.has_image and not status_instance.has_text)

    def test_full_status(self):
        self.create_status(6, self.user, "TEST", ENCODED_IMAGE)
        status_instance = Status.objects.get(id=6)
        self.assertTrue(status_instance.has_image and status_instance.has_text)

class ContactTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create(
            id=1, phone_number="3145538787", username="testfranch"
        )
        self.another_user = User.objects.create(
            id=2, phone_number="3145538788", username="anotheruser"
        )
        self.contact = Contact.objects.create(
            name="Another User",
            phone_number=self.another_user.phone_number,
            created_by=self.user,
        )

    def test_contact_from_user_returns_none_if_contact_does_not_exist(self):
        result = contact_from_user(self.user, "3145538799")
        self.assertIsNone(result)

    def test_contact_from_user_returns_contact_if_it_exists(self):
        result = contact_from_user(self.user, self.another_user.phone_number)
        self.assertEqual(result, self.contact)

from django.test import TestCase
from .models import Group, User, Status
from typing import Optional
from django.utils import timezone
from django.core.files.base import ContentFile
from .tools import ENCODED_IMAGE
import base64


# Create your tests here.
class GroupTest(TestCase):
    def setUp(self) -> None:
        user = User.objects.create(
            id=1, phone_number="3145538787", username="testfranch"
        )
        group = Group.objects.create(id=1, name="TESTGROUP")

    def test_user_exists(self):
        self.assertTrue(User.objects.get(id=1).exists())

    def test_user_is_not_admin(self):
        self.assertFalse(Group.objects.get(id=1).user_is_admin(User.objects.get(id=1)))

    def test_user_is_admin(self):
        user_instance = User.objects.get(id=1)
        group_instance = Group.objects.get(id=1)
        group_instance.admins.add(user_instance)
        group_instance.save()
        self.assertTrue(Group.objects.get(id=1).user_is_admin(User.objects.get(id=1)))


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
        self.assertTrue(status_instance.has_text and status_instance.has_image == False)

    def test_status_image_only(self):
        self.create_status(5, self.user, image=ENCODED_IMAGE)
        status_instance = Status.objects.get(id=5)
        self.assertTrue(status_instance.has_image and status_instance.has_text == False)
    
    def test_full_status(self):
        self.create_status(6, self.user, 'TEST', ENCODED_IMAGE)
        status_instance = Status.objects.get(id=6)
        self.assertTrue(status_instance.has_image and status_instance.has_text)

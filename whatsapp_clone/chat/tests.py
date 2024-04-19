from django.test import TestCase
from .models import Group
from .models import User


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

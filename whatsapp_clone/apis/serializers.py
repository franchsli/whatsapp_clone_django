from rest_framework.serializers import ModelSerializer
from chat.models import Message, Chat, User, Contact, Status


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "photo",
        )


class ContactSerializer(ModelSerializer):
    class Meta:
        model = Contact
        fields = "__all__"


class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"


class ChatSerializer(ModelSerializer):
    class Meta:
        model = Chat
        fields = "__all__"


class StatusSerializer(ModelSerializer):
    class Meta:
        model = Status
        fields = "__all__"

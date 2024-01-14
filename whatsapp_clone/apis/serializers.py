from rest_framework.serializers import ModelSerializer
from chat.models import Message, Chat, User

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')

class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class ChatSerializer(ModelSerializer):
    class Meta:
        model = Chat
        fields = '__all__'

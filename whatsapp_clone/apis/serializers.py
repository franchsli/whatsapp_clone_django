from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User
from home.models import Message, Chat, Profile

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email')

class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class ChatSerializer(ModelSerializer):
    class Meta:
        model = Chat
        fields = '__all__'

class ProfileSerializer(ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
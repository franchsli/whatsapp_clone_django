from .models import Chat
from django.forms import ModelForm

class ChatForm(ModelForm):
    class Meta:
        model = Chat
        fields = '__all__'
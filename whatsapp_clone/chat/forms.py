from .models import Chat, Contact
from django.forms import ModelForm, HiddenInput

class ChatForm(ModelForm):
    class Meta:
        model = Chat
        fields = '__all__'

class ContactForm(ModelForm):
    class Meta:
        model = Contact
        fields = '__all__'

        widgets = {
            'created_by':HiddenInput()
        }
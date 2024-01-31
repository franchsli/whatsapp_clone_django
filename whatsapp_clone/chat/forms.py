from .models import Chat, Contact, Message
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
            'created_by': HiddenInput()
        }

class MessageForm(ModelForm):
    class Meta:
        model = Message
        fields = '__all__'

        widgets = {
            # 'image': HiddenInput(),
            'date': HiddenInput(),
            'sender_user': HiddenInput(),
            'chat': HiddenInput()
        }
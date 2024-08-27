from .models import Chat, Contact, Message, Status
from django.forms import ModelForm, HiddenInput, Textarea


class ChatForm(ModelForm):
    class Meta:
        model = Chat
        fields = "__all__"


class ContactForm(ModelForm):
    class Meta:
        model = Contact
        fields = "__all__"

        widgets = {"created_by": HiddenInput()}


class MessageForm(ModelForm):
    class Meta:
        model = Message
        exclude = ('read', 'starred_by',)

        widgets = {
            "sender_user": HiddenInput(),
            "text": Textarea(attrs={"cols": 1, "rows": 1}),
            "date": HiddenInput(),
            "chat": HiddenInput(),
            "edited": HiddenInput(),
        }


class StatusForm(ModelForm):
    class Meta:
        model = Status
        fields = "__all__"

        widgets = {
            "uploaded_by": HiddenInput(),
            "text": Textarea(attrs={"cols": 1, "rows": 1}),
            "upload_date": HiddenInput(),
        }

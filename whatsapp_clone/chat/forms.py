from colorfield.widgets import ColorWidget
from django.forms import HiddenInput, ModelForm, Textarea

from .models import Chat, ChatBackground, Contact, Message, Status, User


class UserForm(ModelForm):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "username", "photo", "about")


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
        fields = (
            "text",
            "image",
        )

        widgets = {
            "text": Textarea(attrs={"cols": 1, "rows": 1}),
        }


class StatusForm(ModelForm):
    class Meta:
        model = Status
        fields = "__all__"

        widgets = {
            "uploaded_by": HiddenInput(),
            "text": Textarea(attrs={"cols": 1, "rows": 1}),
            "upload_date": HiddenInput(),
            "color": ColorWidget(),
        }


class ChatBackgroundForm(ModelForm):
    class Meta:
        model = ChatBackground
        fields = "__all__"

        widgets = {
            "user": HiddenInput(),
            "color": ColorWidget(),
        }

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import User, Chat, Message, Contact, Status
from .views import get_contact_in_chat
from django.utils import timezone
from django.core.files.base import ContentFile
from phonenumber_field.phonenumber import PhoneNumber
from typing import Union, Optional
from .exceptions import UserNotFoundException
import json, base64


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # default group name
        self.room_group_name = "test"
        self.user_instance = await self.get_user_by_id(self.scope["user"].id)
        self.user_specific_group_name = (
            f"user_group_{self.user_instance.phone_number.as_e164.replace('+', '')}"
        )

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add(
            self.user_specific_group_name, self.channel_name
        )
        await self.accept()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json["type"] == "message":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "text": f"{text_data_json['sender_user_id']}-{text_data_json['message']}-{text_data_json['image']}",
                },
            )
            self.receiver = text_data_json["contact_phone_number"].replace("+", "")
            print(f"user_group_{self.receiver}")

            await self.create_message(
                text_data_json["sender_user_id"],
                text_data_json["message"],
                text_data_json["image"],
                text_data_json["chat_id"],
            )
            chat_data = await self.get_chat(text_data_json["chat_id"])
            contact_in_chat = await database_sync_to_async(
                get_contact_in_chat(chat_data, self.user_instance)
            )
            if contact_in_chat.archived == False:
                await self.channel_layer.group_send(
                    f"user_group_{self.receiver}",
                    {
                        "type": "chat_notification",
                        "text": f"{text_data_json['sender_user_id']}{text_data_json['message']}",
                    },
                )

        elif text_data_json["type"] == "reconnect":
            group_name = text_data_json["reconnect_to"]
            print("reconnecting to group", group_name)
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            self.room_group_name = group_name
            print("room", self.room_group_name)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        elif text_data_json["type"] == "create_chat":
            contact = await self.get_user_by_phone(
                text_data_json["contact_phone_number"]
            )
            await self.create_chat([self.user_instance, contact])

        elif text_data_json["type"] == "create_contact":
            await self.create_contact(
                text_data_json["contact_name"], text_data_json["contact_phone_number"]
            )

    async def chat_message(self, event):
        await self.send(text_data=f"chat_message{event['text']}")

    async def chat_notification(self, event):
        await self.send(text_data=f"chat_notification{event['text']}")

    @database_sync_to_async
    def get_user_by_id(self, user_id: Union[str, int]) -> Union[object, Exception]:
        """Returns the user in the database found with the given id,
        raises an exception if not found

        Args:
            user_id (Union[str, int]): A numeric (integer) value that identify the user.

        Raises:
            UserNotFoundException: Raised when there's no user with the given id.

        Returns:
            Union[object, Exception]: The user object in the database or an exception if not found.
        """
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise UserNotFoundException("NO USER FOUND WITH SUCH ID")

    @database_sync_to_async
    def get_user_by_phone(self, phone_number: str) -> Union[object, Exception]:
        """Returns the user in the database found with the given phone_number,
        raises an exception if not found

        Args:
            phone_number (str): The phone number of the wanted user.

        Raises:
            UserNotFoundException: Raised when there's no user with such phone

        Returns:
            Union[object, Exception]: The user object in the database or an exception if not found.
        """
        try:
            return User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            raise UserNotFoundException("NO USER FOUND WITH SUCH PHONE")

    @database_sync_to_async
    def create_message(
        self,
        sender_user_id: Union[str, int],
        text: str,
        image: Optional[str],
        chat_id: Union[str, int],
    ) -> None:
        """Creates and stores a new message object in the database.

        Args:
            sender_user_id (Union[str, int]): The id (numeric value) of the user that sent the message.
            text (str): What the message says.
            image (str): The image encoded base64  image data.
            chat_id (Union[str, int]): The id (numeric value) of the chat that the sender sent this message on.
        """
        sender_user_instance = User.objects.get(id=sender_user_id)
        chat_instance = Chat.objects.get(id=chat_id)
        new_message = Message.objects.create(
            sender_user=sender_user_instance,
            text=text,
            date=timezone.now(),
            chat=chat_instance,
        )
        if image != "":
            file_format, image_string_data = image.split(";base64,")
            # Get the file format extension (png, jpg, jpeg, etc.)
            file_extension = file_format.split("/")[-1]

            image_bytes_data = base64.b64decode(image_string_data)

            image_file = ContentFile(image_bytes_data, f"user_message.{file_extension}")
            new_message.image = image_file
            new_message.save()

    @database_sync_to_async
    def create_chat(self, users: list) -> None:
        """Creates and stores a new chat object in the database.

        Args:
            users (list): A list containing at least two user objects that will be in the chat.
        """
        new_chat = Chat.objects.create()
        new_chat.users.set(users)
        new_chat.save()

    @database_sync_to_async
    def get_chat(
        self, chat_id: Union[str, int], field: str = ""
    ) -> Union[Chat, Chat._meta.fields]:
        """Returns the chat with the provided id or the value from the specified field
        in the found chat.

        Args:
            chat_id (Union[str, int]): The id of the chat to search.
            field (str, optional): The field to search in the found chat. Defaults to "".

        Raises:
            Exception: Raised if the chat is not found.

        Returns:
            Union[Chat, Chat._meta.fields]: Returns the entire chat object or the value from the desired field.
        """
        if field == "":
            try:
                return Chat.objects.get(id=chat_id)
            except Chat.DoesNotExist:
                raise Exception("NO CHAT FOUND WITH SUCH ID")
        else:
            chat = Chat.objects.get(id=chat_id)
            return chat.archived if field == "archived" else chat.users

    @database_sync_to_async
    def create_contact(self, contact_name: str, contact_phone_number: str) -> None:
        """Creates and stores a new contact object in the database.

        Args:
            contact_name (str): The name that the user thought for the contact.
            contact_phone_number (str): The phone number of the contact.
        """
        phone = PhoneNumber.from_string(contact_phone_number)
        new_contact = Contact.objects.create(
            name=contact_name, phone_number=phone.as_e164, created_by=self.user_instance
        )

    @database_sync_to_async
    def create_status(
        self,
        uploaded_by: Union[str, int],
        text: Optional[str] = None,
        image: Optional[str] = None,
    ) -> None:
        status_creator = User.objects.get(id=uploaded_by)
        if text and image:
            new_status = Status.objects.create(
                uploaded_by=status_creator, text=text, upload_date=timezone.now()
            )
            file_format, image_string_data = image.split(";base64,")
            # Get the file format extension (png, jpg, jpeg, etc.)
            file_extension = file_format.split("/")[-1]

            image_bytes_data = base64.b64decode(image_string_data)

            image_file = ContentFile(image_bytes_data, f"user_status.{file_extension}")
            new_status.image = image_file
            new_status.save()

        elif text and not image:
            new_status = Status.objects.create(
                uploaded_by=status_creator, text=text, upload_date=timezone.now()
            )

        else:
            new_status = Status.objects.create(
                uploaded_by=status_creator, upload_date=timezone.now()
            )
            file_format, image_string_data = image.split(";base64,")
            # Get the file format extension (png, jpg, jpeg, etc.)
            file_extension = file_format.split("/")[-1]

            image_bytes_data = base64.b64decode(image_string_data)

            image_file = ContentFile(image_bytes_data, f"user_status.{file_extension}")
            new_status.image = image_file
            new_status.save()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

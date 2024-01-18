from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from .models import User, Chat, Message, Contact
from django.utils import timezone
from phonenumber_field.phonenumber import PhoneNumber
import json


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # default group name
        self.room_group_name = "test"
        self.user_specific_group_name = f"user_group_{self.scope['user'].id}"
        self.user_instance = await self.get_user_by_id(self.scope["user"].id)

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
                    "text": f"{text_data_json['sender_user_id']}{text_data_json['message']}",
                },
            )
            self.receiver_id = await self.get_user_id(
                text_data_json["receiver_username"]
            )
            await self.channel_layer.group_send(
                f"user_group_{self.receiver_id}",
                {
                    "type": "chat_notification",
                    "text": f"{text_data_json['sender_user_id']}{text_data_json['message']}",
                },
            )
            await self.create_message(
                text_data_json["sender_user_id"],
                text_data_json["message"],
                text_data_json["chat_id"],
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
            user = await self.get_user_by_id(self.scope["user"].id)
            contact = await self.get_user_by_phone(
                text_data_json["contact_phone_number"]
            )
            await self.create_chat([user, contact])

        elif text_data_json["type"] == "create_contact":
            await self.create_contact(
                text_data_json["contact_name"], text_data_json["contact_phone_number"]
            )

    async def chat_message(self, event):
        await self.send(text_data=f"chat_message{event['text']}")

    async def chat_notification(self, event):
        await self.send(text_data=f"chat_notification{event['text']}")

    @database_sync_to_async
    def get_user_id(self, username:str):
        """Returns the user object id in the database with the given username if exists
        Raises an exception otherwise.

        Args:
            username (str): The username of the user that needs to be found.

        Raises:
            Exception: If not found.

        Returns:
            object: The found username
        """
        try:
            return User.objects.get(username=username).id
        except User.DoesNotExist:
            raise Exception('NO USER FOUND WITH SUCH USERNAME')

    @database_sync_to_async
    def get_user_by_id(self, user_id:str or int) -> object:
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def get_user_by_phone(self, phone_number:str) -> object:
        try:
            return User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            raise Exception("NO USER FOUND WITH SUCH PHONE")

    @database_sync_to_async
    def create_message(self, sender_user_id:str or int, text:str, chat_id:str or int) -> None:
        sender_user_instance = User.objects.get(id=sender_user_id)
        chat_instance = Chat.objects.get(id=chat_id)
        new_message = Message.objects.create(
            sender_user=sender_user_instance,
            text=text,
            date=timezone.now(),
            chat=chat_instance,
        )

    @database_sync_to_async
    def create_chat(self, users: list) -> None:
        new_chat = Chat.objects.create()
        new_chat.users.set(users)
        new_chat.save()

    @database_sync_to_async
    def create_contact(self, contact_name:str, contact_phone_number:str) -> None:
        phone = PhoneNumber.from_string(contact_phone_number)
        new_contact = Contact.objects.create(
            name=contact_name, phone_number=phone.as_e164, created_by=self.user_instance
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

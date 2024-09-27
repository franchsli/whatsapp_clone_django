from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import User, Chat, Message, Status
from .tools import *
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from typing import Union, Optional
import json


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # default group name
        self.room_group_name = "test"
        self.user_instance = self.scope["user"]
        self.user_specific_group_name = (
            f"user_group_{self.user_instance.phone_number.as_e164.replace('+', '')}"
        )

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        # joins the user to a unique group, which needs to be accessed by other users
        # if they want to communicate with said user.
        await self.channel_layer.group_add(
            self.user_specific_group_name, self.channel_name
        )
        await self.accept()

    async def receive(self, text_data):
        # transform the text_data (message received [json])
        # to a python dictionary
        self.text_data_json = json.loads(text_data)
        # handles the message as a 'request'
        # if the type of the 'request' is message, it means
        # a message needs to be created in the database with the dictionary data.
        if self.text_data_json["type"] == "message":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "text": f"{self.text_data_json['sender_user_id']}-{self.text_data_json['message']}-{self.text_data_json['image']}",
                },
            )
            self.chat_instance = await database_sync_to_async(get_object_by_id)(
                Chat, self.text_data_json["chat_id"]
            )

            await self.create_message(
                self.text_data_json["sender_user_id"],
                self.text_data_json["chat_id"],
                self.text_data_json["message"],
                self.text_data_json["image"],
            )
            print(self.text_data_json["chat_members_phones"])
            print(type(self.text_data_json["chat_members_phones"]))
            await self.send_message_notifications(self.text_data_json)

        # if the type of the 'request' is 'reconnect'
        # connect this consumer to another group
        # to be able to send messages.
        elif self.text_data_json["type"] == "reconnect":
            group_name = self.text_data_json["reconnect_to"]
            print("reconnecting to group", group_name)
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            self.room_group_name = group_name
            print("room", self.room_group_name)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        elif self.text_data_json["type"] == "create_chat":
            contact = await database_sync_to_async(get_user_by_phone)(
                self.text_data_json["chat_members_phones"][0]
            )
            await self.create_chat([self.user_instance, contact])

        elif self.text_data_json["type"] == "create_contact":
            await database_sync_to_async(create_contact)(
                self.text_data_json["contact_name"],
                self.text_data_json["chat_members_phones"][0],
                self.user_instance,
            )

        elif self.text_data_json["type"] == "message_deletion":
            await self.send_message_deletion(self.text_data_json)

        elif self.text_data_json["type"] == "message_edition":
            await self.send_message_edition(self.text_data_json)

    async def chat_message(self, event):
        await self.send(text_data=f"chat_message{event['text']}")

    async def chat_message_deletion(self, event):
        await self.send(
            text_data=f"message_deletion{event['sender_id'] + event['sender_contact_name'] + event['chat_id']}"
        )

    async def chat_message_edition(self, event):
        await self.send(
            text_data=f"message_edition{event['sender_id'] + event['sender_contact_name'] + event['chat_id']}"
        )

    async def chat_notification(self, event):
        await self.send(
            text_data=f"chat_notification{event['sender_id'] + event['text']  + event['sender_contact_name'] + event['chat_is_archived']}"
        )
    
    async def send_message_notifications(self, websocket_message_data:dict):
        for message_receiver_phone in websocket_message_data["chat_members_phones"].split(','):
            print(message_receiver_phone)
            print(f"user_group_{message_receiver_phone}")        
            receiver_instance = await database_sync_to_async(get_user_by_phone)(
                message_receiver_phone
            )
            sender_contact_instance = await database_sync_to_async(contact_from_user)(
                receiver_instance, self.user_instance.phone_number
            )
            chat_is_archived = await database_sync_to_async(self.chat_instance.archived_by_user)(
                receiver_instance
            )
            await self.channel_layer.group_send(
                f"user_group_{message_receiver_phone}",
                {
                    "type": "chat_notification",
                    "sender_id": f"{websocket_message_data['sender_user_id']}",
                    "text": f"-{websocket_message_data['message'] if len(websocket_message_data['message']) > 0 else 'Photo 📷'}",
                    "sender_contact_name": f"-{sender_contact_instance.name if sender_contact_instance else self.user_instance.phone_number}",
                    "chat_is_archived": f"-{chat_is_archived}",
                },
            )

    async def send_message_edition(self, websocket_message_data:dict):
        phones_in_chat = websocket_message_data["chat_members_phones"].split(',')
        if len(phones_in_chat) > 1:
            self.chat_instance = await database_sync_to_async(get_object_by_id)(
                Chat, self.text_data_json["chat_id"]
            )
            self.sender_contact_name = self.chat_instance.name
        else:
            receiver_instance = await database_sync_to_async(get_user_by_phone)(
                phones_in_chat[0]
            )
            sender_contact_instance = await database_sync_to_async(contact_from_user)(
                receiver_instance, self.user_instance.phone_number
            )

            self.sender_contact_name = sender_contact_instance.name
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message_edition",
                "sender_id": f"{websocket_message_data['sender_user_id']}",
                "sender_contact_name": f"-{self.sender_contact_name}",
                "chat_id": f"-{websocket_message_data['chat_id']}"
            },
        )

    async def send_message_deletion(self, websocket_message_data:dict):
        phones_in_chat = websocket_message_data["chat_members_phones"].split(',')
        if len(phones_in_chat) > 1:
            self.chat_instance = await database_sync_to_async(get_object_by_id)(
                Chat, self.text_data_json["chat_id"]
            )
            self.sender_contact_name = self.chat_instance.name
        else:
            receiver_instance = await database_sync_to_async(get_user_by_phone)(
                phones_in_chat[0]
            )
            sender_contact_instance = await database_sync_to_async(contact_from_user)(
                receiver_instance, self.user_instance.phone_number
            )

            self.sender_contact_name = sender_contact_instance.name
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message_edition",
                "sender_id": f"{websocket_message_data['sender_user_id']}",
                "sender_contact_name": f"-{self.sender_contact_name}",
                "chat_id": f"-{websocket_message_data['chat_id']}"
            },
        )

    @database_sync_to_async
    def create_message(
        self,
        sender_user_id: Union[str, int],
        chat_id: Union[str, int],
        text: Optional[str] = None,
        image: Optional[str] = None,
    ) -> None:
        """Creates and stores a new message object in the database.

        Args:
            sender_user_id (Union[str, int]): The id (numeric value) of the user that sent the message.
            chat_id (Union[str, int]): The id (numeric value) of the chat that the sender sent this message on.
            text (str): What the message says.
            image (str): The image encoded base64  image data.
        """
        sender_user_instance = User.objects.get(id=sender_user_id)
        chat_instance = Chat.objects.get(id=chat_id)
        new_message = Message.objects.create(
            sender_user=sender_user_instance,
            date=timezone.now(),
            chat=chat_instance,
        )
        if text:
            new_message.text = text
            new_message.save()

        if image:
            image_file = encoded_image_to_file(image, "user_message")
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

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


class StatusConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # user broadcast for statuses
        self.user_phone_number = self.scope["user"].phone_number.as_e164.replace(
            "+", ""
        )
        self.room_group_name = f"{self.user_phone_number}"
        user_contacts = await database_sync_to_async(get_user_contacts)(
            self.scope["user"].id, "phone_number"
        )

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        for contact_phone in user_contacts:
            await self.channel_layer.group_add(
                contact_phone.as_e164.replace("+", ""), self.channel_name
            )

        await self.accept()

    async def receive(self, text_data):
        # transform the text_data (status received [json])
        # to a python dictionary
        self.text_data_json = json.loads(text_data)
        print("STATUS DATA", self.text_data_json)

        if self.text_data_json["type"] == "CREATE":
            await self.create_status(self.text_data_json["text"], self.text_data_json["image"])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "status_notification",
                    "text": "-".join(
                        [value for value in self.text_data_json.values() if value != None]
                    ),
                },
            )

        elif self.text_data_json["type"] == "DELETE":
            await self.delete_status(self.text_data_json["status_id"])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "status_deletion",
                    "text": self.text_data_json["status_id"],
                },
            )

    async def status_deletion(self, event):
        await self.send(text_data=f"status_deletion-{event['text']}")

    async def status_notification(self, event):
        await self.send(text_data=f"status_notification-{event['text']}")

    @database_sync_to_async
    def create_status(
        self,
        text: Optional[str] = None,
        image: Optional[str] = None,
    ) -> None:
        status_creator = self.scope["user"]
        if text or image:
            new_status = Status.objects.create(
                uploaded_by=status_creator, upload_date=timezone.now()
            )

            if text:
                new_status.text = text
                new_status.save()

            if image:
                image_file = encoded_image_to_file(image, "user_status")
                new_status.image = image_file
                new_status.save()

    @database_sync_to_async
    def delete_status(self, status_id: Union[str, int]) -> None:
        """Deletes the status with the given id if exists,
        raise an error exception.

        Args:
            status_id (Union[str, int]): The id of the status to be deleted.
        """
        try:
            status = Status.objects.get(id=status_id)
            status.delete()
        except Status.DoesNotExist:
            raise ObjectDoesNotExist(f"NO STATUS FOUND WITH SUCH ID: {status_id}")

    async def disconnect(self, close_code):
        # Called when the socket closes
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import User, Chat, Message, Contact, Status
from .views import get_contact_in_chat
from .tools import *
from django.utils import timezone
from django.core.files.base import ContentFile
from phonenumber_field.phonenumber import PhoneNumber
from typing import Union, Optional
import json, base64


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # default group name
        self.room_group_name = "test"
        self.user_instance = await  database_sync_to_async(get_user_by_id)(self.scope["user"].id)
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
        text_data_json = json.loads(text_data)
        # handles the message as a 'request'
        # if the type of the 'request' is message, it means
        # a message needs to be created in the database with the dictionary data.
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
            contact_in_chat = await database_sync_to_async(get_contact_in_chat)(chat_data, self.user_instance)
            if contact_in_chat and contact_in_chat.archived == False:
                await self.channel_layer.group_send(
                    f"user_group_{self.receiver}",
                    {
                        "type": "chat_notification",
                        "text": f"{text_data_json['sender_user_id']}{text_data_json['message']}",
                    },
                )
        # if the type of the 'request' is 'reconnect'
        # connect this consumer to another group
        # to be able to send messages.
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
            contact = await database_sync_to_async(get_user_by_phone)(
                text_data_json["contact_phone_number"]
            )
            await self.create_chat([self.user_instance, contact])

        elif text_data_json["type"] == "create_contact":
            await database_sync_to_async(create_contact)(
                text_data_json["contact_name"], text_data_json["contact_phone_number"],
                self.scope['user'].id
            )

    async def chat_message(self, event):
        await self.send(text_data=f"chat_message{event['text']}")

    async def chat_notification(self, event):
        await self.send(text_data=f"chat_notification{event['text']}")


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
                raise ChatNotFoundException("NO CHAT FOUND WITH SUCH ID")
        else:
            chat = Chat.objects.get(id=chat_id)
            return chat.archived if field == "archived" else chat.users


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


class StatusConsumer(AsyncWebsocketConsumer):
    # groups = ["broadcast"]

    async def connect(self):
        # user broadcast for statuses
        self.user_phone_number = self.scope['user'].phone_number.as_e164.replace('+', '')
        self.room_group_name = f'{self.user_phone_number}'
        user_contacts = await database_sync_to_async(get_user_contacts)(self.scope['user'].id, 'phone_number')
        groups = [contact_phone.as_e164.replace('+', '') for contact_phone in user_contacts]
        print('GROUPS')
        print(groups)


        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def receive(self, text_data):
        # transform the text_data (status received [json])
        # to a python dictionary
        text_data_json = json.loads(text_data)
        print('STATUS DATA',text_data_json)

        if text_data_json['type'] == 'CREATE':
            await self.create_status()
        elif text_data_json['type'] == 'DELETE':
            await self.delete_status()
        
        await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "status",
                    "text": f"{[value for value in text_data_json.values()]}",
                },
            )


    async def status(self, event):
        await self.send(text_data=f"status{event['text']}")

    
    @database_sync_to_async
    def create_status(
        self,
        text: Optional[str] = None,
        image: Optional[str] = None,
    ) -> None:
        status_creator = User.objects.get(id=self.scope['user'].id)
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
    
    @database_sync_to_async
    def delete_status(self, status_id:Union[str, int]) -> None:
        """Deletes the status with the given id if exists,
        raise an error otherwise.

        Args:
            status_id (Union[str, int]): The id of the status to be deleted.
        """
        try:
            status = Status.objects.get(id=status_id)
            status.delete() 
        except Status.DoesNotExist:
            raise StatusNotFoundException()

    async def disconnect(self, close_code):
        # Called when the socket closes
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
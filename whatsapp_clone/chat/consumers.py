from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from .models import User, Chat, Message, Contact
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.base import ContentFile
from phonenumber_field.phonenumber import PhoneNumber
from typing import Union, Optional
from .exceptions import UserNotFoundException
import PIL
from io import BytesIO
import json, base64, imghdr


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
                    "text": f"{text_data_json['sender_user_id']},{text_data_json['message']},{text_data_json['image']}",
                },
            )
            self.receiver = text_data_json["contact_phone_number"].replace("+", "")
            print(f"user_group_{self.receiver}")

            await self.channel_layer.group_send(
                f"user_group_{self.receiver}",
                {
                    "type": "chat_notification",
                    "text": f"{text_data_json['sender_user_id']}{text_data_json['message']}",
                },
            )
            await self.create_message(
                text_data_json["sender_user_id"],
                text_data_json["message"],
                text_data_json["image"],
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
        self, sender_user_id: Union[str, int], text: str, image: Optional[str], chat_id: Union[str, int]
    ) -> None:
        """Creates and stores a new message object in the database.

        Args:
            sender_user_id (Union[str, int]): The id (numeric value) of the user that sent the message.
            text (str): What the message says.
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
        if image != '':
            image_binary_data = base64.b64decode(image)
            # removes the prefix data:image/jpeg;base64 from the decoded bytes
            image_prefix, image_bytes = image_binary_data.split(b',', 1)

            #print(image == base64.b64encode(image_binary_data)) prints False
            #print(image_binary_data == base64.b64decode(base64.b64encode(image_binary_data))) prints True

            # Check image type
            image_type = imghdr.what(BytesIO(image_bytes))

            if image_type not in ['jpeg', 'png', 'gif']:
                # Handle invalid image type
                print(f"Invalid image type: {image_type}")
            else:
                if image_type == 'jpeg':
                    image_type = 'jpg'
                    # Use Pillow to open the image from bytes
            try:
                with PIL.Image.open(BytesIO(image_bytes)) as img:
                    print(image_bytes)
                    #Save the image to a BytesIO object
                    output_buffer = BytesIO()
                    img.save(output_buffer, format="JPEG")
                    image_bytes = output_buffer.getvalue()
            except PIL.UnidentifiedImageError as e:
                print(f"Error identifying image: {e}")
            
            with open('encoded.txt', 'w') as file:
                file.write(image)
            
            with open('decoded.txt', 'wb') as file:
                file.write(str(image_binary_data))

            with open('decoded_split.txt', 'wb') as file:
                file.write(image_bytes)
            
            with open('decoded_split_image.jpg', 'wb') as file:
                file.write(image_bytes)
            
            with open('decoded_image.jpg', 'wb') as file:
                file.write(image_binary_data)

            image_file = ContentFile(image_bytes, f'user_message.{image_type}' if image_type else 'user_message.jpg')

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

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

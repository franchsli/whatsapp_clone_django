from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import User, Chat, Message, Status
from .tools import (
    get_object_by_id,
    get_user_by_phone,
    create_contact,
    contact_from_user,
    encoded_image_to_file,
    get_user_contacts,
)
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class ChatConsumer(AsyncJsonWebsocketConsumer):
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

    async def receive_json(self, content):
        content_type = content["type"]
        # handles the message as a 'request'
        # if the type of the 'request' is message, it means
        # a message needs to be created in the database with the dictionary data.
        if content_type == "message":
            logger.debug(self.user_instance.username)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "sender_id": content["sender_id"],
                    "message": content["message"],
                    "image": content["image"],
                },
            )
            self.chat_instance = await database_sync_to_async(get_object_by_id)(
                Chat, content["chat_id"]
            )
            logger.debug(content["chat_members_phones"])
            logger.debug(type(content["chat_members_phones"]))
            await self.send_message_notifications(content)
            await self.create_message(
                content["sender_id"],
                content["chat_id"],
                content["message"],
                content["image"],
                content["reply_to"],
            )

        # if the type of the 'request' is 'reconnect'
        # connect this consumer to another group
        # to be able to send messages.
        elif content_type == "reconnect":
            group_name = content["reconnect_to"]
            logger.debug("reconnecting to group", group_name)
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            self.room_group_name = group_name
            logger.debug("room", self.room_group_name)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        elif content_type == "create_chat":
            contact = await database_sync_to_async(get_user_by_phone)(
                content["contact_phone_number"]
            )
            await self.create_chat([self.user_instance, contact])
            await self.send_chat_creation(content["contact_name"])

        elif content_type == "create_group":
            await self.create_group(
                self.user_instance,
                content["contacts_phone_numbers"],
                content["group_name"],
            )
            await self.send_group_creation(content["group_name"])

        elif content_type == "create_contact":
            await database_sync_to_async(create_contact)(
                content["contact_name"],
                content["contact_phone_number"],
                self.user_instance,
            )
            await self.send_contact_creation(content["contact_name"])

        elif content_type == "message_deletion":
            await self.send_message_deletion(content)

        elif content_type == "message_edition":
            await self.send_message_edition(content)

        elif content_type == "chat_opening":
            await self.send_chat_opening(content)

    async def chat_message(self, event):
        await self.send_json(
            content={
                "type": "chat_message",
                "sender_id": event["sender_id"],
                "message": event["message"],
                "image": event["image"],
            }
        )

    async def chat_message_deletion(self, event):
        await self.send_json(
            content={
                "type": "chat_message_deletion",
                "sender_id": event["sender_id"],
                "sender_contact_name": self.sender_contact_name,
                "chat_id": event["chat_id"],
            },
        )

    async def chat_message_edition(self, event):
        await self.send_json(
            content={
                "type": "chat_message_edition",
                "sender_id": event["sender_id"],
                "sender_contact_name": self.sender_contact_name,
                "chat_id": event["chat_id"],
            },
        )

    async def chat_notification(self, event):
        await self.send_json(
            content={
                "type": "chat_notification",
                "sender_id": event["sender_id"],
                "message": event["message"],
                "sender_contact_name": event["sender_contact_name"],
                "chat_is_archived": event["chat_is_archived"],
            }
        )

    async def send_message_notifications(self, websocket_message_data: dict):
        for message_receiver_phone in websocket_message_data[
            "chat_members_phones"
        ].split(","):
            logger.debug(message_receiver_phone)
            logger.debug(f"user_group_{message_receiver_phone}")
            receiver_instance = await database_sync_to_async(get_user_by_phone)(
                message_receiver_phone
            )
            sender_contact_instance = await database_sync_to_async(contact_from_user)(
                receiver_instance, self.user_instance.phone_number
            )
            chat_is_archived = await database_sync_to_async(
                self.chat_instance.archived_by_user
            )(receiver_instance)
            await self.channel_layer.group_send(
                f"user_group_{message_receiver_phone}",
                {
                    "type": "chat_notification",
                    "sender_id": websocket_message_data["sender_id"],
                    "message": f"{websocket_message_data['message'] if len(websocket_message_data['message']) > 0 else 'Photo 📷'}",
                    "sender_contact_name": f"{sender_contact_instance.name if sender_contact_instance else self.user_instance.phone_number}",
                    "chat_is_archived": chat_is_archived,
                },
            )

    async def send_message_edition(self, websocket_message_data: dict):
        phones_in_chat = websocket_message_data["chat_members_phones"].split(",")
        if len(phones_in_chat) > 1:
            self.chat_instance = await database_sync_to_async(get_object_by_id)(
                Chat, websocket_message_data["chat_id"]
            )
            self.sender_contact_name = self.chat_instance.name
        else:
            receiver_instance = await database_sync_to_async(get_user_by_phone)(
                f"user_group_{phones_in_chat[0]}"
            )
            sender_contact_instance = await database_sync_to_async(contact_from_user)(
                receiver_instance, self.user_instance.phone_number
            )

            self.sender_contact_name = sender_contact_instance.name
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message_edition",
                "sender_id": websocket_message_data["sender_id"],
                "sender_contact_name": self.sender_contact_name,
                "chat_id": websocket_message_data["chat_id"],
            },
        )

    async def send_message_deletion(self, websocket_message_data: dict):
        phones_in_chat = websocket_message_data["chat_members_phones"].split(",")
        if len(phones_in_chat) > 1:
            self.chat_instance = await database_sync_to_async(get_object_by_id)(
                Chat, websocket_message_data["chat_id"]
            )
            self.sender_contact_name = self.chat_instance.name
        else:
            receiver_instance = await database_sync_to_async(get_user_by_phone)(
                f"user_group_{phones_in_chat[0]}"
            )
            sender_contact_instance = await database_sync_to_async(contact_from_user)(
                receiver_instance, self.user_instance.phone_number
            )

            self.sender_contact_name = sender_contact_instance.name
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message_deletion",
                "sender_id": websocket_message_data["sender_id"],
                "sender_contact_name": self.sender_contact_name,
                "chat_id": websocket_message_data["chat_id"],
            },
        )

    async def send_chat_creation(self, contact_name: str):
        await self.send_json(
            content={
                "type": "chat_creation",
                "contact_name": contact_name,
            }
        )

    async def send_contact_creation(self, contact_name: str):
        await self.send_json(
            content={
                "type": "contact_creation",
                "contact_name": contact_name,
            }
        )

    async def send_group_creation(self, group_name: str):
        await self.send_json(
            content={
                "type": "group_creation",
                "group_name": group_name,
            }
        )

    async def send_chat_opening(self, content: dict):
        await self.send_json(
            content={
                "type": "chat_opening",
                "chat_opener_id": content["chat_opener_id"],
                "chat_id": content["chat_id"],
            }
        )

    @database_sync_to_async
    def create_message(
        self,
        sender_id: str | int,
        chat_id: str | int,
        text: str | None = None,
        image: str | None = None,
        replies_to: str | None = None,
    ) -> None:
        """Creates and stores a new message object in the database.

        Args:
            sender_id (str | int): The id (numeric value) of the user that sent the message.
            chat_id (str | int): The id (numeric value) of the chat that the sender sent this message on.
            text (str | None): What the message says.
            image (str | None): The image encoded base64  image data.
            replies_to (str | None): The id of the message that is being replied.
        """
        sender_user_instance = User.objects.get(id=sender_id)
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

        if replies_to:
            try:
                reply_instance = Message.objects.get(id=replies_to)
                new_message.reply_to = reply_instance
                new_message.save()
            except Message.DoesNotExist:
                logger.debug("NO MESSAGE WITH SUCH ID")

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
    def create_group(
        self, creator: User, contacts_phones: list[str], name: str
    ) -> None:
        """Creates a group (Chat)

        Args:
            creator (User): The User who created the group.
            contacts_phones (list[str]): The phones of the Users that will be added to the group.
            name (str): Name of the group.
        """
        new_group = Chat.objects.create(name=name)
        new_group.admins.add(creator)
        contacts_phones.append(creator.phone_number)
        users = User.objects.filter(phone_number__in=contacts_phones)
        new_group.users.set(users)
        new_group.save()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


class StatusConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # user broadcast for statuses
        self.user_phone_number = self.scope["user"].phone_number.as_e164.replace(
            "+", ""
        )
        self.room_group_name = self.user_phone_number
        user_contacts = await database_sync_to_async(get_user_contacts)(
            self.scope["user"].id, "phone_number"
        )

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        for contact_phone in user_contacts:
            await self.channel_layer.group_add(
                contact_phone.as_e164.replace("+", ""), self.channel_name
            )

        await self.accept()

    async def receive_json(self, content):
        logger.debug("STATUS DATA", content)
        content_type = content["type"]

        if content_type == "CREATE":
            await self.create_status(
                content["text"],
                content["image"],
                content["color"],
            )
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "status_notification",
                    "user_id": content["user_id"],
                    "sender_phone_number": content["sender_phone_number"],
                    "text": content["text"],
                    "image": content["image"],
                    "color": content["color"],
                },
            )

        elif content_type == "DELETE":
            await self.delete_status(content["status_id"])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "status_deletion",
                    "user_id": content["user_id"],
                    "status_id": content["status_id"],
                },
            )

    async def status_deletion(self, event):
        await self.send_json(
            content={
                "type": "status_deletion",
                "user_id": event["user_id"],
                "status_id": event["status_id"],
            }
        )

    async def status_notification(self, event):
        await self.send_json(
            content={
                "type": "status_notification",
                "user_id": event["user_id"],
                "sender_phone_number": event["sender_phone_number"],
                "text": event["text"],
                "image": event["image"],
                "color": event["color"],
            }
        )

    @database_sync_to_async
    def create_status(
        self,
        text: str | None = None,
        image: str | None = None,
        color: str | None = None,
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

            if color:
                new_status.color = color
                new_status.save()

    @database_sync_to_async
    def delete_status(self, status_id: str | int) -> None:
        """Deletes the status with the given id if exists,
        raise an error exception.

        Args:
            status_id (str | int): The id of the status to be deleted.
        """
        try:
            status = Status.objects.get(id=status_id)
            status.delete()
        except Status.DoesNotExist:
            raise ObjectDoesNotExist(f"NO STATUS FOUND WITH SUCH ID: {status_id}")

    async def disconnect(self, close_code):
        # Called when the socket closes
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

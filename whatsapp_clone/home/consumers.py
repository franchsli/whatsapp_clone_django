from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Called on connection.
        # To accept the connection call:
        self.room_group_name = 'test'
        self.user_specific_group_name = f"user_group_{self.scope['user'].id}"
        print(self.user_specific_group_name)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if 'message' in text_data_json['type']:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "text": f"{text_data_json['sender_user_id']}{text_data_json['message']}",
                },
            )
            #self.receiver_id = await  database_sync_to_async(self.get_user_id(text_data[0]))()

        elif 'reconnect' in text_data_json['type']:
            group_name = text_data_json['reconnect_to']
            print('reconnecting to group', group_name)
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            self.room_group_name = group_name
            print('room', self.room_group_name)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)


    async def chat_message(self, event):
        await self.send(text_data=f"chat_message{event['text']}")
    
    def get_user_id(self, username):
        pass        

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

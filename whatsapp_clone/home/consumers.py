from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Called on connection.
        # To accept the connection call:
        self.room_group_name = 'test'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()


    async def receive(self, text_data):
        if 'message' in text_data:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "text": text_data,
                },
            )
        elif 'reconnect' in text_data:
            text_data = text_data.replace('reconnect', '')
            print('reconnecting to group', text_data)
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            self.room_group_name = text_data
            print('room', self.room_group_name)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)


    async def chat_message(self, event):
        await self.send(text_data=event["text"])
    
        

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

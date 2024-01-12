from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync


class ChatConsumer(WebsocketConsumer):
    def connect(self, room_group_name='test'):
        # Called on connection.
        # To accept the connection call:
        self.room_group_name = room_group_name

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()


    def receive(self, text_data):
        if 'chat_message' in text_data:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "text": text_data,
                },
            )
        elif 'reconnect' in text_data:
            text_data = text_data.replace('reconnect', '')
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat_connect",
                    "text": text_data,
                },
            )


    def chat_message(self, event):
        self.send(text_data=event["text"])
    
    def chat_connect(self, event):
        self.close()
        async_to_sync(self.channel_layer.group_add)(
                event['text'],
                self.channel_name
            )
        self.send(text_data=event['text'])
    

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

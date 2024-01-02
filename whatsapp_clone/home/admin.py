from django.contrib import admin
from .models import Profile, Chat, Message
# Register your models here.
class ProfileAdmin(admin.ModelAdmin):
    search_fields = ('user', 'phone_number')
    list_display = ('user', 'phone_number')
    list_filter = ('user',)


class ChatAdmin(admin.ModelAdmin):
    search_fields = ('users',)

class MessageAdmin(admin.ModelAdmin):
    search_fields = ('sender_user', 'text')
    list_display = ('sender_user', 'text')
    list_filter = ('sender_user', 'date')

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Chat, ChatAdmin)
admin.site.register(Message, MessageAdmin)
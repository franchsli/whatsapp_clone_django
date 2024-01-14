from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Chat, Message
# Register your models here.
class ChatAdmin(admin.ModelAdmin):
    search_fields = ('users',)

class MessageAdmin(admin.ModelAdmin):
    search_fields = ('sender_user', 'text')
    list_display = ('sender_user', 'text')
    list_filter = ('sender_user', 'date')

admin.site.register(User, UserAdmin)
admin.site.register(Chat, ChatAdmin)
admin.site.register(Message, MessageAdmin)
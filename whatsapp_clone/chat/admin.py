from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm
from .models import User, Chat, Message
# Register your models here.

#custom models for displaying custom user fields in admin
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = '__all__'

class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm

    fieldsets = UserAdmin.fieldsets + (
            (None, {'fields': ('phone_number',)}),
    )


class ChatAdmin(admin.ModelAdmin):
    search_fields = ('users',)

class MessageAdmin(admin.ModelAdmin):
    search_fields = ('sender_user', 'text')
    list_display = ('sender_user', 'text')
    list_filter = ('sender_user', 'date')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Chat, ChatAdmin)
admin.site.register(Message, MessageAdmin)
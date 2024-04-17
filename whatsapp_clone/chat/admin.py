from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm
from .models import User, Chat, Message, Contact, Status

# Register your models here.


# custom models for displaying custom user fields in admin
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = "__all__"


class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm

    fieldsets = UserAdmin.fieldsets + ((None, {"fields": ("phone_number", "photo")}),)


class ChatAdmin(admin.ModelAdmin):
    pass


class MessageAdmin(admin.ModelAdmin):
    search_fields = ("sender_user", "text")
    list_display = ("sender_user", "text")
    list_filter = ("sender_user", "date")


class ContactAdmin(admin.ModelAdmin):
    search_fields = ("name", "phone_number")
    list_display = ("name", "phone_number")


class StatusAdmin(admin.ModelAdmin):
    search_fields = ("uploaded_by", "text")
    list_display = ("uploaded_by", "text", "upload_date")
    list_filter = ("uploaded_by", "upload_date")


admin.site.register(User, CustomUserAdmin)
admin.site.register(Chat, ChatAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Contact, ContactAdmin)
admin.site.register(Status, StatusAdmin)

from django import template
from django.db.models import QuerySet
from chat.models import Contact, User, Chat
from chat.tools import DEFAULT_USER_PHOTO_URL, get_contact_in_chat
from typing import Union
import re

register = template.Library()


@register.filter
def exclude_user(value, user):
    user_list = list(value.values_list("username", flat=True))
    return user_list[1] if user_list[1] != user.username else user_list[0]


@register.filter
def to_list(value):
    """Converts the provided Queryset into a list.

    Args:
        value (Queryset): The Queryset.

    Returns:
        _list_: A list made from the queryset data.
    """
    # you CAN ALSO use list comprehension (super effective)
    # print(value.values_list('sender_user', 'text').order_by('-date'))
    # list(value.values_list('sender_user', 'text').order_by('-date'))
    return list(value.values_list("id", flat=True).order_by("date"))


@register.filter
def last_message(value: QuerySet, data: str) -> str:
    """Returns the latest message desired data in the provided value (messages Queryset).

    Args:
        value (Queryset): A queryset containing messages objects.
        data (str): The desired data of the latest message object.

    Returns:
        str: The last message in the messages queryset if not empty, returns an empty string otherwise.
    """
    messages_data = list(value.values_list(data, flat=True).order_by("date"))

    if data == "text":
        if len(messages_data) > 0 and len(messages_data[-1]) > 0:
            return messages_data[-1]
        # if the last message text is an empty string,
        # it means the last message is a Photo.
        elif len(messages_data) > 0 and len(messages_data[-1]) == 0:
            return "Photo 📷"

        else:
            return ""
    else:
        return messages_data[-1] if len(messages_data) > 0 else ""


@register.simple_tag
def exclude_user_tag(user_set: QuerySet, user: User, value: str) -> str:
    """Removes the given user object from the provided user_set.

    Args:
        user_set (Queryset): An user object queryset.
        user (User): The user that will be removed.
        value (str): The desired field of the user object.

    Returns:
        str: The user left after excluding the given user.
    """
    user_list = user_set.exclude(id=user.id)
    users_values  = list(user_list.values_list(value, flat=True))
    
    if len(users_values) < 2:
        return users_values[0] if value != 'phone_number' else users_values[0].national_number
    else:
        return users_values


@register.simple_tag
def get_contact_in_chat_tag(chat: Chat, auth_user: User, desired_value: str) -> Union[str, bool, int]:
    """Returns the contact in the chat desired data.

    Args:
        chat (QuerySet): The queryset where the contact is.
        auth_user (User): The authenticated user.
        desired_value (str): The desired field of the Contact model.

    Returns:
        Union[str, bool, int]: Either a string (name or phone number), or a bool (archived) or a int (id).
    """
    contact = get_contact_in_chat(chat, auth_user)

    if contact:
        if desired_value == "name":
            return contact.name
        elif desired_value == "archived":
            return contact.archived
        elif desired_value == "id":
            return contact.pk
        elif desired_value == "photo":
            contact = User.objects.get(phone_number=contact.phone_number)
            if contact.has_photo:
                return contact.photo.url
            else:
                return DEFAULT_USER_PHOTO_URL
    else:
        users_model_phone = list(chat.users.values_list("phone_number", flat=True))
        contact_user_model_phone = users_model_phone[0] if users_model_phone[0] != auth_user.phone_number else users_model_phone[1]
        user = User.objects.get(phone_number=contact_user_model_phone)
        if desired_value != "photo":
            return user.phone_number
        else:
            return user.photo.url if user.has_photo else DEFAULT_USER_PHOTO_URL




@register.simple_tag
def get_contact_photo(phone: str) -> str:
    """Returns the User photo with the given phone.

    Args:
        phone (str): The phonenumber of the 'contact'.

    Returns:
        str: The url of the user photo, or a default url if the user has no photo.
    """
    user = User.objects.get(phone_number=phone)
    if user.has_photo:
        return user.photo.url
    else:
        return DEFAULT_USER_PHOTO_URL

@register.simple_tag
def only_emoji(text: str) -> bool:
    """Returns if a text is only a emoji.

    Args:
        text (str): The text to be analized.

    Returns:
        bool: True if it's only a emoji, False otherwise.
    """ 
    return bool(re.match(r'\W+', text))
    
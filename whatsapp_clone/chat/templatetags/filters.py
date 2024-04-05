from django import template
from django.db.models import QuerySet
from chat.models import Contact, User
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
    """Returns the latest message desired data in the provided value.

    Args:
        value (Queryset): A queryset containing messages objects.
        data (str): The desired data of the latest message object.

    Returns:
        str: The last message in the messages queryset if not empty, returns an empty string otherwise.
    """
    messages_data = list(value.values_list(data, flat=True).order_by("date"))

    if data == "text":
        # if the last message text is an empty string, return 'image'
        if len(messages_data) > 0 and len(messages_data[-1]) > 0:
            return messages_data[-1]

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
    user_list = list(user_set.values_list(value, flat=True))
    comparison = user.username if value == "username" else user.phone_number
    return user_list[1] if user_list[1] != comparison else user_list[0]


@register.simple_tag
def get_contact_in_chat(user_set: QuerySet, auth_user: User, desired_value: str) -> Union[str, bool, int]:
    """Gets the contact in the chat desired data by excluding the auth user and using the left user
    data to obtain the appropiate Contact model object desired value.

    Args:
        user_set (QuerySet): The queryset where the contact is.
        auth_user (User): The authenticated user.
        desired_value (str): The desired field of the Contact model.

    Returns:
        Union[str, bool, int]: Either a string (name or phone number), or a bool (archived) or a int (id).
    """
    phones_list = list(user_set.values_list("phone_number", flat=True))
    result = (
        phones_list[0] if auth_user.phone_number != phones_list[0] else phones_list[1]
    )
    contact_created_by_user = Contact.objects.filter(
        created_by=auth_user, phone_number=result
    ).exists()
    if desired_value == "name" and contact_created_by_user:
        contact = Contact.objects.get(created_by=auth_user, phone_number=result)
        return contact.name

    elif desired_value == "name" and contact_created_by_user == False:
        return result

    elif desired_value == "archived" and contact_created_by_user:
        contact = Contact.objects.get(created_by=auth_user, phone_number=result)
        return contact.archived

    elif desired_value == "id" and contact_created_by_user:
        contact = Contact.objects.get(created_by=auth_user, phone_number=result)
        return contact.pk

    elif desired_value == "photo":
        contact = User.objects.get(phone_number=result)
        if contact.has_photo:
            return contact.photo.url
        else:
            return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNBNdcMDNS2r9df1IWFVc8AY0QNtfNhEJv7fGS5TdhUWrlBqfGu1PCCn9lKpL-FqF9dWc&usqp=CAU"


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
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNBNdcMDNS2r9df1IWFVc8AY0QNtfNhEJv7fGS5TdhUWrlBqfGu1PCCn9lKpL-FqF9dWc&usqp=CAU"

@register.simple_tag
def only_emoji(text: str) -> bool:
    """Returns if a text is only a emoji.

    Args:
        text (str): The text to be analized.

    Returns:
        bool: True if it's only a emoji, False otherwise.
    """ 
    return bool(re.match(r'\W+', text))
    
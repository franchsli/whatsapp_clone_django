from django import template
from django.db.models import QuerySet
from chat.models import User, Chat
from chat.tools import DEFAULT_USER_PHOTO_URL, messages_dates, get_contact_in_chat
from typing import Union
import re

register = template.Library()


@register.filter
def exclude_user(value, user):
    user_list = list(value.values_list("username", flat=True))
    return user_list[1] if user_list[1] != user.username else user_list[0]


@register.filter
def to_list(value) -> list:
    """Converts the provided Queryset into a list.

    Args:
        value (Queryset): The Queryset.

    Returns:
        _list_: A list made from the queryset data.
    """
    # you CAN ALSO use list comprehension (super effective)
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


@register.filter
def unread_messages_counter(messages_queryset: QuerySet, user_id: int) -> int:
    """Returns the number of unread messages in the
    queryset by the User with the given id

    Args:
        messages_queryset (QuerySet): Where are the messages at.
        user_id (int): The id of the user that may or may not
        read the messages.
    Returns:
        int: The number of unread messages.
    """
    unread_counter = 0
    for message in messages_queryset.iterator():
        if not message.read and message.sender_user.id != user_id:
            unread_counter += 1

    return unread_counter


@register.filter
def latest_data(queryset: QuerySet, desired_field_name: str):
    """Returns the latest deisired field value from
    the given queryset.

    Args:
        queryset (QuerySet): The queryset where are all the objects at.
        desired_field_name (str): The name of the field to be returned,
        usually a date.

    Returns:
        _type_: The field value.
    """
    latest_object = queryset.latest(desired_field_name)
    return getattr(latest_object, desired_field_name)

@register.filter
def simplified_time_difference(time_difference: str) -> str:
    """Returns a summary of the provided time difference.

    Args:
        time_difference (str): A sentence verbally saying
        how much the difference is e.g. 1 hour, 5 minutes.

    Returns:
        str: A summarized version of the time difference, 
        from 'Less than a day ago.' to 'More than a week ago.'.
    """
    if 'day' not in time_difference:
        if 'week' in time_difference:
            return 'More than a week ago.'
        elif 'hour' in time_difference or 'minute' in time_difference:
            return 'Less than a day ago.'
    else:
        if 'day' in time_difference and 'days' not in time_difference:
            return 'Just yesterday.'
        else:
            return 'Less than a week ago.'

@register.simple_tag
def update_messages_dates(date: str):
    global messages_dates
    if date not in messages_dates:
        messages_dates.append(date)


@register.simple_tag
def date_already_displayed(date: str) -> bool:
    global messages_dates
    return date in messages_dates


@register.simple_tag
def clear_messages_dates():
    global messages_dates
    messages_dates = []


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
    users_values = list(user_list.values_list(value, flat=True))

    if len(users_values) < 2:
        return (
            users_values[0]
            if value != "phone_number"
            else f"{users_values[0].country_code}{users_values[0].national_number}"
        )
    else:
        return users_values


@register.simple_tag
def chat_desired_data(
    chat: Chat, auth_user: User, desired_value: str
) -> Union[str, bool, int]:
    """Returns the chat desired data if exists,
    returns the contact in the chat desired data otherwise.

    Args:
        chat (QuerySet): The Chat model where the Contact is.
        auth_user (User): The authenticated user.
        desired_value (str): The desired field of the Chat model or the Contact model.

    Returns:
        Union[str, bool, int]: Either a value from Chat model field or Contact model field.
    """
    # check if it's a group-like chat or not
    if chat.admins.count() > 0:
        if desired_value == "photo":
            if chat.has_photo:
                return chat.photo.url
            else:
                return DEFAULT_USER_PHOTO_URL
        else:
            # if the desired value if one of the fields
            # try to return it
            try:
                return getattr(chat, desired_value)
            except AttributeError:
                return False

    else:
        contact = get_contact_in_chat(chat, auth_user)

        if contact:
            if desired_value == "id":
                return contact.pk
            elif desired_value == "photo":
                contact = User.objects.get(phone_number=contact.phone_number)
                if contact.has_photo:
                    return contact.photo.url
                else:
                    return DEFAULT_USER_PHOTO_URL
            elif desired_value == "user-id":
                contact_user_object = User.objects.get(
                    phone_number=contact.phone_number
                )
                return contact_user_object.pk
            else:
                return getattr(contact, desired_value)
        # in case no contact is found,
        # it means the user is not in the contact list
        else:
            user = chat.users.exclude(id=auth_user.pk)
            if desired_value == "photo":
                return user.photo.url if user.has_photo else DEFAULT_USER_PHOTO_URL
            else:

                return user.phone_number


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
    return bool(re.match(r"\W+", text))

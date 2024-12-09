from django import template
from django.db.models import QuerySet
from chat.models import User, Chat, Message, Contact
from chat.tools import DEFAULT_USER_PHOTO_URL, get_contact_in_chat, object_photo
from typing import Union, List
import re, logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
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
def last_message(messages: QuerySet) -> Message:
    """Returns the latest Message object in a Queryset.

    Args:
        messages (QuerySet)

    Returns:
        Message
    """
    try:
        return messages.latest("date")
    except Message.DoesNotExist:
        return ""
    
@register.filter
def message_text(message: Message) -> Message:
    """Returns the latest's Message text.
    """
    return 'Photo 📷' if message.has_image else message.text

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
    """Returns the latest desired field value from
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
    if "day" not in time_difference[2:5]:
        if "week" in time_difference:
            return "More than a week ago."
        elif "hour" in time_difference or "minute" in time_difference:
            return "Less than a day ago."
    else:
        if "day" in time_difference and "days" not in time_difference:
            return "Just yesterday."
        else:
            return "Less than a week ago."


@register.filter
def starred_by_user_filter(message: Message, user: User) -> bool:
    return message.starred_by_user(user)


@register.filter
def archived_by_user_filter(chat: Chat, user: User) -> bool:
    return chat.archived_by_user(user)


@register.simple_tag
def exclude_user_tag(
    user_set: QuerySet, user: User, desired_field: str
) -> Union[str, List[str]]:
    """Removes the given user object from the provided user_set.

    Args:
        user_set (Queryset): An user object queryset.
        user (User): The user that will be removed.
        desired_field (str): The desired field of the user object.

    Returns:
        str: The user left after excluding the given user.
    """
    user_list = user_set.exclude(id=user.id)
    users_values = list(user_list.values_list(desired_field, flat=True))

    if len(users_values) < 2 and desired_field != "phone_number":
        return users_values[0]

    else:
        return list(
            map(
                lambda user_phone: (
                    f"{user_phone.country_code}{user_phone.national_number}"
                    if type(user_phone) != str
                    else None
                ),
                users_values,
            )
        )


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
            return object_photo(chat)
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
            if desired_value == "photo":
                contact = User.objects.get(phone_number=contact.phone_number)
                return object_photo(contact)
            elif desired_value == "user-id":
                contact_user_object = User.objects.get(
                    phone_number=contact.phone_number
                )
                return contact_user_object.pk
            else:
                # if the desired value if one of the fields
                # try to return it
                try:
                    return getattr(contact, desired_value)
                except AttributeError:
                    return False
        # in case no contact is found,
        # it means the user is not in the contact list
        else:
            user = chat.users.exclude(id=auth_user.pk)
            if desired_value == "photo":
                return object_photo(user)
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
    try:
        user = User.objects.get(phone_number=phone)
        return object_photo(user)
    except User.DoesNotExist:
        logger.debug(f'No User found with the following phone_number:\n{phone}')


@register.simple_tag
def only_emoji(text: str) -> bool:
    """Returns if a text is only a emoji.

    Args:
        text (str): The text to be analized.

    Returns:
        bool: True if it's only a emoji, False otherwise.
    """
    return bool(re.match(r"\W+", text))

@register.simple_tag
def replies_to(message:Message, auth_user:User) -> str:
    """Returns the name of the User
    (contact instance) who sent the Message
    that is being replied.

    Args:
        message (Message): The reply.
        auth_user (User): The auth User in session.

    Returns:
        str: The name of the User
    (contact instance) who sent the Message
    that is being replied.
    If no contact is found, return User instance username
    """
    try:
        return Contact.objects.get(phone_number=message.sender_user.phone_number,
                                   created_by=auth_user).name
    except Contact.DoesNotExist:
        username = User.objects.get(phone_number=message.sender_user.phone_number).username
        return f'{username} (You)' if username == auth_user.username else username


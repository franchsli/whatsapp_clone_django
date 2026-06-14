"""Functions and variables for global use."""

from django.core.files.base import ContentFile
from .models import User, Chat, Contact, Status, Message
from phonenumber_field.phonenumber import PhoneNumber
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Model
from base64 import b64decode
from django.http import QueryDict
from django.http.multipartparser import MultiPartParser
from django.utils.datastructures import MultiValueDict
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# CONSTANT VARIABLES
DEFAULT_USER_PHOTO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNBNdcMDNS2r9df1IWFVc8AY0QNtfNhEJv7fGS5TdhUWrlBqfGu1PCCn9lKpL-FqF9dWc&usqp=CAU"

ENCODED_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"


def get_user_by_id(user_id: str | int) -> User:
    """Returns the user in the database found with the given id,
    raises an exception if not found
    Args:
        user_id (str | int): A numeric (integer) value that identify the user.
    Raises:
        ObjectDoesNotExist: Raised when there's no user with the given id.
    Returns:
        User: The user object in the database if found.
    """
    return get_object_by_id(User, user_id)


def get_user_by_phone(phone_number: str) -> User:
    """Returns the user in the database found with the given phone_number,
    raises an exception if not found
    Args:
        phone_number (str): The phone number of the wanted user.
    Raises:
        ObjectDoesNotExist: Raised when there's no user with such phone
    Returns:
        User: The user object in the database if found.
    """
    try:
        return User.objects.get(phone_number=phone_number)
    except User.DoesNotExist:
        raise ObjectDoesNotExist(f"NO USER FOUND WITH SUCH PHONE: {phone_number}")


def create_contact(contact_name: str, contact_phone_number: str, creator: User) -> None:
    """Creates and stores a new contact object in the database.
    Args:
        contact_name (str): The name that the user thought for the contact.
        contact_phone_number (str): The phone number of the contact.
        user_id Union[str, int]: The id of the user who is creating the contact.
    """
    phone = PhoneNumber.from_string(contact_phone_number)
    Contact.objects.create(
        name=contact_name, phone_number=phone.as_e164, created_by=creator
    )


def get_user_contacts(user_id: str | int, desired_value: str) -> list[Contact]:
    """Returns all the contacts desired values (fields) of the User with the given id.

    Args:
        user_id (str | int): The id of the User.
        desired_value (str): The desired field of the contacts objects.

    Returns:
        list[Contact]: The list of the contacts values.
    """
    user_instance = User.objects.get(id=user_id)
    return list(user_instance.contacts.values_list(desired_value, flat=True))


def contact_from_user(user: User, contact_phone_number: str) -> Contact:
    """Returns the contact with the provided phone number from the given User.

    Args:
        user (User): The User that created the contact.
        contact_phone_number (str): The phone-number of the contact that we're looking for.

    Returns:
        Contact: The found Contact or None if no Contact is found.
    """
    return user.contacts.filter(phone_number=contact_phone_number).first()


def get_contact_in_chat(chat: Chat, logged_user: User) -> Contact:
    """Returns the contact object in the chat among all the users.

    Args:
        chat (Chat): The chat object
        logged_user (User): The currentlly logged user.

    Returns:
        Contact: The contact object in the Chat (if found).
        None: If the contact isn't found
    """
    # gets the user who is not the logged user in the chat
    other_user: User = chat.users.exclude(id=logged_user.pk).first()

    try:
        contact = Contact.objects.get(
            created_by=logged_user, phone_number=other_user.phone_number
        )
        return contact
    except Contact.DoesNotExist:
        logger.debug(
            f"NO CONTACT FOUND WITH SUCH ARGUMENTS:\ncreated_by={logged_user}\nphone_number={other_user.phone_number}"
        )


def chat_is_unread_by_user(chat: Chat, user: User) -> bool:
    """Returns if the given user has read
    the provided chat or not

    Args:
        chat (Chat): The Chat model object.
        user (User): The User that maybe read the chat.

    Returns:
        bool: True if the chat's latest message
        isn't read and it wasn't sent by the user,
        False otherwise.
    """
    latest_message: Message = chat.last_message
    if latest_message:
        if latest_message.sender_user != user and not latest_message.read_by.contains(
            user
        ):
            return True
        else:
            return False
    else:
        return False


def get_contacts_statuses(user: User, muted: bool) -> dict:
    """Returns a dict containing the statuses from the user contacts.

    Args:
        user (User): The logged user instance.
        muted (bool): Whether if the contact are status-muted or no.

    Returns:
        dict: A dict containing contacts (keys) and their statuses (values).
    """
    contacts_with_statuses = {}
    contacts = user.contacts.filter(statuses_muted=muted)

    for contact in contacts:
        contact_statuses = Status.objects.filter(
            uploaded_by__phone_number=contact.phone_number
        ).order_by("upload_date")
        contacts_with_statuses[contact] = contact_statuses

    return contacts_with_statuses



def object_photo(object: User | Chat) -> str:
    """Returns the object photo field url if exists,
    returns a default photo url otherwise.

    Args:
        object (User | Chat): Either a User or a Chat.

    Returns:
        str: The url of the photo in the object (if found) or
        the default photo url.
    """
    return object.photo.url if object.has_photo else DEFAULT_USER_PHOTO_URL


def get_object_by_id(object_class: Model, id: str | int) -> Model:
    try:
        return object_class.objects.get(id=id)
    except object_class.DoesNotExist:
        raise ObjectDoesNotExist(f"NO {type(object_class).__name__} WITH SUCH ID")


def encoded_image_to_file(
    image_encoded_data: bytes | str, file_name: str
) -> ContentFile:
    """Converts a encoded image data to a ContentFile object.

    Args:
        image_encoded_data (bytes | str): The encoded image data.
        file_name (str): The name that will be given to the file.

    Returns:
        ContentFile: A File-like object that takes just raw content.
    """
    file_format, image_string_data = image_encoded_data.split(";base64,")
    # Get the file format extension (png, jpg, jpeg, etc.)
    file_extension = file_format.split("/")[-1]
    image_bytes_data = b64decode(image_string_data)
    image_file = ContentFile(image_bytes_data, f"{file_name}.{file_extension}")
    return image_file


def get_patch_data(request) -> tuple[QueryDict, MultiValueDict]:
    """Parse multipart PATCH request body into (POST-like dict, FILES-like dict).

    Args:
        request: The PATCH request.

    Returns:
        tuple[QueryDict, MultiValueDict]: The PATCH request data.
    """
    content_type = request.META.get("CONTENT_TYPE", "")
    if "multipart" in content_type:
        parser = MultiPartParser(request.META, request, request.upload_handlers)
        return parser.parse()
    return QueryDict(request.body), {}

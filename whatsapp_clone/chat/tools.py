from typing import Union, Optional, List
from .models import User, Chat, Message, Contact, Status
from phonenumber_field.phonenumber import PhoneNumber
from .exceptions import *


def get_user_by_id(user_id: Union[str, int]) -> Union[object, Exception]:
    """Returns the user in the database found with the given id,
    raises an exception if not found
    Args:
        user_id (Union[str, int]): A numeric (integer) value that identify the user.
    Raises:
        UserNotFoundException: Raised when there's no user with the given id.
    Returns:
        Union[object, Exception]: The user object in the database or an exception if not found.
    """
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise UserNotFoundException("NO USER FOUND WITH SUCH ID")


def get_user_by_phone(phone_number: str) -> Union[object, Exception]:
    """Returns the user in the database found with the given phone_number,
    raises an exception if not found
    Args:
        phone_number (str): The phone number of the wanted user.
    Raises:
        UserNotFoundException: Raised when there's no user with such phone
    Returns:
        Union[object, Exception]: The user object in the database or an exception if not found.
    """
    try:
        return User.objects.get(phone_number=phone_number)
    except User.DoesNotExist:
        raise UserNotFoundException("NO USER FOUND WITH SUCH PHONE")


def create_contact(contact_name: str, contact_phone_number: str, creator: User) -> None:
    """Creates and stores a new contact object in the database.
    Args:
        contact_name (str): The name that the user thought for the contact.
        contact_phone_number (str): The phone number of the contact.
        user_id Union[str, int]: The id of the user who is creating the contact.
    """
    phone = PhoneNumber.from_string(contact_phone_number)
    new_contact = Contact.objects.create(
        name=contact_name, phone_number=phone.as_e164, created_by=creator
    )


def get_user_contacts(user_id: Union[str, int], desired_value: str) -> List[Contact]:
    """Returns all the contacts desired values (fields) of the User with the given id.

    Args:
        user_id (Union[str, int]): The id of the User.
        desired_value (str): The desired field of the contacts objects.

    Returns:
        List[Contact]: The list of the contacts values.
    """
    user_instance = User.objects.get(id=user_id)
    return list(user_instance.contact_set.values_list(desired_value, flat=True))


def contact_from_user(user: User, contact_phone_number: str) -> Union[Contact, None]:
    """Returns the contact with the provided phone number from the given User.

    Args:
        user (User): The User that created the contact.
        contact_phone_number (str): The phone-number of the contact that we're looking for.

    Returns:
        Union[Contact, None]: The found Contact or None if no Contact is found.
    """
    return user.contact_set.filter(phone_number=contact_phone_number).first()


def get_contact_in_chat(chat: Chat, logged_user: User) -> Union[Contact, None]:
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
        print("CONTACT NOT FOUND!")
        return None


def get_contacts_statuses(user: User, muted: bool) -> dict:
    contacts = user.contact_set.filter(statuses_muted=muted)
    # Query for statuses uploaded by the user or the user's contacts
    contact_phone_numbers = contacts.values_list("phone_number", flat=True)
    statuses_with_contacts = Status.objects.filter(
        uploaded_by__phone_number__in=contact_phone_numbers
    )
    contacts_with_statuses = {}
    for status in statuses_with_contacts:
        contact = contacts.filter(phone_number=status.uploaded_by.phone_number).first()
        if contact:
            contacts_with_statuses.setdefault(contact, []).append(status)
    print(len([value for value in contacts_with_statuses.values()]))
    print([value for value in contacts_with_statuses.values()])
    return contacts_with_statuses

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
    

def create_contact(contact_name: str, contact_phone_number: str, user_id: Union[str, int]) -> None:
    """Creates and stores a new contact object in the database.
    Args:
        contact_name (str): The name that the user thought for the contact.
        contact_phone_number (str): The phone number of the contact.
        user_id Union[str, int]: The id of the user who is creating the contact.
    """
    user_instance = User.objects.get(id=user_id)
    phone = PhoneNumber.from_string(contact_phone_number)
    new_contact = Contact.objects.create(
        name=contact_name, phone_number=phone.as_e164, created_by=user_instance
    )

def get_user_contacts(user_id: Union[str, int], desired_value:str) -> List[Contact]:
    """Returns all the contacts desired values (fields) of the User with the given id.

    Args:
        user_id (Union[str, int]): The id of the User.
        desired_value (str): The desired field of the contacts objects.

    Returns:
        List[Contact]: The list of the contacts values.
    """
    user_instance = User.objects.get(id=user_id)
    return list(user_instance.contact_set.values_list(desired_value, flat=True))

def contact_archived(user:User, contact_phone_number: str) -> bool:
    """Searchs for the contact object with the given phone_number 
    in the contact list of the provided User
    and returns if its archived or not.

    Args:
        user (User): The User object.
        contact_phone_number (str): The phone number of the contact that we are looking for.

    Returns:
        bool: contact.arhived field, returns False if no contact is found.
    """
    contact = user.contact_set.filter(phone_number=contact_phone_number).first()
    print(f'CONTACT IS ARCHIVED??? {contact}')
    if contact:
        return contact.archived
    else:
        return False
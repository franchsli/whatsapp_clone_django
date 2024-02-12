from django import template
from phonenumber_field.phonenumber import PhoneNumber
from chat.models import Contact, User

register = template.Library()


@register.filter
def exclude_user(value, user):
    user_list = list(value.values_list("username", flat=True))
    return user_list[1] if user_list[1] != user.username else user_list[0]


@register.filter
def to_list(value):
    # you CAN ALSO use list comprehension (super effective)
    # print(value.values_list('sender_user', 'text').order_by('-date'))
    # list(value.values_list('sender_user', 'text').order_by('-date'))
    return list(value.values_list("id", flat=True).order_by("date"))


@register.filter
def last_message(value, data):
    messages_data = list(value.values_list(data, flat=True).order_by("date"))
    return messages_data[-1] if len(messages_data) > 0 else ''


@register.simple_tag
def exclude_user_tag(user_set, user, value):
    user_list = list(user_set.values_list(value, flat=True))
    comparison = user.username if value == "username" else user.phone_number
    return user_list[1] if user_list[1] != comparison else user_list[0]


@register.simple_tag
def get_contact_in_chat(user_set, auth_user, desired_value):
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

    elif desired_value == "photo":
        contact = User.objects.get(phone_number=result)
        if contact.has_photo:
            return contact.photo.url
        else:
            return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNBNdcMDNS2r9df1IWFVc8AY0QNtfNhEJv7fGS5TdhUWrlBqfGu1PCCn9lKpL-FqF9dWc&usqp=CAU"


@register.simple_tag
def get_contact_photo(phone):
    user = User.objects.get(phone_number=phone)
    if user.has_photo:
        return user.photo.url
    else:
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNBNdcMDNS2r9df1IWFVc8AY0QNtfNhEJv7fGS5TdhUWrlBqfGu1PCCn9lKpL-FqF9dWc&usqp=CAU"

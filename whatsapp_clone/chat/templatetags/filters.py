from django import template
from phonenumber_field.phonenumber import PhoneNumber
from chat.models import Contact
register = template.Library()

@register.filter
def exclude_user(value, user):
    user_list = list(value.values_list('username', flat=True))
    return user_list[1] if user_list[1] != user.username else user_list[0]
 
@register.filter
def to_list(value):
    # you CAN ALSO use list comprehension (super effective)
    #print(value.values_list('sender_user', 'text').order_by('-date'))
    #list(value.values_list('sender_user', 'text').order_by('-date'))
    return list(value.values_list('id', flat=True).order_by('date'))

@register.simple_tag
def exclude_user_tag(user_set, user, value):
    user_list = list(user_set.values_list(value, flat=True))
    comparison = user.username if value == 'username' else user.phone_number
    return user_list[1] if user_list[1] != comparison else user_list[0]

@register.simple_tag
def get_contact_in_chat(user_set, auth_user):
    phones_list = list(user_set.values_list('phone_number', flat=True))
    result = phones_list[0] if auth_user.phone_number != phones_list[0] else phones_list[1]
    contact = Contact.objects.get(created_by=auth_user, phone_number=result)
    return contact.name
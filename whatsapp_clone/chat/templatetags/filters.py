from django import template
from phonenumber_field.phonenumber import PhoneNumber
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
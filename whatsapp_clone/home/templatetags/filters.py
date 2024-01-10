from django import template
register = template.Library()

@register.filter
def exclude_user(value, user):
    #value = value.remove(user)
    #print(type(user))
    #print(type(value[1]))
    #print(value[0])
    #print(user.username)
    return value[1].user if value[1].user != user else value[0].user
 
@register.filter
def to_list(value):
    return list(value.values_list('sender_user', 'text').order_by('-date'))
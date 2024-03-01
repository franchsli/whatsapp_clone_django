
# Whatsapp clone

## DO RIGHT NOW

- **IMPORTANT**:
Finish the archive chat logic (review views.py, filters.py, chats.html)
  - Modify the archive chat view to return archived or not archived chats depending on archive arg.
  - Implement something to get contact id from chat (filters.py)
- Make the silence contact logic (booleand field)
- Make the add status form work:
  - make it so the url parameters are optional (or check how you sent images from that input [image input]).
    The post request will update the entire statuses.html (use HTMX like always).
- Add something to delete statuses automatically every 24 hours.
- Remember to make a button "area" that covers 75 of the li weight (contact status display)
also make all the chats buttons have an area that covers the 75% of the father, anything outside that should be considered
as another action and not a chat_display.
- Rework all the chat.views logics (check if there's a way to implement some view code into another).
- Rework all the hx-post request (for example, if the element only needs to bet updated use patch or put)
- Implement something to update the message receiver chat_list.

## ANOTHER THINGS TO DO

- Implement show/hide muted statuses logic (when you click show, it shows the muted statuses and then show dispay as 'hide'
then when clicked again erase all the muted chats and 'hide' display a show again
for do this 'diplay change' you actually need to change the show button to hide
use htxm from and when the muted statuses gets displayed it should change the button from show to hide)
- Create the search message logic (You can use FILTER ELEMENTS WITH `SHOW ... WHEN` from Hyperscript).
- Add read and unread logic (you can implement it that any message (in the viewport makes a
PATCH request to update the 'read' field in the message model from False to True [This makes the user needs to scroll down or up
to make the PATCH request for all the new messages] only if it is already False [To prevent unnecesary API calls])).
- Add emojis in messages (emojis list...).
- Users shouldn't be able to create TWO OR MORE chats with the same user.
- Write test for the exceptions and functions.
- Add groups chats.
- Redesign the login and register views.
- Add contact form validation.
- Reconsider the exceptions.py file.
- Check what happens when a contact with a unexistent phone_number (user not in database) is created.
- Add chat wallpapers.
- Rework show_dropdown animation.

## Improvements

- Limit the contact name display on chat list.
- Test if edit/delete contact and delete chat works in any case.
**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.
- Delete all console.logs
- **OPTIMIZE REQUESTS**:
  - Combine related request views so the server calls reduce and do two jobs in the same response.
  - Reduce the HTMX responsability and use consumers.
- Optimize the js code (delete all the cloned code.)
- Optimize filters.py code.
- Check what happens when contact user send a message and htmx.ajax runs anyway.
- Make a way to handle image decoding (async way).
- Make it so when a message gets updated or deleted, the other user will be able to see the message edition
(add 'edited' field in message model to do this)
    or deletion in real time. (This has to be with the way the chat  and it's message are displayed)
- When a user is creating a new chat and selects more than a contact,
    the modal form title should change to 'create group' and a new input should appear that has the label
        'group name'.
- Check if create_status have problems dealing with the actual upload_date (consumers.py).
- Check if consumer functions arguments number can be reduced.
- Split Chat Consumers into multiple consumers (e.g Status consumer and so)
- Use for... empty in for loops if necessary. <https://docs.djangoproject.com/en/5.0/ref/templates/builtins/#for-empty>
- Remove all unnecesary datasets and such from chats, contact templates (remember to check websocket.js before deleting).
- Make it responsive.
- Re think the delete message modal (Delete for everyone or for me logic).
- Test all statuses features.
- Check and compare all the whatsapp web features with this project features.
- Review all the code and delete spaguetti code.
- Implement all of these features at [dj-chat](https://github.com/adilmohak/dj-chat?tab=readme-ov-file#current-features)

## BUGS TO FIX

- When a user archives a chat, the chat will be archived from all the users in the chat:
  - Make it so it stores in a 'list' the users who archived the chat:
if both of them archived it, none should get a notification, if only one of the archived it, the one who doesn't archived it
should still see the notifications from the chat.
    Try to use conditions on the htmx.ajax that updates the chats.
- When there's only a contact or chat in the list, its option dropdown seems weird (It has to do with the
chat or contact list height [it is auto rn]) Also check if showDropdown() func doesn't do anything weird (it declares position to fixed).
- Check why request.user.has_photo returns value but (in view) user_instance.has_photo returns False.
- When scroll to bottom doesn't scroll to the botom anymore:
  - **THIS IS WHAT I THINK IT HAPPENS**:
    The chat gets displayed but somehow the read more script doesn't finished running.
    but i don't know whats happening. When the read more isn't in the 'scroll view' (user can't see it)
    the scroll_to_bottom runs as expected....
- When you go to status page and then go back to the normal UI, the theme icon gets reseted.

**REFERENCE**:

- [Outer queryset](https://docs.djangoproject.com/en/5.0/ref/models/expressions/#referencing-columns-from-the-outer-queryset)
- [db queries with Q](https://docs.djangoproject.com/en/5.0/topics/db/queries/#complex-lookups-with-q-objects)
- [queryset operators](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#operators-that-return-new-querysets)
- [Status with text and images.](https://getbootstrap.com/docs/5.3/components/carousel/#captions)
- Read non-standar htmx events  for messages [hx-trigger](https://htmx.org/attributes/hx-trigger/)
- [Closed tags checker](https://www.aliciaramirez.com/closing-tags-checker/)
- [Queryset lists](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#values-list)

**You should also be aware that carousels in general can often cause usability and accessibility challenges.**
For performance reasons, carousels must be manually initialized using the carousel constructor method. Without initialization, some of the event listeners (specifically, the events needed touch/swipe support) will not be registered until a user has explicitly activated a control or indicator.
The only exception are autoplaying carousels with the data-bs-ride="carousel" attribute as these are initialized automatically on page load.If you’re using autoplaying carousels with the data attribute, don’t explicitly initialize the same carousels with the constructor method.

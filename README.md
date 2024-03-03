
# Whatsapp clone

## DO RIGHT NOW

- Give the status form image input an onchange eventlistener that checks if an image is selected or not (see chat image input logic
at user-chats.html, selected-chat.html and websocket.js [line 99])
- Add something to delete statuses automatically every 24 hours.
- Remember to make a button "area" that covers 75 of the li weight (contact status display)
also make all the chats buttons have an area that covers the 75% of the father, anything outside that should be considered
as another action and not a chat_display.
- Rework all the chat.views logics (check if there's a way to implement some view code into another).
- Implement something to update the message receiver chat_list (websocket chatconsumer).

## ANOTHER THINGS TO DO

- Implement show/hide muted statuses logic (when you click show, it shows the muted statuses and then show dispay as 'hide'
then when clicked again erase all the muted chats and 'hide' display a show again
for do this 'diplay change' you actually need to change the show button to hide
use htxm from and when the muted statuses gets displayed it should change the button from show to hide **REMEMBER** IMPLEMENT STATUS
WEBSOCKET CONSUMER BEFORE DOING THIS)
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
- Make the silence contact logic (booleand field)

## Improvements

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
- Re think if image input (status form) should be changed.
- Review previewImage func.
- Test all statuses features.
- Check and compare all the whatsapp web features with this project features.
- Review all the code and delete spaguetti code.
- Implement all of these features at [dj-chat](https://github.com/adilmohak/dj-chat?tab=readme-ov-file#current-features)

## BUGS TO FIX

- When an user uploads a status, the response returns all the statuses (depending on the view data)
 to fix this, you need to make an independent status consumer and send a receive status from there and use HTMX to display it.
  - You can retrieve all the statuses (muted and unmuted) in one view but the but the muted statuses list is display: none;
  and only by clicking the show button will show it changing display to flex and flex direction to column
  this cannot be implemented at the time because this won't display the newest muted statuses by clicking the show button.
- When a user deletes a chat, the chat will be deleted from all the users in the chat
  - To fix this, you need to implement something similar to archive view logic.
- Check why request.user.has_photo returns value but (in view) user_instance.has_photo returns False.
- When scroll to bottom doesn't scroll to the botom anymore:
  - **THIS IS WHAT I THINK IT HAPPENS**:
    The chat gets displayed but somehow the read more script doesn't finished running.
    but i don't know whats happening. When the read more isn't in the 'scroll view' (user can't see it)
    the scroll_to_bottom runs as expected....
    - I think is because the readmore height isn't kept in count when scrolling.
- When you go to status page and then go back to the normal UI, the theme icon gets reseted.
  - It has to do with the HTMX, when it gets reloaded it doesn't count as a DOMContentLoaded (search in stackoverflow).
  - You can see HTMX events to add an hx.event that when the content was swapped into the DOM (before this verify that is the right content)
  apllies the  DOMContentLoaded logic.

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

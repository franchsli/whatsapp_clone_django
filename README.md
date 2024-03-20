
# Whatsapp clone

## DO RIGHT NOW

- Add emojis in messages (emojis list...).
  - Fix why when clicking (swiching to a emoji class) more than one time doesnt resets the emojis container.
  - **TO DO THIS MUST**:
    - Implement a function that when a emoji category btn is clicked,
    selects the button that has the 'emoji-class-active' class and removes its class
    and then adds the 'emoji-class-active' class to the clicked button
    and then does the load_emojis() logic.
    - implement [scrollspy for emojis group](https://getbootstrap.com/docs/5.3/components/scrollspy/)
- Implement show/hide muted statuses logic (when you click show, it shows the muted statuses and then show dispay as 'hide'
then when clicked again erase all the muted chats and 'hide' display a show again
for do this 'diplay change' you actually need to change the show button to hide
use htxm from and when the muted statuses gets displayed it should change the button from show to hide **REMEMBER** IMPLEMENT STATUS
WEBSOCKET CONSUMER BEFORE DOING THIS)
  - **DO THIS** When you click show, it does as expected, but in muted statuses html (template)
  it should handle the 'Show' button and change it to a hidde one that when clicked returns to a not shown muted statuses
  (to do this, you need to implement a new template.)
- Create the search message logic (You can use FILTER ELEMENTS WITH `SHOW ... WHEN` from Hyperscript).
- Add status form validation.
- Add contact form validation.
- Rework all the chat.views logics (check if there's a way to implement some view code into another [try to use django redirect
 to include another view funcionalities into another]).
- Add something to delete statuses automatically every 24 hours.
- Implement something to update the message receiver chat_list (websocket chatconsumer).

## ANOTHER THINGS TO DO

- Add read and unread logic (you can implement it that any message (in the viewport makes a
PATCH request to update the 'read' field in the message model from False to True [This makes the user needs to scroll down or up
to make the PATCH request for all the new messages] only if it is already False [To prevent unnecesary API calls])).
- Users shouldn't be able to create TWO OR MORE chats with the same user.
- Write test for the exceptions and functions.
- Add groups chats.
- Redesign the login and register views.
- Reconsider the exceptions.py file.
- Check what happens when a contact with a unexistent phone_number (user not in database) is created.
- Add chat wallpapers.
- Rework show_dropdown animation.
- Make the silence contact logic (booleand field)

## Improvements

- Review previewImage func.
- Test all statuses features.
- Remove all unnecesary datasets and such from chats, contact templates (remember to check websocket.js before deleting).
- Give the user creation form image preview logic.
- Optimize the js code (delete all the cloned code.)
- Optimize filters.py code.
- Restrict chat views (check if the request method is the correct one if not, raise an error).
- Test if edit/delete contact and delete chat works in any case.
- Re think the delete message modal (Delete for everyone or for me logic).
- Re think if image input (status form) should be changed.
**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.
- Delete all console.logs
- **OPTIMIZE REQUESTS**:
  - Combine related request views so the server calls reduce and do two jobs in the same response.
  - Reduce the HTMX responsability and use consumers.
- Check what happens when contact user send a message and htmx.ajax runs anyway.
- Make a way to handle image decoding (async way).
- Make it so when a message gets updated or deleted, the other user will be able to see the message edition
(add 'edited' field in message model to do this)
    or deletion in real time. (This has to be with the way the chat  and it's message are displayed)
- When a user is creating a new chat and selects more than a contact,
    the modal form title should change to 'create group' and a new input should appear that has the label
        'group name'.
- Check if consumer functions arguments number can be reduced.
- Split Chat Consumers into multiple consumers (e.g Status consumer and so)
- Make it responsive.
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
    The chat gets displayed but somehow scroll_to_bottom doesn't work as expected.
    There's two approaches:
    - I think is because the images in the chat load with delay:
      1. All the messages (text) loads
      2. scroll_to_botom executes.
      3. The high resolution images load, 'lengthening' the space used by the messages,
       giving the effect that it has not been completely scrolled.
      4. To fix this you can change the image format to an optimized one.

    - I think is because the readmore height isn't kept in count when scrolling.

**REFERENCE**:

- [Outer queryset](https://docs.djangoproject.com/en/5.0/ref/models/expressions/#referencing-columns-from-the-outer-queryset)
- [db queries with Q](https://docs.djangoproject.com/en/5.0/topics/db/queries/#complex-lookups-with-q-objects)
- [queryset operators](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#operators-that-return-new-querysets)
- [Status with text and images.](https://getbootstrap.com/docs/5.3/components/carousel/#captions)
- Read non-standar htmx events  for messages [hx-trigger](https://htmx.org/attributes/hx-trigger/)
- [Closed tags checker](https://www.aliciaramirez.com/closing-tags-checker/)
- [Queryset lists](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#values-list)
- [For...empty](https://docs.djangoproject.com/en/5.0/ref/templates/builtins/#for-empty)

**You should also be aware that carousels in general can often cause usability and accessibility challenges.**
For performance reasons, carousels must be manually initialized using the carousel constructor method. Without initialization, some of the event listeners (specifically, the events needed touch/swipe support) will not be registered until a user has explicitly activated a control or indicator.
The only exception are autoplaying carousels with the data-bs-ride="carousel" attribute as these are initialized automatically on page load.If you’re using autoplaying carousels with the data attribute, don’t explicitly initialize the same carousels with the constructor method.

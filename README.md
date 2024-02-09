
# Whatsapp clone

TODO:
    +**FIX** When scroll to bottom doesn't scroll to the botom anymore.
    **THIS IS WHAT I THINK IT HAPPENS**:
        The chat gets displayed but somehow the read more script doesn't finished running.
        but i don't know whats happening. When the read more isn't in the 'scroll view' (user can't see it)
        the scroll_to_bottom runs as expected....
    - Add read and unread logic.
    - **ADD THE LAST MESSAGE LOGIC**
        + When the message list is updated, the chat list gets updated too (This is a way to update the last message.)
    - Users shouldn't be able to create TWO OR MORE chats with the same user.
    - You can use FILTER ELEMENTS WITH `SHOW ... WHEN` from Hyperscript
    - Write test for the exceptions and functions.
    - Add groups chats.
    - Add status page.
    - Add status logic.
    - Redesign the login and register views.
    - Create the search message logic.
    - Add the "read more" function to messages.
    - Add the archived chats logic.
    - Add contact form validation.
    - Reconsider the exceptions.py file.

## Improvements

- Check the deleteoptions onclick.
- Implement something to store messages in the localStorage so the API calls get reduced.
(The localSotrage will sotre messages but the API calls will be still necessary for getting the latest messages)
**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.
- Delete all console.logs
- Check why request.user.has_photo returns value but (in view) user_instance.has_photo returns False.
- Optimize the js code (delete all the cloned code.)
- Check what happens when contact user send a message and htmx.ajax runs anyway.
- Make it so when a message gets updated or deleted, the other user will be able to see the message edition
    or deletion in real time. (This has to be with the way the chat  and it's message are displayed)
- When a user is creating a new chat and selects more than a contact,
    the modal form title should change to 'create group' and a new input should appear that has the label
        'group name'.
- Use for... empty in for loops if necessary. <https://docs.djangoproject.com/en/5.0/ref/templates/builtins/#for-empty>
- Remove all unnecesary datasets and such from chats, contact templates.
- Fix: When there's only a contact or chat in the list, its option dropdown seems weird.
- Make it responsive.
- Re think the delete message modal (Delete for everyone or for me logic).

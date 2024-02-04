
# Whatsapp clone

TODO:
    - **IMPORTANT** IMPLEMENT THIS
    - **ADD THE LAST MESSAGE LOGIC**
    + Make it so when user send a message, it contains the dropwdown and such.
        (USE HTMX for this one [The display chat logic should work])
    - You can use FILTER ELEMENTS WITH `SHOW ... WHEN` from Hyperscript
    - Write test for the exceptions and functions.
    - Add groups chats.
    - Add status page.
    - Add status logic.
    - Add read and unread logic.
    - Redesign the login and register views.
    - Create the search message logic.
    - Add the "read more" function to messages.
    - Add the archived chats logic.
    - Use text truncation for the last messages.
    - Add contact form validation.
    - Reconsider the exceptions.py file.

## Improvements

- Implement something to store messages in the localStorage so the API calls get reduced.
**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.
(The localSotrage will sotre messages but the API calls will be still necessary for getting the latest messages)
- Users shouldn't be able to create TWO OR MORE chats with the same user
- Check why request.user.has_photo returns value but (in view) user_instance.has_photo returns False.
- Optimize the js code (delete all the cloned code.)
- Make it so when a message gets updated or deleted, the other user will be able to see the message edition
    or deletion in real time. (This has to be with the way the chat  and it's message are displayed)
- When a user is creating a new chat and selects more than a contact,
    the modal form title should change to 'create group' and a new input should appear that has the label
        'group name'.
- Fix: When there's only a contact or chat in the list, its option dropdown seems weird.
- Make it responsive.
- Re think the delete message modal (Delete for everyone or for me logic).

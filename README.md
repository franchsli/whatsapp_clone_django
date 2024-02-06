
# Whatsapp clone

TODO:
    - **IMPORTANT** IMPLEMENT THIS
    - Use text truncation for the messages:
        + Create a display flex row col logic:
            Images in messages should use one row alone.
            Text and dropwdown button should use one row (col-9 for messages and col-3 for dropdown)
            Implement the read more logic:
                + When a text is too large, display a 'Read more' span that when clicked shows more
                text and the span transforms into 'Read less' that when clicked show less.
        Test these things in a HTML, CSS and JS new files.
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

- When a message is 'rightclicked', the dropdown appears.
- Implement something to store messages in the localStorage so the API calls get reduced.
(The localSotrage will sotre messages but the API calls will be still necessary for getting the latest messages)
**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.
- Check why request.user.has_photo returns value but (in view) user_instance.has_photo returns False.
- Optimize the js code (delete all the cloned code.)
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

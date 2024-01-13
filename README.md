
# Whatsapp clone

TODO:
    - **IMPORTANT** IMPLEMENT MULTIPLE GROUPS
    Each user should be connected to two groups:
        *A unique group that is named with the user id
        *The group they're connected to (one chat) its named with the chat id
        Note that the second mentioned group isn't strictly necessary but the unique one is
    Implementing that, means that when user A sends a message, it is sent to the chat and to the user B unique group
    so no matter what user B is doing or chatting with, it will ALWAYS get a notification everytime someone text him.
    - **IMPORTANT** Make it so when you send a message to the server, it stores in the db.
    - **MUST DO** Make it so the messages data get stored in the localstorage once the API get called
    so the next time  tries to load the messages from local storage, reducing the API calls.
    - Custom the clase User to have phonenumber and a list of chats.
    - Make it so when you create an account, you need to put your phonenumber.
    - Make phonenumber blank=False.
    - Add groups chats.
    - Allow images in messages.
    - Add status page.
    - Add status logic
    - Add read and unread logic.
    - Redesign the login and register views.
    - Use collapse for the pages.
    - Create the search message logic.
    - Add the "read more" function to messages.
    - Add the archived chats logic.
    - Use text truncation for the messages.
    - Divide all the HTML in templates in partials and include them.
    - Rename home app to chat.
    - Rename sender user field from message.
    - Add the create chats logic.

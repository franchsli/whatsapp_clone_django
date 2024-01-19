
# Whatsapp clone

TODO:
    -**DO IT NOW** Check if the HTMX to update the contact still working and do the same for contacts.
    Also, separate the HTML into files again.
    - **IMPORTANT** IMPLEMENT THIS:
    Users should be able to CRUD contacts
    - **ADD THE LAST MESSAGE LOGIC**
    - **MUST DO** Make it so the messages data get stored in the localstorage once the API get called
    so the next time  tries to load the messages from local storage, reducing the API calls.
    **MUST DO** Replace the username in the create_message_html() condition for phonenumber.
    - You can use FILTER ELEMENTS WITH `SHOW ... WHEN` from Hyperscript
    - Write test for the exceptions and functions.
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
    - Use text truncation for the last messages.
    - Add the create chats logic.
    - Make it so the chats name come with the contact that the user has.
    - Reconsider the exceptions.py file

## Improvements

- Users shouldn't be able to create TWO OR MORE chats with the same user
- When a user creates a chat it collapse will stay showing.
- When a form is succesfully submited, the inputs should be clear
- When a user is creating a new chat and selects more than a contact,
    the modal form title should change to 'create group' and a new input should appear that has the label
        'group name'.

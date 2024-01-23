
# Whatsapp clone

TODO:
    - **IMPORTANT** IMPLEMENT THIS:
    - Allow images in messages:
        WHEN THE USER ATTACH A PHOTO, ADD IT TO THE MESSAGE INPUT OR SUM SO THAT THE USER SEE THAT THE IMG GOT SUCCESSFULLY ADDED.
        WHEN THE PLANE ICON GETS CLICKED IT SENDS THE MESSAGE ALONG WITH THE INPUT IMAGE.
    - **ADD THE LAST MESSAGE LOGIC**
    - **MUST DO** Make it so the messages data get stored in the localstorage once the API get called
    so the next time  tries to load the messages from local storage, reducing the API calls.
    - You can use FILTER ELEMENTS WITH `SHOW ... WHEN` from Hyperscript
    - Write test for the exceptions and functions.
    - Add groups chats.
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
    - Reconsider the exceptions.py file

## Improvements

- Make it so when a user creates a new contact, the chat form gets updated. (REMEMBER HTMX FROM)
- Users shouldn't be able to create TWO OR MORE chats with the same user
- When a user creates a chat it collapse should stay showing.
- Check why request.user.has_photo returns value but (in view) user_instance.has_photo returns False.
- When a form is succesfully submited, the inputs should be clear
- When a user is creating a new chat and selects more than a contact,
    the modal form title should change to 'create group' and a new input should appear that has the label
        'group name'.
- Fix: When there's only a contact or chat in the list, its option dropdown seems weird.
- Make it responsive.

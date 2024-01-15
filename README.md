
# Whatsapp clone

TODO:
    - **IMPORTANT** IMPLEMENT THIS:
    Users should be able to CRUD contacts
    Users should be able to create chat with the contacts in this way:
    When a user try to create a chat, the user needs to select his different contacts that he created
    once selected, the user will push a "create" button that gets all the phonenumbers of the selected contacts and searchs them
    in the db and then creates a chat with the users that got found
    `THE CHAT CAN'T BE CREATED WITH THE CONTACT MODELS, ONLY USERS ACCEPTED` This is to avoid multiples same contacts in the same chat.
    - **ADD THE LAST MESSAGE LOGIC**
    - **IMPORTANT** Make it so when you send a message to the server, it stores in the db.
    - **MUST DO** Make it so the messages data get stored in the localstorage once the API get called
    so the next time  tries to load the messages from local storage, reducing the API calls.
    **MUST DO** Replace the username in the create_message_html() condition for phonenumber.
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
    - Rename sender user field from message.
    - Add the create chats logic.
    - Improve readibility and scalability of consumers.
    **MUST DO** Make it so you can add contacts and create chats selecting contacts.
    - You can use FILTER ELEMENTS WITH `SHOW ... WHEN` from Hyperscript

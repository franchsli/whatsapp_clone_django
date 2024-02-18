
# Whatsapp clone

TODO:
    **DO RIGHT NOW**:
        - Make the add status form work:
            + make it so the url parameters are optional.
            The post request will update the entire statuses.html (use HTMX like always).
        - Implement the archived chats logic (archived booleand field, HTMX update and such).
        - Display in the view the contacts that was created by the auth user and have uploaded a status.
        - Make a carousel modal for the statuses.
        - Display the contact list (iterate over contacts queryset then display the status in the modal.)
        Cliking on a contact that uploaded a status will display the modal carousel.
        - Remember to include the user_statuses variable HTML.
        - Remember to add something to delete statuses automatically every 24 hours.
        - Remember to make a button "area" that covers 75 of the li weight (contact status display).
        - [Status with text and images.](https://getbootstrap.com/docs/5.3/components/carousel/#captions)
        **You should also be aware that carousels in general can often cause usability and accessibility challenges.**
        For performance reasons, carousels must be manually initialized using the carousel constructor method. Without initialization, some of the event listeners (specifically, the events needed touch/swipe support) will not be registered until a user has explicitly activated a control or indicator.

The only exception are autoplaying carousels with the data-bs-ride="carousel" attribute as these are initialized automatically on page load. If you’re using autoplaying carousels with the data attribute, don’t explicitly initialize the same carousels with the constructor method.
    **REFERENCE**:
    - [Outer queryset](https://docs.djangoproject.com/en/5.0/ref/models/expressions/#referencing-columns-from-the-outer-queryset)
    - [db queries with Q](https://docs.djangoproject.com/en/5.0/topics/db/queries/#complex-lookups-with-q-objects)
    - [queryset operators](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#operators-that-return-new-querysets)
    - Add status page.
    - Add status logic.
    **NOTE**: Status htmx transition changes need to be in CSS
    - Add user no updates or updates logic (if the user has uploaded a status show it in my status,
    otherwise show no updates in my status).
    - **FIX** When you send a message while in the status page, the app displays the chats in all the app (app UI breaks).
        Try to use conditions on the htmx.ajax that updates the chats.
    - Add muted status logic.
    - Create the search message logic (You can use FILTER ELEMENTS WITH `SHOW ... WHEN` from Hyperscript).
    - Add the archived chats logic.
    - Add read and unread logic.
    - Add emojis in messages (emojis list...).
    - Read non-standar htmx events  for messages [hx-trigger](https://htmx.org/attributes/hx-trigger/)
    - Users shouldn't be able to create TWO OR MORE chats with the same user.
    - Write test for the exceptions and functions.
    - Add groups chats.
    - Redesign the login and register views.
    - Add contact form validation.
    - Reconsider the exceptions.py file.
    - Add chat wallpapers.
    - Rework show_dropdown animation.
    +**FIX** When scroll to bottom doesn't scroll to the botom anymore.
    **THIS IS WHAT I THINK IT HAPPENS**:
        The chat gets displayed but somehow the read more script doesn't finished running.
        but i don't know whats happening. When the read more isn't in the 'scroll view' (user can't see it)
        the scroll_to_bottom runs as expected....

## Improvements

- Rework all the chat.views logics.
- Limit the contact name display on chat list
- Test if edit/delete contact and delete chat works in any case.
- Test  both the chat list and statuses max height.
- Implement something to store messages in the localStorage so the API calls get reduced.
(The localSotrage will sotre messages but the API calls will be still necessary for getting the latest messages)
**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.
- Delete all console.logs
- **OPTIMIZE REQUESTS**:
  - Combine related request views so the server calls reduce and do two jobs in the same response.
  - Reduce the HTMX responsability and use consumers.
- Check why request.user.has_photo returns value but (in view) user_instance.has_photo returns False.
- Optimize the js code (delete all the cloned code.)
- Check what happens when contact user send a message and htmx.ajax runs anyway.
- Make a way to handle image decoding (async way).
- Make it so when a message gets updated or deleted, the other user will be able to see the message edition
    or deletion in real time. (This has to be with the way the chat  and it's message are displayed)
- When a user is creating a new chat and selects more than a contact,
    the modal form title should change to 'create group' and a new input should appear that has the label
        'group name'.
- Check if create_status have problems wealing with the actual upload_date
- Check if consumer functions arguments number can be reduced.
- Split Chat Consumers into multiple consumers (e.g Status consumer and so)
- Use for... empty in for loops if necessary. <https://docs.djangoproject.com/en/5.0/ref/templates/builtins/#for-empty>
- Remove all unnecesary datasets and such from chats, contact templates.
- Remove lal unnecesary csrf token inputs in forms.
- Fix: When there's only a contact or chat in the list, its option dropdown seems weird.
- Make it responsive.
- Re think the delete message modal (Delete for everyone or for me logic).
- Implement all of these features at [dj-chat](https://github.com/adilmohak/dj-chat?tab=readme-ov-file#current-features)

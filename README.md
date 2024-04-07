
# Whatsapp clone

## DO RIGHT NOW

- Modify the messages HTML and style to display the 'read' icon and the hour from the date.
- Make it so when a message gets updated or deleted, the other user will be able to see the message edition.
  - When the message is updated or deleted, IT MUST reload the chat for both
  of the users (if they have displayed the chat obviously)
(add 'edited' field in message model to do this )
- Test all statuses features.
- Optimize filters.py code (ask an AI what's faster why and test it).
- Test if edit/delete contact and delete chat works in any case.
- Restrict chat views (check if the request method is the correct one if not, raise an error).
- [Implement tooltips](https://getbootstrap.com/docs/5.3/components/tooltips/)
- Optimize the images size (whitout decreasing quality).
- Add something to delete statuses automatically every 24 hours.

## ANOTHER THINGS TO DO

- Add read and unread logic (you can implement it that any message (in the viewport makes a
PATCH request to update the 'read' field in the message model from False to True [This makes the user needs to scroll down or up
to make the PATCH request for all the new messages] only if it is already False [To prevent unnecesary API calls])).
- Write tests for the exceptions and functions.
- Rework search messages:
  - Add the whatsapp date tags in HTML in the normal chat and in the searching message UI.
  - Make it so every chat has days and days (model) has messages....
  - Or make a way to display a div telling the date if the  next message in the list have more than one day of difference
  or was send the next day (the div should be displayed over the said next message [under the current message.]
  and the div should only be displayed if the current message it's not the last.)
- Add groups chats.
- Redesign the login and register views.
- Reconsider the exceptions.py file.
- Add chat wallpapers.
- Rework show_dropdown animation.
- Make the silence contact logic (booleand field [think it bro])

## Improvements

- Re think the delete message modal (Delete for everyone or for me logic).
**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.
- Delete all console.logs
- **OPTIMIZE REQUESTS**:
  - Combine related request views so the server calls reduce and do two jobs in the same response.
  - Reduce the HTMX responsability and use consumers.
  - Re think if consumers should create contacts or create another consumer for that (i don't think so).....
- Check what happens when contact user send a message and htmx.ajax runs anyway.
    or deletion in real time. (This has to be with the way the chat  and it's message are displayed)
- Make it responsive (or maybe not).
- Check and compare all the whatsapp web features with this project features.
- Review all the code and delete spaguetti code.
- Implement all of these features at [dj-chat](https://github.com/adilmohak/dj-chat?tab=readme-ov-file#current-features)
- Implement script tag that has type module and the script from register.js
  - This script tag needs to be after the form tag.

## BUGS TO FIX

- The status deletion button it's weirdly positioned.
- Deleting a status will show like a status is displaying but nothing is.
- When a user deletes a chat, the chat will be deleted from all the users in the chat
  - To fix this, you need to implement something similar to archive view logic.
- Scroll to bottom func doesn't scroll to the botom anymore:
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
- You can't archive chats who are not with a contact.

**REFERENCE**:

- [Outer queryset](https://docs.djangoproject.com/en/5.0/ref/models/expressions/#referencing-columns-from-the-outer-queryset)
- [db queries with Q](https://docs.djangoproject.com/en/5.0/topics/db/queries/#complex-lookups-with-q-objects)
- [queryset operators](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#operators-that-return-new-querysets)
- [Status with text and images.](https://getbootstrap.com/docs/5.3/components/carousel/#captions)
- Read non-standar htmx events  for messages [hx-trigger](https://htmx.org/attributes/hx-trigger/)
- [Closed tags checker](https://www.aliciaramirez.com/closing-tags-checker/)
- [Queryset lists](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#values-list)
- [For...empty](https://docs.djangoproject.com/en/5.0/ref/templates/builtins/#for-empty)
- [CSS Components](https://uiverse.io/)
- [Filtering Views and ViewSets](https://www.django-rest-framework.org/api-guide/filtering/)

**You should also be aware that carousels in general can often cause usability and accessibility challenges.**
For performance reasons, carousels must be manually initialized using the carousel constructor method. Without initialization, some of the event listeners (specifically, the events needed touch/swipe support) will not be registered until a user has explicitly activated a control or indicator.
The only exception are autoplaying carousels with the data-bs-ride="carousel" attribute as these are initialized automatically on page load.If you’re using autoplaying carousels with the data attribute, don’t explicitly initialize the same carousels with the constructor method.

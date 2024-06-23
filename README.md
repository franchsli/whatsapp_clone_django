
# Whatsapp clone

## DO RIGHT NOW

- Check why the chat list gets updated after using append_messages:
  **BUG TRIGGER:** Line 530 at websocket.js. The chat list is updated no matter what,
  this needs to be regulated.
- **IMPORTANT** TEST THE BEHAVIOUR IN ALL THE CASES POSSIBLES IN THE NEW
  DISPLAY_CHAT LOGIC.
- Fix bugs in reworked chat_display view:
  - Check the cases were messages are not read or not displayed (hint: has to do with views.py line 167).

- ***OPTIMIZE***:
  - Rework the way to update the messages list *(receiver)*:
    - Only call display_chat when clicking in a chat,
    this is to avoid loading unnnecesary HTML contents and to avoid things like
    if a user needs to search a very old message but the contact messages them the entire chat list will be
    updated again and the user will do request to the server again,
    in order to reduce the size of the request, only the new messages will be returned and appended to the messages
    list (if the chat is displayed of course)
      - If the sender deleted a message get (via websocket)
      the id of the message and search for it in the displayed messages list (if it's displayed)
      if the message is found, remove it using element.remove()
      - If the sender edited a message get (via websocket)
      the id of the message and search for it in the displayed messages list (if it's displayed)
      if the message is found, replace all its text and add the 'Edited' thing.
      *THIS IS FOR REDUCING REQUESTS IN HALF (or so)*

## ANOTHER THINGS TO DO

- optimize all the possible code.
- Review all the code and delete spaguetti code.
- Use more with statements (????)
- Re think if consumers should create contacts or create another consumer for that (i don't think so).....
- Rework messages list:
  - Display 'Yesterday' if the message has more than a day of difference but less than two.
- **FIX** Some messages width break the chat container after using 'show more'
- Make a custom theme (really dark) and use it as a dark mode.
- Add more animations.
- Add more sounds (if possible).
- Implement something to archive group-like Chats.
- Add HTMX functionality to the 3 pills for filtering the chat list:
  - Think about adding archived_groups view.
- Implement something to create Group-like Chats.
  - Look at chats.html line 63 and exception in chat_desired_data.
- Rework the UI:
  - Rework the Chat form display, replace everything in the user UI (chats or contacts list)
   excluding the navbar where things like the status view, setting and such are located.
  - Add a search bar for chats searching.
- Optimize the images size (whithout decreasing quality if possible).
- Implement something to show a close look when a image in a chat is clicked (like Whatsapp)
- Add something to delete statuses automatically every 24 hours (cronjobs maybe).
- Rework statuses UI.

- Add status complex status creation (like Whatsapp).
  - Users could select the color of the background for
    statuses.
- Redesign the login and register views (CSS).
- Add chat wallpapers user CSS url for images and a JS color selector for colors.
- Make the silence contact logic (booleand field [think it bro])

## Improvements

- Implement a dynamic status length:
  - If its a photo 5 secs
  - if its a long text (more than 200 chars) 10 secs
  - if its a video, the length of the video.
  - Or if its not a video, 5 secs and users should be able to pause the event (like whatsapp)

**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.

- Make it responsive (or maybe not).
- Check and compare all the whatsapp web features with this project features.
- Implement all of the features at [dj-chat](https://github.com/adilmohak/dj-chat?tab=readme-ov-file#current-features)
- Delete all console.logs

## BUGS TO FIX

- Sometimes the messages won't be appended, the number of succesful appended
messages varies randomly and don't know why.
- When a user archives a contact, all group-like chats in which the contact is in will be archived as well.
- When a user deletes a chat, the chat will be deleted from all the users in the chat
  - To fix this, you need to implement something similar to archive view logic.
- Scroll to bottom func doesn't scroll to the botom anymore when the last messages are images, test why:
  - **THIS IS WHAT HAPPENS**:
    The chat gets displayed but somehow scroll_to_bottom doesn't work as expected.
    - It's because the images in the chat load with delay:
      1. All the messages (text) load.
      2. scroll_to_botom executes.
      3. The high resolution images load, 'lengthening' the space used by the messages,
       giving the effect that it has not been completely scrolled.
      4. To fix this you can change the image format to an optimized one or implement
      loading techniques, right now the messages images have lazy loading.

    - I think is because the readmore height isn't kept in count when scrolling.
- Users can't archive chats who are not with a contact, and they won't if the chat archiving logic stills working like it's right now.
  The only way to archive chats that are not with a Contact its to add the archive field to the Chat model, but that
    would means that the Chat will be archived for all the Users in it.

## NOTES FOR LATER

- If the unread counter badges are acting weird, see update_chat_list() at summon_chat.

**RESOURCES**:

- [Custom theme modes](https://getbootstrap.com/docs/5.3/customize/color-modes/#adding-theme-colors)
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
- [CSS Animations](https://xsgames.co/animatiss/)
- [Languages Documentation](https://devdocs.io/)
- [The Stocks V3 CSS RESORUCES](https://v3.thestocks.im/)
- [More CSS RESOURCES](https://thestocks.im/?ref=buffer-resources)

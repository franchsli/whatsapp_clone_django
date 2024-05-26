
# Whatsapp clone

## DO RIGHT NOW

- **DO RIGHT NOW** Fix and finish the logic of the message date layers in chat:
  - Implement something to display the layers only if that date it's not displayed already.
- Rework messages list:
  - Add the whatsapp date tags in HTML in the normal chat and in the searching message UI.
  - Or make a way to display a div telling the date if the next message in the list have more than one day of difference
  or was send the next day (the div should be displayed over the said next message [under the current message.]
  and the div should only be displayed if the current message it's not the last.)
- **FIX** Some messages width break the chat container after using 'show more'
- Make a custom theme (really dark) and use it as a dark mode.
- Add more animations.
- Implement something to archive group-like Chats.
- Add HTMX functionality to the 3 pills for filtering the chat list:
  - Think about adding archived_groups view.
- Implement something to create Group-like Chats.
  - Look at chats.html line 63 and exception in chat_desired_data.
- Rework the UI:
  - Rework the Chat form display, replace everything in the user UI (chats or contacts list)
   excluding the navbar where things like the status view, setting and such are located.
  - Add a search bar for chats searching.
- **OPTIMIZE REQUESTS**:
  - Use more with statements (????)
  - Re think if consumers should create contacts or create another consumer for that (i don't think so).....
- [Implement tooltips](https://getbootstrap.com/docs/5.3/components/tooltips/)
- Optimize the images size (whithout decreasing quality if possible).
- Add something to delete statuses automatically every 24 hours (cronjobs maybe).

## ANOTHER THINGS TO DO

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
- Review all the code and delete spaguetti code.
- Implement all of the features at [dj-chat](https://github.com/adilmohak/dj-chat?tab=readme-ov-file#current-features)
- Delete all console.logs

## BUGS TO FIX

- When a user archives a contact, all group-like chats in which the contact is in will be archived as well.
- When a user deletes a chat, the chat will be deleted from all the users in the chat
  - To fix this, you need to implement something similar to archive view logic.
- Scroll to bottom func doesn't scroll to the botom anymore:
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

- If there's something slowing down displaying things like messages in a specific chat
  it could be iterator() method in display_chat() view for-loop.

**RESOURCES**:

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

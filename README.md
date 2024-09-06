
# Whatsapp clone

## DO RIGHT NOW

- Implement something to show a close look when a image in a chat is clicked
  (like Whatsapp).
- Add status complex status creation (like Whatsapp).
  - Users could select the color of the background for
    statuses.
    - [Useful library for that](https://github.com/fabiocaccamo/django-colorfield)
- Add chat wallpapers user CSS url for images and a JS color selector for colors.
  - [USE THIS](https://getbootstrap.com/docs/5.3/forms/form-control#color).
  - EVERY TIME YOU IMPLEMENT A COLOR PICKER YOU SHOULD ADD A ONINPUT THEN A FUNCTION
  THAT CHANGES THE COLOR OF THE FOUND ELEMENT WITH THE GIVEN ID WITH THE INPUT COLOR,
  LIKE THIS:
    onclick="change_element_color(this.style.color, target_element_id)"
- Add user settings to personalize things like notification appareance
  or even UI theming (the dark and light theme will remain the same,
  but more themes will be added  [don't know when, don't know how])

## ANOTHER THINGS TO DO

- Rework the UI (in order to look like actual Whatsapp's UI):
  - Recolor the text of 'select archive' in file form.
  - Think about changing the UI layout.
- Implement something to create Group-like Chats.
  - Look at chats.html line 63 and exception in chat_desired_data.
- Implement something to archive group-like Chats.
- Add HTMX functionality to the 3 pills for filtering the chat list:
  - Think about adding archived_groups view.
- Re think if consumers should create contacts or create another consumer for that
  (i don't think so).....
- Add something to delete statuses automatically every 24 hours (cronjobs maybe).
- Rework statuses UI.
- Add more sounds (if possible).
- Make the silence contact logic (booleand field [think it bro])
- Review all the code, optimize it and delete spaguetti code.
- Check which apis are still necesary.

## Improvements

- Implement a dynamic status length:
  - If its a photo 5 secs.
  - if its a long text (more than 200 chars) 10 secs.
  - if its a video, the length of the video.
  - Or if its not a video, 5 secs and users should be able to pause the event
    (like whatsapp).

**IMPLEMENT**
READ THE CHATGPT Django Channels Websocket chat for IMPORTANT improvement.
Also don't forget to change the channel layer to redis.

- Make it responsive (or maybe not).
- Check and compare all the whatsapp web features with this project features.
- Implement all of the features at
  [dj-chat](https://github.com/adilmohak/dj-chat?tab=readme-ov-file#current-features)

## BUGS TO FIX

- When the user goes to archived chats view and then returns back, the unread archived
  chats badge is reseted.
- When a user archives a contact, all group-like chats in which the contact is in
  will be archived as well.
- When a user deletes a chat, the chat will be deleted from all the users in the chat
  - To fix this, you need to implement something similar to archive view logic.
  - Or you could add a 'list' of the users that archived the chat:
    - Evertytime a user archive the chat his user object will be added to the 'list'.
    - To check if a user archived it his user will be searched in the 'list'.
- Scroll to bottom func doesn't scroll to the botom anymore when the last messages
  are images, test why:
  - **THIS IS WHAT I THINK THAT HAPPENS**:
    The chat gets displayed but somehow scroll_to_bottom doesn't work as expected.
    - It's because the images in the chat load with delay:
      1. All the messages (text) load.
      2. scroll_to_botom executes.
      3. The high resolution images load, 'lengthening' the space used by
        the messages, giving the effect that it has not been completely scrolled.
      4. To fix this you can change the image format to an optimized one or implement
      loading techniques, right now the messages images have lazy loading.

    - I think is because the readmore height isn't kept in count when scrolling.
- Users can't archive chats who are not with a contact, and they won't if the chat
  archiving logic stills working like it's right now.
  The only way to archive chats that are not with a Contact its to add the archive
  field to the Chat model, but that would means that the Chat will be archived for
  all the Users in it.

## NOTES FOR LATER

- If the unread counter badges are acting weird, see update_chat_list() at summon_chat.

## SPEED TESTS RESULTS

1. [16/08/2024] (RETRIEVE 1003 CHATS): 42.74s.

**RESOURCES**:

- [Django static files compressor docs](https://django-compressor.readthedocs.io/en/latest/quickstart.html)
- [Usage of Django static files compressor](https://django-compressor.readthedocs.io/en/latest/usage.html)
- [Faker docs](https://pypi.org/project/Faker/).
- [HTMX Swap Animations](https://htmx.org/examples/animations/)
- [Custom theme modes](https://getbootstrap.com/docs/5.3/customize/color-modes/#adding-theme-colors)
- [Interface icons](https://www.flaticon.com/uicons/interface-icons)
- [Outer queryset](https://docs.djangoproject.com/en/5.0/ref/models/expressions/#referencing-columns-from-the-outer-queryset)
- [db queries with Q](https://docs.djangoproject.com/en/5.0/topics/db/queries/#complex-lookups-with-q-objects)
- [queryset operators](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#operators-that-return-new-querysets)
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
- [Colors gradients](https://cssgradient.io/gradient-backgrounds/)

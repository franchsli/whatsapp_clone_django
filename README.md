
# Whatsapp clone

## DO RIGHT NOW

- **BUG** When a Chat is displayed and one of the Users sends a message
and then the auth user sends a message, all the unread messages will be displayed.
- Add chat wallpapers user CSS url for images and a JS color selector for colors.
  - [USE THIS](https://getbootstrap.com/docs/5.3/forms/form-control#color).
  - Add a disabled color picker for showing whats the current chat background color.
  - Rewrite the the css and html to show the background color, only show the color if
  it isn't the default color.
- Add status complex status creation (like Whatsapp).
  - Users could select the color of the background for
    statuses.
    - [Useful library for that](https://github.com/fabiocaccamo/django-colorfield)
- Implement a dynamic status length:
  - If its a photo 5 secs.
  - if its a long text (more than 200 chars) 10 secs. (THE MAXIMUM LENGTH IS NO IMAGE AND 450 CHARS)
  - if its a video, the length of the video.
  - Or if its not a video, 5 secs and users should be able to pause the event
    (like whatsapp).

## SCREENSHOTS

![chats and opened chat](https://github.com/user-attachments/assets/afc004af-5634-4ed7-9a3e-dce90b94e799)
![statuses view 1](https://github.com/user-attachments/assets/2c3eae1f-6946-41cf-9825-31c9642227cd)
![status view 2](https://github.com/user-attachments/assets/bb56c211-40a0-4652-93fc-3a21c8b7fedb)

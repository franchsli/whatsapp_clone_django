
# Whatsapp clone

## Overview

A real-time messaging app inspired by Whatsapp and built in Django.

<img width="800" height="430" alt="WHATSAPP_CLONE GIF" src="https://github.com/user-attachments/assets/217983a7-81bf-4f81-b898-a82e5755e2eb" />

[Try it here.](https://whatsapp-clone-django.onrender.com/)

## Quickstart

0.- Set up the database:

Since this project uses PostgreSQL by default you should create a new db instance called "django_whatsapp".
If you don't want to use PostgreSQL you need to reconfigure this project in settings.py after cloning it.

1.- Clone this repository:

                        git clone https://github.com/franchsli/whatsapp_clone_django.git

2.- Create a virtual environment:

                        python -m venv venv

3.- Activate virtual environment.

                        .\venv\Scripts\activate

4.- Open the main directory:

                        cd whatsapp_clone

5.- Install dependencies:

                        pip install -r requirements.txt
                    
6.- Create a .env file:

Since this project reads from there by default, you need to create a file called .env inside the whatsapp_clone directory (the one you are right now)
and you'll write your DATABASE_URL there. Since this project uses postgres by default, your DATABASE_URL should look like this:

``` .env
DATABASE_URL="postgres://postgres:password@:5432/your_database_name"
```

If you called the db instance "django_whatsapp", it may look like this:

``` .env
DATABASE_URL="postgres://postgres:password@:5432/django_whatsapp"
```

However, if you changed the settings (e.g. to use SQLite) the url will depend on your used db.

7.- Migrate all the tables to your db:

                        python manage.py migrate

8.- Start the server:

                        python manage.py runserver
                      
If no error raised, you're good to go!

## Features

Users can:

- Manage contacts.
- Manage chats.
- Chat in 1 to 1 chats or in groups.
- Archive chats.
- Filter chats by "all", "unread" or "groups".
- Filter chats by name (name of the contact or the group).
- Customize their chat backgrounds.
- Star messages.
- Upload statuses.
- Mute contacts' statuses.
- Customize their profile.
- Change the app's theme (dark or light).

## Demo video

https://github.com/user-attachments/assets/410656a5-6d72-44b2-9d0f-c45552c94200

## Screenshots

![chats and opened chat](https://github.com/user-attachments/assets/afc004af-5634-4ed7-9a3e-dce90b94e799)
![statuses view 1](https://github.com/user-attachments/assets/2c3eae1f-6946-41cf-9825-31c9642227cd)
![status view 2](https://github.com/user-attachments/assets/bb56c211-40a0-4652-93fc-3a21c8b7fedb)

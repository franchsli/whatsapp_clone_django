#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "whatsapp_clone.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


# admin 1
# windows
# 595xc5d96c54zwhg
# profile num: 3145538787

# admin 2
# franchslimon
# 5952xfhlñoXD4165@
# profile num : 3125538098

# normal user
# franchsli
# 94f8e5jyt8954LOLMAO
# profile num: 3108542315

# normal user 2
# pythonUser
# xd15x816484@hotlism
# profile num: 3044135899

# normal user 3
# JavaUser
# 418d48e4158990FES52X
# profile num: 3024165870

if __name__ == "__main__":
    main()

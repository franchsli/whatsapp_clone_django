from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('register/', include('register.urls')),
    path('', include('chat.urls')),
    path('api/', include('apis.urls')),
    path('docs/', include_docs_urls(title='APIs documentation.'))
]

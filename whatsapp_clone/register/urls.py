from django.urls import path
from . import views
urlpatterns = [
    path('', views.register, name='register'),
    path('exit/', views.exit, name='exit')
]

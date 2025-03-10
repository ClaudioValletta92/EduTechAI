from django.urls import path
from .views import register, login, logout, current_user

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
    path("current-user/", current_user, name="current_user"),
]

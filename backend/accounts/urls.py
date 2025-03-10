from django.urls import path
from .views import register, login, logout, current_user, update_profile

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
    path("current-user/", current_user, name="current_user"),
    path("update-profile/", update_profile, name="update_profile"),
]

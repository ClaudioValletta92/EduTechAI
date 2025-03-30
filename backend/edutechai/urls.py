from app.views import (
    update_user_profile,
    fetch_user_profile,
)
import app.views as views
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

"""
URL configuration for edutechai project.

The `urlpatterns` list routes URLs to views. For more information please see:key_concept_map
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/projects/", views.project_list_create_view, name="project-list-create"), # type: ignore
    path(
        "api/projects/<int:project_id>/lessons/",
        views.lesson_list_by_project,
        name="lesson-list-by-project",
    ),
    path("api/lessons/<int:lesson_id>/upload-pdf/", views.upload_pdf, name="upload-pdf"),
    path(
        "api/lessons/<int:lesson_id>/resources/",
        views.lesson_resource_list,
        name="lesson-resource-list",
    ),
    path(
        "api/lessons/<int:lesson_id>/concept-map/",
        views.lesson_concept_map,
        name="lesson-concept-map",
    ), # type: ignore
    path("api/lessons/<int:lesson_id>/analyze/", views.analyze_lesson, name="analyze_lesson"),
    path("api/lessons/<int:lesson_id>/", views.lesson_detail, name="lesson_detail"),
    path(
        "api/concept-maps/<int:concept_map_id>/",
        views.concept_map_detail,
        name="concept-map-detail",
    ),
    path(
        "api/lessons/<int:lesson_id>/key-concept/",
        views.key_concept_lesson,
        name="lesson-key-concept",
    ), # type: ignore
    path(
        "api/lessons/<int:lesson_id>/summaries/",
        views.summaries_lesson,
        name="lesson-summaries",
    ), # type: ignore
    path(
        "api/available-backgrounds/",
        views.available_background_images_view,
        name="available-backgrounds",
    ),
    path(
        "api/lessons/<int:lesson_id>/tables/",
        views.tables_for_lesson,
        name="tables_for_lesson",
    ), # type: ignore
    path("api/user/profile", fetch_user_profile, name="fetch_user_profile"),
    path("api/user/profile/update", update_user_profile, name="update_user_profile"),
    path("api/auth/", include("accounts.urls")),
    path('api/tasks/', views.task_list, name='task-list'),  # Fetch tasks for the logged-in user # type: ignore
    path('api/tasks/<int:pk>/', views.task_detail, name='task-detail'),  # Ensure task_detail is a callable view function # type: ignore
    path('api/lessons/<int:lesson_id>/timelines/', views.timeline_for_lesson, name='lesson-timelines'),  # Modify or delete a specific task for the logged-in user # type: ignore
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

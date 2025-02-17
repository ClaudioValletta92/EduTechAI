from app.views import project_list_create_view, lesson_list_by_project, upload_pdf,lesson_resource_list,lesson_concept_map,analyze_lesson
from django.contrib import admin
from django.urls import path

"""
URL configuration for edutechai project.

The `urlpatterns` list routes URLs to views. For more information please see:
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
    path("api/projects/", project_list_create_view, name="project-list-create"),
    path(
        "api/projects/<int:project_id>/lessons/",
        lesson_list_by_project,
        name="lesson-list-by-project",
    ),
    path("api/lessons/<int:lesson_id>/upload-pdf/", upload_pdf, name="upload-pdf"),
    path(
        "api/lessons/<int:lesson_id>/resources/",
        lesson_resource_list,
        name="lesson-resource-list",
    ),
    path("api/lessons/<int:lesson_id>/concept-map/", lesson_concept_map, name="lesson_concept_map"),
    path("api/lessons/<int:lesson_id>/analyze/", analyze_lesson, name="analyze_lesson"),
]

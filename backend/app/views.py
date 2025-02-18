import os
import uuid
import json
import logging

from django.conf import settings
from django.core.serializers import serialize
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_GET

from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes


from celery.result import AsyncResult

from .models import Project, Lesson, LessonResource,ConceptMap
from .serializers import ProjectSerializer, LessonSerializer
from .tasks import process_pdf_task,analyze_lesson_resources

logger = logging.getLogger(__name__)
User = get_user_model()

MEDIA_DIR = "/app/media/uploads"  # ✅ Shared directory inside the container

@csrf_exempt
def upload_pdf(request, lesson_id):
    """Handles PDF uploads and triggers async processing in Celery."""
    if request.method == "POST":
        lesson = Lesson.objects.get(pk=lesson_id)
        if lesson.analyzed:
            return Response({"error": "Cannot add resources to an analyzed lesson."}, status=400)

        title = request.POST.get("title")
        file = request.FILES.get("file")

        if not file or not title:
            return JsonResponse({"error": "Title and file are required"}, status=400)

       # Ensure the directory exists
        os.makedirs(MEDIA_DIR, exist_ok=True)

        # Save file in the shared media directory
        unique_filename = f"{uuid.uuid4().hex}_{file.name}"
        file_path = os.path.join(MEDIA_DIR, unique_filename)

        # Save the file
        with open(file_path, "wb") as f:
            for chunk in file.chunks():
                f.write(chunk)

        # Trigger Celery task
        process_pdf_task.delay(lesson.id, title, file_path)


        return JsonResponse({"message": "Processing started"}, status=202)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def project_list_create_view(request):
    if request.method == "GET":
        projects = Project.objects.all()
        data = serialize("json", projects)
        return JsonResponse(json.loads(data), safe=False)
    elif request.method == "POST":
        default_user = User.objects.get(pk=1)  # Make sure a user with pk=1 exists
        try:
            data = json.loads(request.body)
            title = data.get("title")
            description = data.get("description")
            if not title:
                return JsonResponse({"error": "Title is required"}, status=400)
            project = Project.objects.create(
                title=title, description=description, created_by=default_user
            )
            data = serialize("json", [project])
            return JsonResponse(json.loads(data)[0], status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def lesson_list_by_project(request, project_id):
    """Handle retrieving and adding lessons for a given project."""

    # Check if the project exists
    project = get_object_or_404(Project, id=project_id)

    if request.method == "GET":
        # Get all lessons related to the project
        lessons = Lesson.objects.filter(project=project)
        data = serialize("json", lessons)
        return JsonResponse(json.loads(data), safe=False)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            title = data.get("title")

            if not title:
                return JsonResponse({"error": "Title is required"}, status=400)

            # Create new lesson
            lesson = Lesson.objects.create(title=title, project=project)

            # Serialize newly created lesson
            lesson_data = serialize("json", [lesson])
            return JsonResponse(json.loads(lesson_data)[0], status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
@require_GET
def lesson_resource_list(request, lesson_id):
    """
    Retrieve all resources for a specific lesson.
    """
    lesson = get_object_or_404(Lesson, id=lesson_id)
    resources = lesson.resources.all()

    resource_data = [
        {
            "id": resource.id,
            "title": resource.title,
            "file_url": resource.file.url if resource.file else None,
            "entry_text": resource.entry_text,
            "uploaded_at": resource.uploaded_at.isoformat(),
        }
        for resource in resources
    ]

    # Create JSON response
    response = JsonResponse({"resources": resource_data})

    # Manually set CORS headers
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "*"

    return response

@csrf_exempt
@api_view(["GET", "POST"])
def lesson_concept_map(request, lesson_id):
    """Retrieve or create/update a conceptual map for a lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    if request.method == "GET":
        concept_map, created = ConceptMap.objects.get_or_create(lesson=lesson, defaults={"data": {}})
        return Response({"lesson": lesson.title, "data": concept_map.data})

    if request.method == "POST":
        data = request.data.get("data", {})
        concept_map, created = ConceptMap.objects.get_or_create(lesson=lesson)
        concept_map.data = data
        concept_map.save()
        return Response({"message": "Concept map saved"})



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_lesson(request, lesson_id):
    """Trigger AI analysis for a lesson's resources."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    # Trigger Celery task
    task = analyze_lesson_resources.delay(lesson.id)

    return Response({"message": "Analysis started", "task_id": task.id})
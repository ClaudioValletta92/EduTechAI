from django.shortcuts import render

# app/views.py
import os
from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework import status, generics  # type: ignore
from django.conf import settings
from celery.result import AsyncResult
from rest_framework.generics import RetrieveAPIView  # type: ignore
from .models import Project, Lesson, LessonResource
from .serializers import ProjectSerializer
from django.views import View
from django.core.serializers import serialize
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view  # type: ignore
from django.contrib.auth import get_user_model
from .serializers import LessonSerializer
from django.shortcuts import get_object_or_404
from .utils import (
    extract_text_from_pdf,
    basic_cleaning,
    smart_line_joining,
    extract_persons,
    extract_locations,
    extract_topics_lda,
)
from .tasks import process_pdf_task
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@csrf_exempt
def upload_pdf(request, lesson_id):
    """Handles PDF uploads, extracts text, entities, and topics."""
    if request.method == "POST":
        lesson = Lesson.objects.get(pk=lesson_id)
        title = request.POST.get("title")
        file = request.FILES.get("file")

        if not file or not title:
            return JsonResponse({"error": "Title and file are required"}, status=400)

        resource = LessonResource.objects.create(lesson=lesson, title=title, file=file)

        # Extract text and process it
        raw_text = extract_text_from_pdf(resource.file.path)
        cleaned_text = basic_cleaning(raw_text)
        formatted_text = smart_line_joining(cleaned_text)

        # Extract entities
        persons = extract_persons(formatted_text)
        locations = extract_locations(formatted_text)

        # Extract topics
        topics = extract_topics_lda(formatted_text)

        # Store extracted data in the database
        resource.entry_text = formatted_text
        resource.entities = persons
        resource.locations = locations
        resource.save()

        return JsonResponse(
            {
                "id": resource.id,
                "title": resource.title,
                "entry_text": resource.entry_text,
                "persons": resource.entities,
                "locations": resource.locations,
                "topics": topics,
            },
            status=201,
        )

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

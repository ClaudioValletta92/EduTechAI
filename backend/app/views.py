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
import time

from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes


from celery.result import AsyncResult

from .models import (
    Project,
    Lesson,
    LessonResource,
    ConceptMap,
    KeyConcepts,
    Summary,
    BackgroundImage,
)
from .serializers import ProjectSerializer, LessonSerializer
from .tasks import process_pdf_task, analyze_lesson_resources

logger = logging.getLogger(__name__)
User = get_user_model()


MEDIA_DIR = "/app/media/uploads"  # ✅ Shared directory inside the container


@csrf_exempt
def upload_pdf(request, lesson_id):
    """Handles PDF uploads and ensures the file is saved correctly."""
    if request.method == "POST":
        try:
            lesson = Lesson.objects.get(pk=lesson_id)
        except Lesson.DoesNotExist:
            return JsonResponse({"error": "Lesson not found"}, status=404)

        if lesson.analyzed:
            return JsonResponse(
                {"error": "Cannot add resources to an analyzed lesson."}, status=400
            )

        title = request.POST.get("title")
        file = request.FILES.get("file")

        if not file or not title:
            return JsonResponse({"error": "Title and file are required"}, status=400)

        # Save the file using Django’s FileField
        lesson_resource = LessonResource.objects.create(
            lesson=lesson,
            title=title,
            file=file,  # Directly assign the uploaded file
            resource_type=LessonResource.ResourceType.PDF,
        )
        lesson_resource.save()  # Ensure it's saved to the database
        lesson_resource_id = lesson_resource.id
        logger.info(f"lesson_id: {lesson.id}, lesson_resource_id: {lesson_resource_id}")
        time.sleep(2)  # Delay for 2 seconds (you can adjust this as needed)
        os.makedirs(MEDIA_DIR, exist_ok=True)

        # Save file in the shared media directory
        unique_filename = f"{uuid.uuid4().hex}_{file.name}"
        file_path = os.path.join(MEDIA_DIR, unique_filename)

        # Save the file
        with open(file_path, "wb") as f:
            for chunk in file.chunks():
                f.write(chunk)

        process_pdf_task.delay(lesson_id, lesson_resource_id, file_path)

        return JsonResponse(
            {
                "message": "PDF uploaded successfully",
                "file_url": lesson_resource.file.url,
            },
            status=201,
        )

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def project_list_create_view(request):
    if request.method == "GET":
        projects = Project.objects.all()
        project_data = []

        for project in projects:
            # Create a dictionary of the project fields
            project_info = {
                "pk": project.pk,
                "fields": {
                    "title": project.title,
                    "description": project.description,
                    "background_image": (
                        project.background_image.image.url
                        if project.background_image
                        else None
                    ),  # Add the background image URL here
                },
            }
            project_data.append(project_info)

        return JsonResponse(project_data, safe=False)

    elif request.method == "POST":
        default_user = User.objects.get(pk=1)  # Make sure a user with pk=1 exists
        try:
            data = json.loads(request.body)
            title = data.get("title")
            description = data.get("description")
            background = data.get(
                "background"
            )  # Get the background image (preset or blended)

            if not title:
                return JsonResponse({"error": "Title is required"}, status=400)

            if background:
                # Check if the background is a preset or blended image
                try:
                    background_image = BackgroundImage.objects.get(name=background)
                except BackgroundImage.DoesNotExist:
                    return JsonResponse(
                        {"error": "Selected background image does not exist"},
                        status=400,
                    )

                # If the background image exists, assign it to the project
                project = Project.objects.create(
                    title=title,
                    description=description,
                    created_by=default_user,
                    background_image=background_image,  # Assuming Project has a field to store the background image
                )
            else:
                # Create the project without a background image if none is selected
                project = Project.objects.create(
                    title=title,
                    description=description,
                    created_by=default_user,
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
@api_view(["GET"])
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
    default_user = User.objects.get(pk=1)

    if request.method == "GET":
        # Fetch or create the conceptual map
        concept_map, created = ConceptMap.objects.get_or_create(
            lesson=lesson,
            defaults={
                "title": f"Concept Map for {lesson.title}",
                "data": {},
                "user": default_user,
            },
        )

        # Return the whole concept map object
        return Response(
            {
                "id": concept_map.id,
                "title": concept_map.title,
                "lesson": lesson.title,
                "data": concept_map.data,
                "created_at": concept_map.created_at,
                "updated_at": concept_map.updated_at,
            }
        )

    if request.method == "POST":
        data = request.data.get("data", {})
        concept_map, created = ConceptMap.objects.get_or_create(lesson=lesson)
        concept_map.data = data
        concept_map.save()
        return Response({"message": "Concept map saved", "id": concept_map.id})


@csrf_exempt
@api_view(["GET"])
def key_concept_lesson(request, lesson_id):
    """Retrieve or create/update a conceptual map for a lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    default_user = User.objects.get(pk=1)
    if request.method == "GET":
        # Fetch or create the conceptual map
        concept_map, created = KeyConcepts.objects.get_or_create(
            lesson=lesson,
            defaults={
                "data": {},
                "user": default_user,
            },
        )

        # Return the whole concept map object
        return Response(
            {
                "id": concept_map.id,
                "lesson": lesson.title,
                "data": concept_map.data,
                "created_at": concept_map.created_at,
                "updated_at": concept_map.updated_at,
            }
        )


@csrf_exempt
@api_view(["POST"])
def analyze_lesson(request, lesson_id):
    """Trigger AI analysis for a lesson's resources."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    # Access JSON data from the request body
    resume_length = request.data.get("resume_length")
    conceptual_map_size = request.data.get("conceptual_map_size")
    key_concepts_count = request.data.get("key_concepts_count")

    # Trigger Celery task
    task = analyze_lesson_resources.delay(
        lesson.id,
        resume_length=resume_length,
        conceptual_map_size=conceptual_map_size,
        key_concepts_count=key_concepts_count,
    )

    return Response(
        {"message": "Analysis started", "task_id": task.id},
        status=status.HTTP_202_ACCEPTED,
    )


@csrf_exempt
@api_view(["GET"])
def concept_map_detail(request, concept_map_id):
    """Retrieve a specific conceptual map by its ID."""
    concept_map = get_object_or_404(ConceptMap, id=concept_map_id)

    return Response(
        {
            "id": concept_map.id,
            "title": concept_map.title,
            "data": concept_map.data,
            "created_at": concept_map.created_at,
            "updated_at": concept_map.updated_at,
        }
    )


@csrf_exempt
@api_view(["GET"])
def key_concept_detail(request, concept_map_id):
    """Retrieve a specific conceptual map by its ID."""
    concept_map = get_object_or_404(KeyConcepts, id=concept_map_id)

    return Response(
        {
            "id": concept_map.id,
            "data": concept_map.data,
            "created_at": concept_map.created_at,
            "updated_at": concept_map.updated_at,
        }
    )


def lesson_detail(request, lesson_id):
    try:
        lesson = Lesson.objects.get(id=lesson_id)
        return JsonResponse(
            {
                "id": lesson.id,
                "title": lesson.title,
                "description": lesson.description,
                "created_at": lesson.created_at.isoformat(),
                "analyzed": lesson.analyzed,
            }
        )
    except Lesson.DoesNotExist:
        return JsonResponse({"error": "Lesson not found"}, status=404)


@csrf_exempt
@api_view(["GET"])
def summaries_lesson(request, lesson_id):
    """Retrieve or create/update a conceptual map for a lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    if request.method == "GET":
        # Fetch or create the conceptual map
        summaries, created = Summary.objects.get_or_create(
            lesson=lesson,
            defaults={
                "title": f"Key Concepts for {lesson.title}",
                "text": "default",
            },
        )

        # Return the whole concept map object
        return Response(
            {
                "id": summaries.id,
                "title": summaries.title,
                "lesson": lesson.lesson,
                "content": summaries.content,
                "created_at": summaries.created_at,
                "updated_at": summaries.updated_at,
            }
        )


@csrf_exempt
def available_background_images_view(request):
    """Returns a list of all available background images from the database."""
    # Fetch all BackgroundImage objects
    backgrounds = BackgroundImage.objects.all()

    # Create a list of dictionaries with relevant information, including the 'type'
    background_list = [
        {
            "name": background.name,
            "image_url": background.image.url,  # Assuming images are stored in MEDIA_URL
            "description": background.description,
            "type": background.type,  # Add the type field here
        }
        for background in backgrounds
    ]

    # Return as JSON
    return JsonResponse(background_list, safe=False)

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
from .models import CauseEffect, Task

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
    Table,
    Timeline,
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
    """Retrieve the key concepts for a lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    if request.method == "GET":
        # Fetch all KeyConcepts for the lesson
        key_concepts = KeyConcepts.objects.filter(lesson=lesson)

        # If no KeyConcepts are found, return a message
        if not key_concepts.exists():
            return Response(
                {"message": "No key concepts found for this lesson."}, status=404
            )

        # Return the list of key concepts
        key_concepts_data = [
            {
                "id": key_concept.id,
                "lesson": lesson.title,
                "data": key_concept.data,
                "created_at": key_concept.created_at,
                "updated_at": key_concept.updated_at,
            }
            for key_concept in key_concepts
        ]

        return Response(key_concepts_data)


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
    """Retrieve the most recent summary for a lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    if request.method == "GET":
        # Fetch the most recent summary for the lesson, ordered by created_at
        summary = Summary.objects.filter(lesson=lesson).order_by("-created_at").first()

        # If no summary exists, return a 404 message
        if not summary:
            return Response(
                {"message": "No summaries found for this lesson."}, status=404
            )

        # Return the most recent summary
        return Response(
            {
                "id": summary.id,
                "title": summary.title,
                "lesson": lesson.title,
                "content": summary.content,
                "created_at": summary.created_at,
                "updated_at": summary.updated_at,
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


@csrf_exempt
@api_view(["GET"])
def tables_for_lesson(request, lesson_id):
    """Retrieve all tables for a lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    if request.method == "GET":
        # Fetch all tables for the lesson
        tables = Table.objects.filter(lesson=lesson)
        logger.info(f"tables: {tables}")

        # If no tables exist, return a 404 message
        if not tables.exists():
            return Response({"message": "No tables found for this lesson."}, status=404)

        # Build the response data manually
        tables_data = []
        for table in tables:
            tables_data.append(
                {
                    "id": table.id,
                    "title": table.title,
                    "data": table.data,  # Assuming `data` is a JSONField
                    "created_at": table.created_at,
                    "updated_at": table.updated_at,
                }
            )

        # Return the list of tables
        return Response(tables_data)


from django.contrib import messages


@csrf_exempt
def fetch_user_profile(request):
    messages.debug(request, "This is a debug message.")
    messages.info(request, "This is an info message.")
    messages.success(request, "This is a success message.")
    messages.warning(request, "This is a warning message.")
    messages.error(request, "This is an error message.")
    logger.debug("This is a debug message.")
    user = request.user

    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"}, status=401)

    profile_data = {
        "username": user.username,
        "age": user.age,
        "school": user.school,
        "work_duration": user.work_duration,
        "rest_duration": user.rest_duration,
        "theme": user.theme,  # Add theme to the response
    }
    return JsonResponse(profile_data)


@csrf_exempt
def update_user_profile(request):
    try:
        data = json.loads(request.body)
        user = request.user

        # Update user fields
        user.username = data.get("username", user.username)
        user.age = data.get("age", user.age)
        user.school = data.get("school", user.school)
        user.work_duration = data.get("work_duration", user.work_duration)
        user.rest_duration = data.get("rest_duration", user.rest_duration)
        user.theme = data.get("theme", user.theme)  # Update theme

        user.save()

        return JsonResponse(
            {"status": "success", "message": "Profile updated successfully!"}
        )
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)

@csrf_exempt
def task_list(request):
    if request.method == 'GET':
        # Retrieve all tasks for the logged-in user
        tasks = Task.objects.filter(user=request.user).values(
            'id', 'title', 'description', 'due_date', 'status', 'priority', 'user_id', 'project_id', 'lesson_id', 'created_at', 'updated_at'
        )
        return JsonResponse(list(tasks), safe=False)

    elif request.method == 'POST':
        # Create a new task for the logged-in user
        data = json.loads(request.body)
        title = data.get('title')
        description = data.get('description', '')
        due_date = data.get('due_date')
        status = data.get('status', 'todo')
        priority = data.get('priority', 'medium')

        task = Task.objects.create(
            title=title,
            description=description,
            due_date=due_date,
            status=status,
            priority=priority,
            user=request.user  # Associate the task with the currently logged-in user
        )

        # Return the newly created task
        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date,
            'status': task.status,
            'priority': task.priority,
            'user_id': task.user.id,
            'created_at': task.created_at,
            'updated_at': task.updated_at,
        }, status=201)
        
@csrf_exempt   
def task_detail(request, pk):
    task = get_object_or_404(Task, pk=pk)

    # Ensure the task belongs to the currently logged-in user
    if task.user != request.user:
        return JsonResponse({'error': 'You do not have permission to view or modify this task.'}, status=403)

    if request.method == 'GET':
        # Retrieve a single task
        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date,
            'status': task.status,
            'priority': task.priority,
            'user_id': task.user.id,
            'project_id': task.project.id if task.project else None,
            'lesson_id': task.lesson.id if task.lesson else None,
            'created_at': task.created_at,
            'updated_at': task.updated_at,
        })

    elif request.method == 'PUT':
        # Update an existing task
        data = json.loads(request.body)
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.due_date = data.get('due_date', task.due_date)
        task.status = data.get('status', task.status)
        task.priority = data.get('priority', task.priority)

        # If the user is changing the user field (though this is not common)
        user_id = data.get('user_id')
        if user_id:
            task.user = get_object_or_404(CustomUser, id=user_id)

        task.save()

        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date,
            'status': task.status,
            'priority': task.priority,
            'user_id': task.user.id,
            'created_at': task.created_at,
            'updated_at': task.updated_at,
        })

    elif request.method == 'DELETE':
        # Delete the task
        task.delete()
        return JsonResponse({'message': 'Task deleted successfully'}, status=204)
    
@csrf_exempt
@api_view(["GET"])
def timeline_for_lesson(request, lesson_id):
    """Retrieve the timeline for a lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    if request.method == "GET":
        # Fetch the first timeline for the lesson (assuming one per lesson)
        timeline = Timeline.objects.filter(lesson=lesson).first()

        # If no timeline exists, return a 404 message
        if not timeline:
            return Response({"message": "No timeline found for this lesson."}, status=404)

        # Build the response data manually
        timeline_data = {
            "id": timeline.id,
            "title": timeline.title,
            "data": timeline.data,  # Assuming `data` is a JSONField
            "created_at": timeline.created_at,
            "updated_at": timeline.updated_at,
        }

        return Response(timeline_data)


@csrf_exempt
@api_view(["GET"])
def cause_effect_for_lesson(request, lesson_id):
    """Retrieve all tables for a lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)

    if request.method == "GET":
        # Fetch all tables for the lesson
        causeeffects = CauseEffect.objects.filter(lesson=lesson)
        logger.info(f"cause effects: {causeeffects}")

        # If no tables exist, return a 404 message
        if not causeeffects.exists():
            return Response({"message": "No tables found for this lesson."}, status=404)

        # Build the response data manually
        causeeffects_data = []
        for causeeffect in causeeffects:
            causeeffects_data.append(
                {
                    "id": causeeffect.id,
                    "title": causeeffect.title,
                    "data": causeeffect.data,  # Assuming `data` is a JSONField
                    "created_at": causeeffect.created_at,
                    "updated_at": causeeffect.updated_at,
                }
            )

        # Return the list of tables
        return Response(causeeffects_data)
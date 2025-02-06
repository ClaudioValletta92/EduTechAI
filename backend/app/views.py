from django.shortcuts import render

# app/views.py
import os
from rest_framework.views import APIView  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework import status, generics  # type: ignore
from django.conf import settings
from celery.result import AsyncResult
from rest_framework.generics import RetrieveAPIView  # type: ignore
from .models import Project
from .serializers import ProjectSerializer
from django.views import View
from django.core.serializers import serialize
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view  # type: ignore
from django.contrib.auth import get_user_model

from .tasks import process_pdf_task
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class PDFUploadView(APIView):
    def post(self, request):
        logger.debug("Entered PDFUploadView.post() method")
        pdf_file = request.FILES.get("pdf")
        logger.debug(f"pdf_file: {pdf_file}")

        if not pdf_file:
            return Response(
                {"error": "No PDF uploaded"}, status=status.HTTP_400_BAD_REQUEST
            )
        # 1) Save the uploaded PDF to MEDIA_ROOT
        save_path = os.path.join(settings.MEDIA_ROOT, pdf_file.name)
        with open(save_path, "wb+") as destination:
            for chunk in pdf_file.chunks():
                destination.write(chunk)

        # 2) Queue the Celery task
        task = process_pdf_task.delay(save_path)

        # 3) Return the Celery task ID so the frontend can track progress
        return Response({"task_id": task.id}, status=status.HTTP_200_OK)


class TaskStatusView(RetrieveAPIView):
    def get(self, request, task_id):
        async_result = AsyncResult(task_id)
        if async_result.state == "PENDING":
            return Response({"status": "PENDING"})
        elif async_result.state == "SUCCESS":
            return Response({"status": "SUCCESS", "result": async_result.result})
        elif async_result.state == "FAILURE":
            return Response(
                {"status": "FAILURE", "error": str(async_result.result)}
            )  # ...


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

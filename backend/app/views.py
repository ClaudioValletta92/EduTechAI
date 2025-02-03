from django.shortcuts import render
# app/views.py
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from celery.result import AsyncResult
from rest_framework.generics import RetrieveAPIView

from .tasks import process_pdf_task
import logging
logger = logging.getLogger(__name__)

class PDFUploadView(APIView):
    def post(self, request):
        logger.debug("Entered PDFUploadView.post() method")
        pdf_file = request.FILES.get('pdf')
        logger.debug(f"pdf_file: {pdf_file}")

        if not pdf_file:
            return Response({"error": "No PDF uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        print("oooo")
        # 1) Save the uploaded PDF to MEDIA_ROOT
        save_path = os.path.join(settings.MEDIA_ROOT, pdf_file.name)
        with open(save_path, 'wb+') as destination:
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
            return Response({"status": "FAILURE", "error": str(async_result.result)})        # ...
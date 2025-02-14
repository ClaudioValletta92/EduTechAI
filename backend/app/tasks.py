import os
import logging
import time
from celery import shared_task
from .models import LessonResource
from .utils import extract_text_from_pdf, basic_cleaning, smart_line_joining, extract_persons, extract_locations, extract_topics_lda

logger = logging.getLogger(__name__)

import os
import logging
from celery import shared_task
from .models import Lesson
from .utils import extract_text_from_pdf

logger = logging.getLogger(__name__)
@shared_task(bind=True, max_retries=3)
def process_pdf_task(self, lesson_id, title, file_path):  # ✅ Add `self` here
    """Processes the PDF and prints extracted text for debugging."""
    try:
        lesson = Lesson.objects.get(pk=lesson_id)

        # Extract text from PDF
        with open(file_path, "rb") as pdf_file:
            raw_text = extract_text_from_pdf(pdf_file)

        # DEBUG: Log extracted text
        logger.info(f"DEBUG: Extracted text from {file_path} -> {raw_text[:500]}...")  # Print first 500 characters

        return {"status": "success", "message": "Text extracted successfully"}

    except Lesson.DoesNotExist:
        logger.error(f"Lesson with ID {lesson_id} not found")
        return {"status": "error", "message": "Lesson not found"}
    except Exception as e:
        logger.exception(f"Unexpected error in process_pdf_task: {e}")
        return {"status": "error", "message": str(e)}

        
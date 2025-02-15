import os
import logging
import time
from celery import shared_task
from .models import LessonResource,Lesson
from .utils import extract_text_from_pdf, basic_cleaning, smart_line_joining, extract_persons_by_frequency, extract_locations,extract_topics_lda
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from django.db import transaction, connection
logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_pdf_task(self, lesson_id, title, file_path):
    """Processes the PDF, extracts metadata, and saves it as a LessonResource."""
    try:
        lesson = Lesson.objects.get(pk=lesson_id)

        with open(file_path, "rb") as pdf_file:
            raw_text = extract_text_from_pdf(pdf_file)
            full_text_cleaned = basic_cleaning(raw_text)
            full_text_further_processed = smart_line_joining(full_text_cleaned)
            extracted_persons = extract_persons_by_frequency(full_text_further_processed)
            extracted_locations = extract_locations(full_text_further_processed)
            extracted_topics = extract_topics_lda(full_text_further_processed)

        # 🔥 Force a commit
        with transaction.atomic():
            lesson_resource = LessonResource.objects.create(
                lesson=lesson,
                title=title,
                file=file_path,
                entry_text=full_text_further_processed,
                entities=extracted_persons,
                locations=extracted_locations,
                topics=extracted_topics,
                resource_type=LessonResource.ResourceType.PDF
            )
            transaction.on_commit(lambda: logger.info(f"✅ LessonResource {lesson_resource.id} successfully written to DB!"))

        # 🔍 Debugging: Check if the row exists in DB right after commit
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM app_lessonresource WHERE id = %s", [lesson_resource.id])
            count = cursor.fetchone()[0]
            logger.info(f"🔎 Post-commit check: LessonResource {lesson_resource.id} exists in DB: {count > 0}")

        return {"status": "success", "message": "Text extracted and resource created successfully"}

    except Lesson.DoesNotExist:
        logger.error(f"❌ Lesson with ID {lesson_id} not found")
        return {"status": "error", "message": "Lesson not found"}
    except Exception as e:
        logger.exception(f"🔥 Unexpected error in process_pdf_task: {e}")
        return {"status": "error", "message": str(e)}

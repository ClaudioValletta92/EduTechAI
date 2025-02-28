import logging
from celery import shared_task
from .models import LessonResource, Lesson, MonthlyAPIUsage, ConceptMap
from .utils import (
    extract_text_from_pdf,
    basic_cleaning,
    smart_line_joining,
    extract_persons_by_frequency,
    extract_locations,
    extract_topics_lda,
)
from .aifunctions import generate_response_from_google
from django.db import transaction
from django.utils.timezone import now
from django.db.models import F
from django.contrib.auth import get_user_model
import time
from django.core.files.base import ContentFile
from django.conf import settings
import os
import shutil
from django.core.files.storage import FileSystemStorage

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_pdf_task(self, lesson_id, lesson_resource_id, file_path):
    print("lesson_id", lesson_id)
    print("lesson_resource_id", lesson_resource_id)
    """Processes the PDF, extracts metadata, classifies the subject, and tracks API costs."""
    try:
        lesson = Lesson.objects.get(pk=lesson_id)

        # Retrieve the existing LessonResource by ID
        lesson_resource = LessonResource.objects.get(id=lesson_resource_id)

        # Start processing the PDF
        with open(file_path, "rb") as pdf_file:
            raw_text = extract_text_from_pdf(pdf_file)
            full_text_cleaned = basic_cleaning(raw_text)
            full_text_further_processed = smart_line_joining(full_text_cleaned)

            # Extract metadata
            extracted_persons = extract_persons_by_frequency(
                full_text_further_processed
            )[:5]
            extracted_locations = extract_locations(full_text_further_processed)[:5]
            extracted_topics = extract_topics_lda(full_text_further_processed)
            prompt = (
                "Classifica l'argomento principale del testo tra le seguenti opzioni: "
                "Storia, Scienza, Matematica, Filosofia, Letteratura, Geografia, Arte, Economia, Informatica, Altro.\n\n"
                "Ecco le informazioni chiave estratte:\n"
                f"- **Persone citate**: {', '.join([p[0] for p in extracted_persons]) if extracted_persons else 'Nessuna'}\n"
                f"- **Luoghi menzionati**: {', '.join([l[0] for l in extracted_locations]) if extracted_locations else 'Nessuno'}\n"
                f"- **Temi principali**: {', '.join(extracted_topics) if extracted_topics else 'Non identificati'}\n\n"
                "Rispondi solo con il nome della categoria in italiano, senza testo aggiuntivo."
            )
            # Call Google Gemini API
            response_data = generate_response_from_google(prompt)
            subject = (
                response_data["text"].strip() if response_data["text"] else "Altro"
            )
            input_tokens = response_data.get("input_tokens", 0)
            output_tokens = response_data.get("output_tokens", 0)

            logger.info(
                f"📊 Token usage - Input: {input_tokens}, Output: {output_tokens}"
            )

        # 🔥 Aggregate Monthly API Usage
        current_month = now().month
        current_year = now().year

        # Update existing record OR create a new one if it doesn't exist
        monthly_usage, created = MonthlyAPIUsage.objects.get_or_create(
            user=lesson.user,  # Assuming you want to track API usage by the user of the lesson
            service="gemini",
            month=current_month,
            year=current_year,
            defaults={
                "total_input_tokens": 0,
                "total_output_tokens": 0,
                "total_characters_processed": 0,
            },
        )

        # Update token counts atomically
        MonthlyAPIUsage.objects.filter(id=monthly_usage.id).update(
            total_input_tokens=F("total_input_tokens") + input_tokens,
            total_output_tokens=F("total_output_tokens") + output_tokens,
        )

        logger.info(
            f"✅ Updated monthly usage for {lesson.user.username} - {current_month}/{current_year}"
        )

        # 🔥 Update the existing LessonResource
        with transaction.atomic():
            lesson_resource.entry_text = full_text_further_processed
            lesson_resource.subject = subject
            lesson_resource.save()

        logger.info(
            f"✅ Successfully updated LessonResource with ID {lesson_resource_id} for lesson {lesson_id}"
        )

        return {
            "status": "success",
            "message": f"Text extracted and classified as {subject}",
        }

    except Lesson.DoesNotExist:
        logger.error(f"❌ Lesson with ID {lesson_id} not found")
        return {"status": "error", "message": "Lesson not found"}
    except LessonResource.DoesNotExist:
        logger.error(f"❌ LessonResource with ID {lesson_resource_id} not found")
        return {
            "status": "error",
            "message": f"LessonResource with ID {lesson_resource_id} not found",
        }
    except Exception as e:
        logger.exception(f"🔥 Unexpected error in process_pdf_task: {e}")
        return {"status": "error", "message": str(e)}


@shared_task
def analyze_lesson_resources(lesson_id):
    """AI function to analyze lesson resources and generate a conceptual map."""
    lesson = Lesson.objects.get(id=lesson_id)
    User = get_user_model()  # Get the active user model dynamically
    user = User.objects.get(pk=1)
    # Simulated AI processing (Replace with actual AI function)
    time.sleep(5)

    # Example AI-generated concept map (Replace with real AI output)
    generated_map = {
        "nodes": [
            {
                "id": "1",
                "label": "Main Topic",
                "description": "Core idea",
                "x_position": 100,
                "y_position": 100,
            },
            {
                "id": "2",
                "label": "Subtopic A",
                "description": "Related concept",
                "x_position": 300,
                "y_position": 200,
            },
        ],
        "edges": [{"id": "e1-2", "source": "1", "target": "2"}],
    }

    # Save or update the conceptual map
    concept_map, created = ConceptMap.objects.get_or_create(
        lesson=lesson, data=generated_map, user=user
    )
    concept_map.save()

    # Mark lesson as analyzed
    lesson.analyzed = True
    lesson.save()

    return f"Concept map for Lesson {lesson_id} updated!"

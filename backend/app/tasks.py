import logging
from celery import shared_task
from .models import LessonResource,Lesson,MonthlyAPIUsage
from .utils import extract_text_from_pdf, basic_cleaning, smart_line_joining, extract_persons_by_frequency, extract_locations,extract_topics_lda
from .aifunctions import generate_response_from_google
from django.db import transaction
from django.utils.timezone import now
from django.db.models import F
from django.contrib.auth import get_user_model



logger = logging.getLogger(__name__)
@shared_task(bind=True, max_retries=3)
def process_pdf_task(self, lesson_id, title, file_path):
    """Processes the PDF, extracts metadata, classifies the subject, and tracks API costs."""
    try:
        lesson = Lesson.objects.get(pk=lesson_id)
        User = get_user_model()  # Get the active user model dynamically
        user = User.objects.get(pk=1)

        with open(file_path, "rb") as pdf_file:
            raw_text = extract_text_from_pdf(pdf_file)
            full_text_cleaned = basic_cleaning(raw_text)
            full_text_further_processed = smart_line_joining(full_text_cleaned)

            # Extract metadata
            extracted_persons = extract_persons_by_frequency(full_text_further_processed)[:5]
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
            #Call Google Gemini API
            response_data = generate_response_from_google(prompt)
            subject = response_data["text"].strip() if response_data["text"] else "Altro"
            input_tokens = response_data.get("input_tokens", 0)
            output_tokens = response_data.get("output_tokens", 0)

            logger.info(f"📊 Token usage - Input: {input_tokens}, Output: {output_tokens}")

        # 🔥 Aggregate Monthly API Usage
        current_month = now().month
        current_year = now().year

        # Update existing record OR create a new one if it doesn't exist
        monthly_usage, created = MonthlyAPIUsage.objects.get_or_create(
            user=user,
            service="gemini",
            month=current_month,
            year=current_year,
            defaults={
                "total_input_tokens": 0,
                "total_output_tokens": 0,
                "total_characters_processed": 0,
            }
        )

        # Update token counts atomically
        MonthlyAPIUsage.objects.filter(id=monthly_usage.id).update(
            total_input_tokens=F("total_input_tokens") + input_tokens,
            total_output_tokens=F("total_output_tokens") + output_tokens,
        )

        logger.info(f"✅ Updated monthly usage for {user.username} - {current_month}/{current_year}")

        # 🔥 Save LessonResource to DB
        with transaction.atomic():
            lesson_resource = LessonResource.objects.create(
                lesson=lesson,
                title=title,
                file=file_path,
                entry_text=full_text_further_processed,
                subject=subject,
                resource_type=LessonResource.ResourceType.PDF
            )

        return {"status": "success", "message": f"Text extracted and classified as {subject}"}

    except Lesson.DoesNotExist:
        logger.error(f"❌ Lesson with ID {lesson_id} not found")
        return {"status": "error", "message": "Lesson not found"}
    except Exception as e:
        logger.exception(f"🔥 Unexpected error in process_pdf_task: {e}")
        return {"status": "error", "message": str(e)}

import logging
from celery import shared_task
from .models import (
    LessonResource,
    Lesson,
    MonthlyAPIUsage,
    ConceptMap,
    Summary,
    KeyConcepts,
    Table,
)
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
import json
import re

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
        # current_month = now().month
        # current_year = now().year

        # Update existing record OR create a new one if it doesn't exist
        # monthly_usage, created = MonthlyAPIUsage.objects.get_or_create(
        #    service="gemini",
        #    month=current_month,
        #    year=current_year,
        #    defaults={
        #        "total_input_tokens": 0,
        #        "total_output_tokens": 0,
        #       "total_characters_processed": 0,
        #    },
        # )

        # Update token counts atomically
        # TBF
        # MonthlyAPIUsage.objects.filter(id=1).update(
        #    total_input_tokens=F("total_input_tokens") + input_tokens,
        #    total_output_tokens=F("total_output_tokens") + output_tokens,
        # )

        # 🔥 Update the existing LessonResource
        with transaction.atomic():
            lesson_resource.entry_text = full_text_further_processed
            lesson_resource.subject = subject
            lesson_resource.save()

        logger.info(
            f"✅ Successfully updated LessonResource with ID {lesson_resource_id} for lesson {lesson_id}"
        )
        if os.path.exists(file_path):  # Check if the file exists
            os.remove(file_path)  # Delete the file
            print(f"Deleted file: {file_path}")
        else:
            print(f"File not found: {file_path}")
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
def analyze_lesson_resources(
    lesson_id, resume_length, conceptual_map_size, key_concepts_count
):
    """AI function to analyze lesson resources and generate a summary and key concepts."""
    try:
        # Retrieve the lesson
        lesson = Lesson.objects.get(id=lesson_id)

        # Retrieve all resources for the lesson
        resources = LessonResource.objects.filter(lesson=lesson)

        # Combine all `entry_text` fields into a single large text
        combined_text = " ".join(
            resource.entry_text for resource in resources if resource.entry_text
        )

            # Prepare the prompt for the Google Gemini API
        prompt = (
            f"Genera un riassunto dettagliato del seguente testo suddiviso in vari paragrafi. "
            "Ogni paragrafo deve avere:\n"
            "- Un ID numerico progressivo\n"
            "- Un titolo breve e descrittivo\n"
            "- Un riassunto \n\n"
            f"Inoltre, identifica circa {key_concepts_count} concetti chiave del testo. Per ogni concetto, fornisci:\n"
            "- Un titolo breve e descrittivo\n"
            "- Una descrizione dettagliata\n"
            "- Un livello di importanza da 1 a 5\n"
            "- Sinonimi rilevanti\n"
            "- Errori comuni o idee sbagliate associate al concetto\n\n"
            "Inoltre, genera una o più tabelle in formato JSON. Ogni tabella deve avere:\n"
            "- Un titolo breve\n"
            "- Dati della tabella in formato JSON (array di oggetti con colonne come 'id', 'prodotto', 'prezzo', ecc.)\n\n"
            "Restituisci la risposta in formato JSON con la seguente struttura:\n"
            "{\n"
            '  "summary": [\n'
            "    {\n"
            '      "id": 1,\n'
            '      "title": "Titolo del paragrafo",\n'
            '      "summary": "Riassunto del paragrafo"\n'
            "    }\n"
            "  ],\n"
            '  "key_concepts": [\n'
            "    {\n"
            '      "id": 1,\n'
            '      "title": "Titolo del concetto",\n'
            '      "description": "Descrizione del concetto",\n'
            '      "importance": 5,\n'
            '      "synonyms": ["Sinonimo 1", "Sinonimo 2"],\n'
            '      "misconceptions": ["Errore comune 1", "Errore comune 2"]\n'
            "    }\n"
            "  ],\n"
            '  "tables": [\n'
            "    {\n"
            '      "title": "Tabella Prodotti",\n'
            '      "data": [\n'
            "        {\"id\": 201, \"prezzo\": 1200, \"prodotto\": \"Laptop\", \"disponibile\": \"Sì\"},\n"
            "        {\"id\": 202, \"prezzo\": 800, \"prodotto\": \"Smartphone\", \"disponibile\": \"No\"}\n"
            "      ]\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            f"Testo:\n{combined_text}"
        )


    # Call Google Gemini API to generate the summary and key concepts
        response_data = generate_response_from_google(prompt)

        print("Raw response:", response_data)

        # Clean the JSON response
        cleaned_json = clean_json_response(response_data["text"])
        print("Cleaned JSON:", cleaned_json)

        # Parse the cleaned JSON
        response_json = json.loads(cleaned_json)
        print("Parsed JSON:", response_json)

        # Extract the summary and key concepts
        summary_text = response_json.get("summary", "Nessun riassunto generato.")
        key_concepts_data = response_json.get("key_concepts", [])
        tables_data = response_json.get("tables", [])

        # Save the summary
        User = get_user_model()  # Get the active user model dynamically
        user = User.objects.get(pk=1)  # TBD - Replace with actual user
        summary, created = Summary.objects.get_or_create(
            lesson=lesson,
            defaults={
                "user": user,
                "title": f"Summary for Lesson {lesson_id}",
                "content": summary_text,  # Store the generated summary
            },
        )
        summary.save()

        # Save the key concepts
        for concept_data in key_concepts_data:
            KeyConcepts.objects.create(
                user=user,
                lesson=lesson,
                data=concept_data,
            )
        # Save the tables
        for table_data in tables_data:
            Table.objects.create(
                user=user,
                title=table_data.get("title", "Untitled Table"),  # Handle cases where title might be missing
                data=table_data.get("data", []),  # Default to empty list if no data is provided
                lesson=lesson,
            )
        # Mark lesson as analyzed
        lesson.analyzed = True
        lesson.save()

        return f"Summary and key concepts for Lesson {lesson_id} created successfully."

    except Exception as e:
        return f"Error: {e}"


def clean_json_response(text):
    """
    Extracts JSON from a Markdown code block (```json ... ```).
    If no Markdown code block is found, returns the original text.
    """
    # Use regex to extract the JSON part from the Markdown code block
    match = re.search(r"```json\s*({.*})\s*```", text, re.DOTALL)
    if match:
        try:
            # Return the JSON part and strip any extra whitespace
            return match.group(1).strip()
        except (IndexError, AttributeError):
            # If the regex match is invalid, fallback to the original text
            return text
    return text  # Fallback: return the original text if no Markdown is found

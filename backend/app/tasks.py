# app/tasks.py
from celery import shared_task
import time
from pypdf import PdfReader 

@shared_task
def process_pdf_task(pdf_path):
    """
    Extracts text from a PDF using pypdf, returns the extracted text as a string.
    """
    try:
        reader = PdfReader(pdf_path)
        pages_text = []
        for page in reader.pages:
            text = page.extract_text() or ""
            pages_text.append(text)

        # Combine all pages into one big string (or handle as you like)
        full_text = "\n".join(pages_text)
        print(full_text)
        # You could store the text in a database or process it further here
        # e.g. Summarize, parse for keywords, etc.
        print(full_text)
        return {"status": "success", "text": full_text}
    
    except Exception as e:
        # Handle any parsing errors
        return {"status": "error", "message": str(e)}

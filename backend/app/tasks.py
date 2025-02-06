# app/tasks.py
from celery import shared_task
import time
from pypdf import PdfReader 
import re
import string
import unicodedata
#import spacy 

#nlp = spacy.load("it_core_news_sm")  # Scegli il modello giusto per la tua lingua

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
        
        # You could store the text in a database or process it further here
        # e.g. Summarize, parse for keywords, etc.
        full_text_cleaned = basic_cleaning(full_text)
        full_text_further_processed = smart_line_joining(full_text_cleaned)
                # 3) Applica la pipeline spaCy
        #doc = nlp(full_text_further_processed)

        # Ad esempio, suddividi in frasi
        sentences = list(doc.sents)
        # In debug, puoi stampare le frasi o i token
        print("---- TESTO PULITO ----")
        print(full_text_further_processed)
        print("---- FRASI ----")
        for i, sent in enumerate(sentences, 1):
            print(f"Frase {i}: {sent.text}")
        print(full_text_further_processed)
        return {"status": "success", "text": full_text}
    
    except Exception as e:
        # Handle any parsing errors
        return {"status": "error", "message": str(e)}
    
def remove_control_chars(text: str) -> str:
    # Rimuoviamo i caratteri di controllo (categoria Unicode "C")
    # come \x00, \x0c, \x1f, ecc., ma lasciamo i caratteri accentati.
    clean_text = []
    for ch in text:
        if unicodedata.category(ch).startswith('C'):
            # 'C' = Other (control, format, surrogate...)
            # Saltiamo questi caratteri
            continue
        clean_text.append(ch)
    return "".join(clean_text)

def basic_cleaning(text: str) -> str:
    # 1) Rimuove prefissi di log
    text = re.sub(r'^celery_worker-\d+\s*\|\s*', '', text, flags=re.MULTILINE)

    # 2) Spezza in righe, rimuove vuote
    lines = text.splitlines()
    lines = [line.strip() for line in lines if line.strip()]

    # 3) Unisci in un'unica stringa
    text = " ".join(lines)

    # 4) Rimuovi caratteri di controllo
    text = remove_control_chars(text)

    # 5) Sostituisce spazi multipli
    text = re.sub(r"\s+", " ", text)

    # 6) Trim finale
    text = text.strip()

    return text

def smart_line_joining(text: str) -> str:
    # 1) Spezza per righe e rimuove spazi inutili
    lines = text.splitlines()
    lines = [line.strip() for line in lines if line.strip()]  # Rimuove linee vuote

    # 2) Creiamo una lista dove accumuleremo le righe "pulite"
    cleaned = []
    for i, line in enumerate(lines):
        # Se non è l'ultima riga, guardiamo la successiva
        if i < len(lines) - 1:
            next_line = lines[i+1]
            # Verifichiamo se la riga corrente finisce con punteggiatura
            # e la successiva inizia con minuscola
            if (not re.search(r"[.!?;:]$", line)
                and len(next_line) > 0
                and next_line[0].islower()):
                # Uniamo con uno spazio (senza creare newline)
                cleaned.append(line + " ")
            else:
                # Mettiamo un newline
                cleaned.append(line + "\n")
        else:
            # Ultima riga, la aggiungiamo e basta
            cleaned.append(line)

    # 3) Ricombiniamo il tutto in un'unica stringa
    #    Se vuoi lasciare i newline, puoi semplicemente fare:
    joined_text = "".join(cleaned)
    #    Se invece vuoi un unico blocco, puoi sostituire ogni newline con uno spazio
    # joined_text = re.sub(r"\n+", " ", "".join(cleaned))

    # 4) Pulizia finale di eventuali spazi doppi
    joined_text = re.sub(r"\s+", " ", joined_text).strip()

    return joined_text
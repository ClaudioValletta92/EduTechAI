import os
import re
import unicodedata
import spacy
import gensim
import heapq
import nltk
from nltk.corpus import stopwords
from gensim import corpora
from collections import Counter
from PyPDF2 import PdfReader

# Load spaCy Italian NLP model
nlp = spacy.load("it_core_news_sm")

# Ensure stopwords are downloaded
nltk.download("stopwords")
stop_words = set(stopwords.words("italian"))


### --- TEXT EXTRACTION FUNCTIONS --- ###


def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    try:
        reader = PdfReader(pdf_path)
        pages_text = [page.extract_text() or "" for page in reader.pages]
        full_text = "\n".join(pages_text)
        return full_text
    except Exception as e:
        return f"Error extracting text: {str(e)}"


def basic_cleaning(text):
    """
    Cleans the extracted text by:
    - Removing corrupt Unicode characters (�, ����, etc.)
    - Removing special symbols like ●
    - Removing control characters
    - Normalizing spaces
    """
    # Replace corrupt Unicode characters (often shown as "�" or similar)
    text = text.replace("\ufffd", "")  # Remove replacement character (�)

    # Remove unwanted special characters like ●, long dashes, etc.
    text = re.sub(r"[●�]+", "", text)

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Remove hidden control characters
    text = remove_control_chars(text)

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
            next_line = lines[i + 1]
            # Verifichiamo se la riga corrente finisce con punteggiatura
            # e la successiva inizia con minuscola
            if (
                not re.search(r"[.!?;:]$", line)
                and len(next_line) > 0
                and next_line[0].islower()
            ):
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


def remove_control_chars(text):
    """
    Removes control characters (Unicode category 'C') that cause encoding issues.
    """
    return "".join(ch for ch in text if unicodedata.category(ch)[0] != "C")




def extract_persons_by_frequency(text):
    """
    Extracts persons and sorts them by frequency of appearance, merging similar names.
    """
    doc = nlp(text)
    person_counter = Counter()

    for ent in doc.ents:
        if ent.label_ == "PER":  # If it's a person
            cleaned_name = clean_name(ent.text)  # Apply cleaning
            if cleaned_name:
                person_counter[cleaned_name] += 1

    # Merge similar names
    merged_persons = merge_similar_names(person_counter)

    # Sort by most mentioned first
    sorted_persons = sorted(merged_persons.items(), key=lambda x: x[1], reverse=True)

    return sorted_persons


def clean_name(name):
    """
    Cleans a person's name:
    - Removes unwanted special characters (e.g., ●, *, etc.)
    - Strips extra spaces
    - Ensures the name starts with a capital letter
    - Removes names that are only one letter
    """
    name = re.sub(r"[^\w\sàèéìòùç]", "", name).strip()

    # Ensure the name starts with a capital letter and is not a single letter
    if name and name[0].isupper() and len(name) > 1:
        return name
    return None  # Ignore invalid names


def clean_location(name):
    """
    Cleans a location name:
    - Removes unwanted special characters (e.g., ●, *, etc.)
    - Strips extra spaces
    - Ensures the name starts with a capital letter
    - Removes locations that are only one letter
    """
    name = re.sub(r"[^\w\sàèéìòùç]", "", name).strip()

    # Ensure the name starts with a capital letter and is not a single letter
    if name and name[0].isupper() and len(name) > 1:
        return name
    return None  # Ignore invalid locations


def extract_locations(text):
    """
    Extracts locations from text and sorts them by frequency of appearance.
    """
    doc = nlp(text)
    location_counter = Counter()

    for ent in doc.ents:
        if ent.label_ in ["LOC", "GPE"]:  # LOC = geographic place, GPE = city/country
            cleaned_location = clean_location(ent.text)  # Apply cleaning
            if cleaned_location:
                location_counter[cleaned_location] += 1

    # Sort by most mentioned first
    sorted_locations = sorted(
        location_counter.items(), key=lambda x: x[1], reverse=True
    )

    return sorted_locations  # Returns list of tuples (location, count)




def merge_similar_names(person_counts):
    """
    Merges similar names by grouping shorter names into longer ones.
    - Example: ('Augusto', 15) and ('Ottaviano Augusto', 3) → ('Ottaviano Augusto', 18)
    """
    sorted_names = sorted(person_counts.items(), key=lambda x: len(x[0]), reverse=True)
    merged_counts = {}

    for longer_name, count in sorted_names:
        merged = False

        for existing_name in list(merged_counts.keys()):
            if longer_name in existing_name or existing_name in longer_name:
                # If one name is part of another, merge the counts into the longer name
                merged_counts[existing_name] += count
                merged = True
                break

        if not merged:
            merged_counts[longer_name] = count

    return merged_counts

def extract_topics_lda(text, num_topics=1, num_words=6):
    """
    Uses LDA to extract topics from the text.
    - Returns top N topics with top words per topic.
    """
    # Preprocess the text
    tokens = preprocess_text(text)

    # Create dictionary and corpus for LDA
    dictionary = corpora.Dictionary([tokens])
    corpus = [dictionary.doc2bow(tokens)]  # Bag of Words format

    # Train the LDA model with better hyperparameters
    lda_model = gensim.models.LdaModel(
        corpus,
        num_topics=num_topics,
        id2word=dictionary,
        passes=15,  # More passes for better learning
        alpha="auto",  # Auto-adjust topic distribution
        eta="auto",  # Auto-adjust word distribution
    )

    # Extract topics
    topics = []
    for topic_id, words in lda_model.print_topics(num_words=num_words):
        topics.append(words)

    return topics


def preprocess_text(text):
    """
    Preprocesses the text for LDA topic modeling:
    - Removes stopwords and unimportant words
    - Keeps only meaningful nouns & proper nouns
    - Removes overly frequent terms like 'città' or 'd.c.'
    """
    doc = nlp(text.lower())  # Convert to lowercase

    # Common words that are not stopwords but still too generic for topics
    additional_stopwords = {"città", "secolo", "d.c", "a.c", "storia", "anni", "regno"}

    tokens = [
        token.lemma_  # Use lemma (root form)
        for token in doc
        if token.pos_ in ["NOUN", "PROPN"]  # Keep only nouns & proper nouns
        and token.text not in stop_words  # Remove generic stopwords
        and token.text
        not in additional_stopwords  # Remove domain-specific frequent words
        and len(token.text) > 2  # Ensure word has meaningful length
    ]

    return tokens

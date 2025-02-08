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


def remove_control_chars(text):
    """Removes control characters that may cause encoding issues."""
    return "".join(ch for ch in text if unicodedata.category(ch)[0] != "C")


def basic_cleaning(text):
    """Cleans extracted text from unwanted symbols and normalizes spaces."""
    text = text.replace("\ufffd", "")  # Remove unknown Unicode chars
    text = re.sub(r"[●�]+", "", text)  # Remove special symbols
    text = re.sub(r"\s+", " ", text).strip()  # Normalize spaces
    text = remove_control_chars(text)
    return text


def smart_line_joining(text):
    """Joins broken lines intelligently based on punctuation and sentence structure."""
    lines = text.splitlines()
    lines = [line.strip() for line in lines if line.strip()]

    cleaned = []
    for i, line in enumerate(lines):
        if i < len(lines) - 1:
            next_line = lines[i + 1]
            if (
                not re.search(r"[.!?;:]$", line)
                and len(next_line) > 0
                and next_line[0].islower()
            ):
                cleaned.append(line + " ")
            else:
                cleaned.append(line + "\n")
        else:
            cleaned.append(line)

    joined_text = "".join(cleaned)
    joined_text = re.sub(r"\s+", " ", joined_text).strip()
    return joined_text


### --- ENTITY EXTRACTION FUNCTIONS --- ###


def extract_persons(text):
    """Extracts named entities categorized as PERSON."""
    doc = nlp(text)
    persons = {ent.text for ent in doc.ents if ent.label_ == "PER"}
    return list(persons)


def extract_locations(text):
    """Extracts named entities categorized as LOC (geographic place) or GPE (city/country)."""
    doc = nlp(text)
    locations = {ent.text for ent in doc.ents if ent.label_ in ["LOC", "GPE"]}
    return list(locations)


### --- TOPIC MODELING FUNCTIONS (LDA) --- ###


def preprocess_text(text):
    """Prepares text for topic modeling by keeping only nouns & proper nouns."""
    doc = nlp(text.lower())

    additional_stopwords = {"città", "secolo", "d.c", "a.c", "storia", "anni", "regno"}

    tokens = [
        token.lemma_
        for token in doc
        if token.pos_ in ["NOUN", "PROPN"]
        and token.text not in stop_words
        and token.text not in additional_stopwords
        and len(token.text) > 2
    ]

    return tokens


def extract_topics_lda(text, num_topics=1, num_words=6):
    """Extracts topics using LDA."""
    tokens = preprocess_text(text)

    dictionary = corpora.Dictionary([tokens])
    corpus = [dictionary.doc2bow(tokens)]

    lda_model = gensim.models.LdaModel(
        corpus,
        num_topics=num_topics,
        id2word=dictionary,
        passes=15,
        alpha="auto",
        eta="auto",
    )

    topics = [words for _, words in lda_model.print_topics(num_words=num_words)]
    return topics

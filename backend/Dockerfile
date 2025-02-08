FROM python:3.11

# Se devi installare librerie di sistema (opzionale, a seconda delle dipendenze),
# puoi usare ad esempio:
# RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*
# 1. Installa i pacchetti di sistema necessari per compilare da sorgente
RUN apt-get update && apt-get install -y build-essential python3-dev && rm -rf /var/lib/apt/lists/*

ENV BLIS_ARCH="generic"
ENV BLIS_PLATFORM="linux-generic"

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel

RUN pip install -r requirements.txt


# Scarichiamo il modello SpaCy (es. per l'italiano)
RUN python -m spacy download it_core_news_sm

# Copiamo il resto del tuo progetto
COPY . .

# Eseguiamo Gunicorn sulla WSGI di Django (o su qualunque app wsgi)
CMD ["gunicorn", "-b", "0.0.0.0:8000", "edutechai.wsgi:application"]

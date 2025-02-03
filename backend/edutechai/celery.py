import os
from celery import Celery

# Impostiamo la configurazione di Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edutechai.settings")

app = Celery("edutechai")

# Carica la configurazione da settings.py
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover dei task nelle app registrate
app.autodiscover_tasks()

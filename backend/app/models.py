from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.conf import settings

class CustomUser(AbstractUser):
    age = models.PositiveIntegerField(
        null=True, blank=True, help_text="Età dell'utente"
    )

    SCHOOL_CHOICES = [
        ("MEDIE", "Scuola Media"),
        ("SUPERIORI_1", "Scuola Superiore - 1° Anno"),
        ("SUPERIORI_2", "Scuola Superiore - 2° Anno"),
        ("SUPERIORI_3", "Scuola Superiore - 3° Anno"),
        ("SUPERIORI_4", "Scuola Superiore - 4° Anno"),
        ("SUPERIORI_5", "Scuola Superiore - 5° Anno"),
        ("UNIVERSITA", "Università"),
    ]

    school = models.CharField(
        max_length=20,
        choices=SCHOOL_CHOICES,
        null=True,
        blank=True,
        help_text="Seleziona il tipo di scuola frequentata dall'utente",
    )

    # Sovrascriviamo il campo groups con un related_name personalizzato
    groups = models.ManyToManyField(
        Group,
        related_name="custom_users",  # Un related_name univoco
        blank=True,
        help_text="I gruppi a cui l'utente appartiene",
        verbose_name="groups",
    )

    # Sovrascriviamo anche il campo user_permissions
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_users_permissions",  # Un related_name univoco
        blank=True,
        help_text="Permessi specifici per questo utente",
        verbose_name="user permissions",
    )

    def __str__(self):
        return self.username


class Project(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="projects"
    )
    shared_with = models.ManyToManyField(
        CustomUser, blank=True, related_name="shared_projects"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    # Campo last_updated che si aggiorna automaticamente ad ogni salvataggio
    last_updated = models.DateTimeField(auto_now=True)

    background_color = models.CharField(
        max_length=7,  # To store hex color codes like #RRGGBB
        default="#ffffff",  # Default to white
        help_text="Hex color code for the background (e.g., #ff0000 for red).",
    )

    def __str__(self):
        return self.title


class Lesson(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="lessons"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    analyzed = models.BooleanField(default=False)  # NEW: Track if the lesson has been analyzed

    def __str__(self):
        return self.title


class UserActivity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activities"
    )
    project = models.ForeignKey(
        "Project",  # Adjust the import if necessary
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    lesson = models.ForeignKey(
        "Lesson",  # Adjust the import if necessary
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    opened_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.lesson:
            return f"{self.user.username} opened lesson {self.lesson.title} at {self.opened_at}"
        elif self.project:
            return f"{self.user.username} opened project {self.project.title} at {self.opened_at}"
        return f"{self.user.username} activity at {self.opened_at}"

class LessonResource(models.Model):
    class ResourceType(models.TextChoices):
        PDF = "pdf", "PDF"
        AUDIO = "audio", "Audio"
        TEXT = "text", "Text"
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        OTHER = "other", "Other"

    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="resources"
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="")
    entry_text = models.TextField(blank=True)
    subject = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    resource_type = models.CharField(
        max_length=10,
        choices=ResourceType.choices,
        default=ResourceType.OTHER
    )

    class Meta:
        db_table = "app_lessonresource"  # Keep custom table name


class MonthlyAPIUsage(models.Model):
    SERVICE_CHOICES = [
        ("gemini", "Google Gemini"),
        ("azure_tts", "Azure Text-to-Speech"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    service = models.CharField(max_length=20, choices=SERVICE_CHOICES)  # API used
    month = models.IntegerField()  # e.g., 1 = January, 2 = February
    year = models.IntegerField()  # e.g., 2025
    total_input_tokens = models.IntegerField(default=0)  # For Gemini
    total_output_tokens = models.IntegerField(default=0)  # For Gemini
    total_characters_processed = models.IntegerField(default=0)  # For Azure TTS

    class Meta:
        unique_together = ("user", "service", "month", "year")  # Avoid duplicate entries

    def __str__(self):
        return f"{self.user.username} - {self.service} - {self.month}/{self.year}"

class ConceptMap(models.Model):
    """Stores a conceptual map in JSON format for easy retrieval and modification."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    data = models.JSONField()  # Stores React Flow JSON (nodes, edges)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson = models.OneToOneField(  # Each lesson has ONE conceptual map
        "Lesson", on_delete=models.CASCADE, related_name="concept_map"
    )
    def __str__(self):
        return f"{self.title} (by {self.user.username})"
    
class KeyConcepts(models.Model):
    """Stores a conceptual map in JSON format for easy retrieval and modification."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    data = models.JSONField()  # Stores React Flow JSON (nodes, edges)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson = models.OneToOneField(  # Each lesson has ONE conceptual map
        "Lesson", on_delete=models.CASCADE, related_name="concept_map"
    )
    def __str__(self):
        return f"{self.title} (by {self.user.username})"
    
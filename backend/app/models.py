from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.conf import settings


class BackgroundImage(models.Model):
    IMAGE_TYPE_CHOICES = [
        ("preset", "Preset Image"),
        ("blended", "Color Blended Image"),
    ]

    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to="background_images/")
    description = models.TextField()
    type = models.CharField(
        max_length=10,
        choices=IMAGE_TYPE_CHOICES,
        default="preset",
        help_text="Type of background image (e.g., preset or color blended)",
    )

    def __str__(self):
        return self.name


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
    last_updated = models.DateTimeField(auto_now=True)

    # Background image selection
    background_image = models.ForeignKey(
        BackgroundImage,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="projects",
        help_text="Choose a predefined background image.",
    )

    def get_background(self):
        """Returns the background image URL for frontend rendering."""
        if self.background_image:
            return {"type": "image", "url": self.background_image.image.url}
        return None  # No background set

    def __str__(self):
        return self.title


class Lesson(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="lessons"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    analyzed = models.BooleanField(
        default=False
    )  # NEW: Track if the lesson has been analyzed

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
    file = models.FileField(upload_to="", blank=True, null=True)
    entry_text = models.TextField(blank=True)
    subject = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    resource_type = models.CharField(
        max_length=10, choices=ResourceType.choices, default=ResourceType.OTHER
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
        unique_together = (
            "user",
            "service",
            "month",
            "year",
        )  # Avoid duplicate entries

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
    data = models.JSONField()  # Stores React Flow JSON (nodes, edges)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson = models.ForeignKey(  # Each lesson can have multiple key concepts
        "Lesson", on_delete=models.CASCADE, related_name="key_concepts"
    )

    def __str__(self):
        return f"{self.lesson.title} (by {self.user.username})"


class Summary(models.Model):
    """Stores a summary for a lesson in JSON format for easy retrieval and modification."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()  # Stores the textual content of the summary
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson = models.OneToOneField(  # Each lesson has ONE summary
        "Lesson", on_delete=models.CASCADE, related_name="summary"
    )
    word_count = models.PositiveIntegerField(default=0)  # New field to store word count

    def __str__(self):
        return f"Summary: {self.title} (by {self.user.username})"

    def save(self, *args, **kwargs):
        # Calculate word count based on content
        self.word_count = len(
            self.content.split()
        )  # Split content into words and count them
        super().save(*args, **kwargs)  # Call the parent class's save method

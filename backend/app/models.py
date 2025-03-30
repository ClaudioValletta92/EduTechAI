from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.conf import settings
from django.utils import timezone


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
    
class Timeline(models.Model):
    """Stores a timeline in JSON format for easy retrieval and modification."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    data = models.JSONField()  # Stores React Flow JSON (nodes, edges)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson = models.OneToOneField(  # Each lesson has ONE conceptual map
        "Lesson", on_delete=models.CASCADE, related_name="timeline"
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
    content = models.JSONField()  # Stores the textual content of the summary
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson = models.OneToOneField(  # Each lesson has ONE summary
        "Lesson", on_delete=models.CASCADE, related_name="summary"
    )

    def __str__(self):
        return f"Summary: {self.title} (by {self.user.username})"


class Table(models.Model):
    """Stores a table associated with a lesson."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    data = models.JSONField()  # Stores the table data in JSON format
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson = models.ForeignKey(  # Each lesson can have multiple tables
        "Lesson", on_delete=models.CASCADE, related_name="tables"
    )

    def __str__(self):
        return f"Table: {self.title} (by {self.user.username})"


class Subscription(models.Model):
    SUBSCRIPTION_CHOICES = [
        ("TRIAL", "Trial"),
        ("MONTHLY", "Monthly"),
        ("YEARLY", "Yearly"),
    ]

    subscription_type = models.CharField(
        max_length=10,
        choices=SUBSCRIPTION_CHOICES,
        default="TRIAL",
        help_text="Tipo di abbonamento",
    )

    start_date = models.DateField(
        default=timezone.now,
        help_text="Data di inizio dell'abbonamento o del trial",
    )

    expiry_date = models.DateField(
        null=True,
        blank=True,
        help_text="Data di scadenza dell'abbonamento o del trial",
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Indica se l'abbonamento è attivo",
    )

    def save(self, *args, **kwargs):
        # Automatically set the trial expiry date if the subscription is a trial
        if self.subscription_type == "TRIAL" and not self.expiry_date:
            self.expiry_date = self.start_date + timezone.timedelta(days=30)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.subscription_type} (Active: {self.is_active})"


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("CREDIT_CARD", "Credit Card"),
        ("PAYPAL", "PayPal"),
        ("BANK_TRANSFER", "Bank Transfer"),
    ]

    user = models.ForeignKey(
        "CustomUser",
        on_delete=models.CASCADE,
        related_name="payments",
        help_text="Utente associato al pagamento",
    )

    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
        help_text="Abbonamento associato al pagamento",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Importo del pagamento",
    )

    payment_date = models.DateTimeField(
        default=timezone.now,
        help_text="Data e ora del pagamento",
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        help_text="Metodo di pagamento utilizzato",
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text="ID della transazione (se disponibile)",
    )

    def __str__(self):
        return f"Payment #{self.id} - {self.user.username} ({self.amount} EUR)"


class CustomUser(AbstractUser):
    THEME_CHOICES = [
        ("dark", "Dark"),
        ("light", "Light"),
    ]

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

    # Link to the Subscription model (One-to-One relationship)
    subscription = models.OneToOneField(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user",
        help_text="Abbonamento dell'utente",
    )

    # Pomodoro Timer Settings
    work_duration = models.PositiveIntegerField(
        default=25,
        help_text="Durata della sessione di lavoro in minuti (default: 25)",
    )

    rest_duration = models.PositiveIntegerField(
        default=5,
        help_text="Durata della pausa in minuti (default: 5)",
    )

    # Override groups field with a custom related_name
    groups = models.ManyToManyField(
        Group,
        related_name="custom_users",
        blank=True,
        help_text="I gruppi a cui l'utente appartiene",
        verbose_name="groups",
    )
    theme = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default="dark",
        help_text="Tema preferito dell'utente",
    )

    # Override user_permissions field
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_users_permissions",
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


class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tasks')

    # Optional links to other entities
    project = models.ForeignKey('app.Project', on_delete=models.CASCADE, related_name='tasks', blank=True, null=True)
    lesson = models.ForeignKey('app.Lesson', on_delete=models.CASCADE, related_name='tasks', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
    
class ImportantDate(models.Model):
    TYPE_CHOICES = [
        ('exam', 'Exam'),
        ('deadline', 'Deadline'),
        ('review', 'Review'),
        ('custom', 'Custom'),
    ]

    title = models.CharField(max_length=255)
    date = models.DateField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='custom')
    description = models.TextField(blank=True, null=True)

    # Collegamenti opzionali
    project = models.ForeignKey('app.Project', on_delete=models.CASCADE, related_name='important_dates', blank=True, null=True)
    lesson = models.ForeignKey('app.Lesson', on_delete=models.CASCADE, related_name='important_dates', blank=True, null=True)
    task = models.ForeignKey('app.Task', on_delete=models.CASCADE, related_name='important_dates', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_type_display()}) - {self.date}"

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

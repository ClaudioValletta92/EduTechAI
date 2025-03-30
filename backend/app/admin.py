from django.contrib import admin
from .models import (
    CustomUser,
    Project,
    Lesson,
    LessonResource,
    MonthlyAPIUsage,
    ConceptMap,
    KeyConcepts,
    Summary,
    BackgroundImage,
    Table,
    Subscription,
    Payment,
    Task,
    ImportantDate,
    Timeline,
)

admin.site.register(CustomUser)
admin.site.register(Project)
admin.site.register(Lesson)
admin.site.register(LessonResource)
admin.site.register(MonthlyAPIUsage)
admin.site.register(ConceptMap)
admin.site.register(KeyConcepts)
admin.site.register(Summary)
admin.site.register(BackgroundImage)
admin.site.register(Table)
admin.site.register(Subscription)
admin.site.register(Payment)
admin.site.register(Task)
admin.site.register(ImportantDate)
admin.site.register(Timeline)
admin.site.site_header = "AI Tutor Admin"
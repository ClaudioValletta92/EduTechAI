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

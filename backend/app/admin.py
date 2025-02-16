from django.contrib import admin
from .models import CustomUser, Project, Lesson, LessonResource,MonthlyAPIUsage

admin.site.register(CustomUser)
admin.site.register(Project)
admin.site.register(Lesson)
admin.site.register(LessonResource)
admin.site.register(MonthlyAPIUsage)
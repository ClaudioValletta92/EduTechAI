from django.contrib import admin
from .models import CustomUser, Project, Lesson

admin.site.register(CustomUser)
admin.site.register(Project)
admin.site.register(Lesson)

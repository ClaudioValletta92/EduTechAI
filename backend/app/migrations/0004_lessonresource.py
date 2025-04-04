# Generated by Django 5.1.5 on 2025-02-09 21:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_project_background_color'),
    ]

    operations = [
        migrations.CreateModel(
            name='LessonResource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('file', models.FileField(upload_to='lesson_pdfs/')),
                ('entry_text', models.TextField(blank=True)),
                ('entities', models.JSONField(default=list)),
                ('locations', models.JSONField(default=list)),
                ('topics', models.JSONField(default=list)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resources', to='app.lesson')),
            ],
        ),
    ]

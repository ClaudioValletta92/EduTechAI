# Generated by Django 5.1.5 on 2025-03-01 19:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0017_remove_keyconcepts_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='keyconcepts',
            name='lesson',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='key_concepts', to='app.lesson'),
        ),
    ]

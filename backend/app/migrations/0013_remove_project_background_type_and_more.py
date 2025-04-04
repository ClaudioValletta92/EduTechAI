# Generated by Django 5.1.5 on 2025-02-27 22:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0012_alter_backgroundimage_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='background_type',
        ),
        migrations.RemoveField(
            model_name='project',
            name='gradient_end',
        ),
        migrations.RemoveField(
            model_name='project',
            name='gradient_start',
        ),
        migrations.AddField(
            model_name='backgroundimage',
            name='type',
            field=models.CharField(choices=[('preset', 'Preset Image'), ('blended', 'Color Blended Image')], default='preset', help_text='Type of background image (e.g., preset or color blended)', max_length=10),
        ),
        migrations.AlterField(
            model_name='backgroundimage',
            name='image',
            field=models.ImageField(upload_to='background_images/'),
        ),
    ]

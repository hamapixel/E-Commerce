from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="profile_photo",
            field=models.ImageField(
                blank=True,
                max_length=255,
                null=True,
                upload_to="owners/profile/",
                verbose_name="Photo de profil",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="store_logo",
            field=models.ImageField(
                blank=True,
                max_length=255,
                null=True,
                upload_to="owners/logo/",
                verbose_name="Logo de la boutique",
            ),
        ),
    ]

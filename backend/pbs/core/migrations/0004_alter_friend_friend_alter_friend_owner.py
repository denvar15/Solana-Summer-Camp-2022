# Generated by Django 4.0.3 on 2022-04-07 07:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_remove_user_friends_alter_user_games_friend'),
    ]

    operations = [
        migrations.AlterField(
            model_name='friend',
            name='friend',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.user', verbose_name='Друг'),
        ),
        migrations.AlterField(
            model_name='friend',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friends', to='core.user', verbose_name='Владелец'),
        ),
    ]
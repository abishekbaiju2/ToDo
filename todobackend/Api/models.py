from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

class CustomUser(AbstractUser):
    email = models.EmailField(unique = True)

    def __str__(self):
        return self.username


User = settings.AUTH_USER_MODEL

class EmailOtp(models.Model):
    
    us_id = models.OneToOneField(User,on_delete = models.CASCADE)
    otp = models.CharField(max_length = 4)
    created_date = models.DateTimeField(auto_now_add = True)
    
    def is_expired(self):
        return timezone.now() > self.created_date + timedelta(minutes=5)

    def __str__(self):
        return f"{self.us_id.username} - {self.otp}"
    
class PasswordResetOtp(models.Model):
    
    us_id = models.OneToOneField(User, on_delete = models.CASCADE)
    otp = models.CharField(max_length = 4)
    created_at = models.DateTimeField(auto_now_add = True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"{self.us_id.email} - {self.otp}"
     
class TodoModel(models.Model):
    us_id = models.ForeignKey(User,on_delete = models.CASCADE)
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default = False)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.title
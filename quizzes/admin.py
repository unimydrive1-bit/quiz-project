from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Quiz, StudentQuizReview

admin.site.register(Quiz)
admin.site.register(StudentQuizReview)

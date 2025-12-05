from django.db import models

# Create your models here.
from django.db import models
from quizzes.models import Quiz

class QuizAssignment(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    student_name = models.CharField(max_length=100)
    assigned_date = models.DateTimeField(auto_now_add=True)



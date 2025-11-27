from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = (
        ("teacher", "Teacher"),
        ("student", "Student"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")

    def is_teacher(self):
        return self.role == "teacher"

    def is_student(self):
        return self.role == "student"


class Quiz(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_quizzes")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    time_limit_seconds = models.PositiveIntegerField(null=True, blank=True)
    shuffle_questions = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPE = (
        ("mcq", "Multiple Choice"),
        ("tf", "True / False"),
        ("short", "Short Answer"),
    )

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    qtype = models.CharField(max_length=10, choices=QUESTION_TYPE, default="mcq")
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    reference_answer = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.quiz.title} - Q{self.pk}"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Choice {self.pk} for Q{self.question.pk}"


class QuizAssignment(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="assignments")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assigned_quizzes")
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="given_assignments"
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    available_from = models.DateTimeField(null=True, blank=True)
    available_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("quiz", "student")

    def __str__(self):
        return f"{self.quiz} -> {self.student}"


class Attempt(models.Model):
    STATUS = (
        ("in_progress", "In Progress"),
        ("finished", "Finished"),
    )

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attempts")
    start_time = models.DateTimeField(default=timezone.now)
    finish_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="in_progress")
    score = models.FloatField(null=True, blank=True)
    total_correct = models.IntegerField(default=0)
    total_wrong = models.IntegerField(default=0)
    time_limit_seconds = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["student", "quiz"])]

    def time_left_seconds(self):
        if not self.time_limit_seconds:
            return None
        elapsed = (timezone.now() - self.start_time).total_seconds()
        left = self.time_limit_seconds - elapsed
        return max(0, int(left))

    def __str__(self):
        return f"{self.quiz} - {self.student} ({self.status})"


class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, null=True, blank=True, on_delete=models.SET_NULL)
    short_answer_text = models.TextField(blank=True, null=True)
    is_correct = models.BooleanField(null=True)
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("attempt", "question")

    def __str__(self):
        return f"Attempt {self.attempt_id} - Q{self.question_id}"

#############################################
# CREATE DJANGO PROJECT (if missing)
#############################################

if (-Not (Test-Path "manage.py")) {
    Write-Host "Creating Django project..."
    django-admin startproject config .
} else {
    Write-Host "Django project already exists — skipping."
}

#############################################
# CREATE quizzes APP (if missing)
#############################################

if (-Not (Test-Path "quizzes")) {
    Write-Host "Creating quizzes app..."
    python manage.py startapp quizzes
} else {
    Write-Host "quizzes app already exists — skipping."
}

#############################################
# SAFE FILE WRITER
#############################################

function Write-Code($file, $content) {
    $dir = Split-Path $file
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    $content | Set-Content $file
    Write-Host "Updated: $file"
}

#############################################
# settings.py
#############################################

Write-Code "config/settings.py" @"
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret")
DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",

    "quizzes",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        "NAME": os.environ.get("POSTGRES_DB", "quizdb"),
        "USER": os.environ.get("POSTGRES_USER", "postgres"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
        "CONN_MAX_AGE": 300,
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = "/tmp/build/static"

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=5),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
"@

#############################################
# config/urls.py
#############################################

Write-Code "config/urls.py" @"
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("quizzes.urls")),
]
"@

#############################################
# quizzes/models.py
#############################################

Write-Code "quizzes/models.py" @"
from django.db import models
from django.contrib.auth.models import User

class Quiz(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.CharField(max_length=255)
    question_type = models.CharField(max_length=10, choices=[("mcq", "MCQ"), ("tf", "True/False")])

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

class Assignment(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

class Attempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField(default=0)
    is_finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True)
    is_correct = models.BooleanField(default=False)
"@

#############################################
# quizzes/serializers.py
#############################################

Write-Code "quizzes/serializers.py" @"
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Quiz, Question, Choice, Assignment, Attempt, AttemptAnswer

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text"]

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "text", "question_type", "choices"]

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "questions"]

class AttemptSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)

    class Meta:
        model = Attempt
        fields = ["id", "quiz", "score", "is_finished"]
"@

#############################################
# quizzes/views.py
#############################################

Write-Code "quizzes/views.py" @"
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Quiz, Question, Choice, Assignment, Attempt, AttemptAnswer
from .serializers import QuizSerializer, AttemptSerializer

class AssignedQuizzes(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        quizzes = Quiz.objects.filter(assignment__student=request.user)
        return Response(QuizSerializer(quizzes, many=True).data)

class QuizDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        quiz = Quiz.objects.get(id=quiz_id)
        return Response(QuizSerializer(quiz).data)

class StartAttempt(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):
        attempt = Attempt.objects.create(student=request.user, quiz_id=quiz_id)
        return Response(AttemptSerializer(attempt).data)

class AttemptDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        attempt = Attempt.objects.get(id=attempt_id, student=request.user)
        return Response(AttemptSerializer(attempt).data)

class SubmitAnswer(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, attempt_id):
        attempt = Attempt.objects.get(id=attempt_id)

        question_id = request.data.get("question")
        selected_choice_id = request.data.get("selected_choice")

        question = Question.objects.get(id=question_id)
        selected_choice = Choice.objects.get(id=selected_choice_id)

        is_correct = selected_choice.is_correct

        AttemptAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                "selected_choice": selected_choice,
                "is_correct": is_correct,
            }
        )

        return Response({"correct": is_correct})

class FinishAttempt(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, attempt_id):
        attempt = Attempt.objects.get(id=attempt_id)
        answers = attempt.answers.all()

        correct = answers.filter(is_correct=True).count()
        total = answers.count()

        attempt.score = (correct / total * 100) if total > 0 else 0
        attempt.is_finished = True
        attempt.save()

        return Response({"score": attempt.score})
"@

#############################################
# quizzes/urls.py
#############################################

Write-Code "quizzes/urls.py" @"
from django.urls import path
from .views import AssignedQuizzes, QuizDetail, StartAttempt, AttemptDetail, SubmitAnswer, FinishAttempt

urlpatterns = [
    path("student/quizzes/assigned/", AssignedQuizzes.as_view()),
    path("quizzes/<int:quiz_id>/", QuizDetail.as_view()),
    path("quizzes/<int:quiz_id>/start/", StartAttempt.as_view()),
    path("attempts/<int:attempt_id>/", AttemptDetail.as_view()),
    path("attempts/<int:attempt_id>/answer/", SubmitAnswer.as_view()),
    path("attempts/<int:attempt_id>/finish/", FinishAttempt.as_view()),
]
"@

#############################################
# requirements.txt
#############################################

Write-Code "requirements.txt" @"
Django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
python-dotenv
psycopg2-binary
"@

#############################################
# .env.example
#############################################

Write-Code ".env.example" @"
DJANGO_SECRET_KEY=devsecret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=*,localhost,127.0.0.1

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=quizdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
"@

#############################################

Write-Host "=== BACKEND SETUP COMPLETE ==="
Write-Host "Run migrations with:"
Write-Host "  python manage.py makemigrations"
Write-Host "  python manage.py migrate"

Write-Host "Run server:"
Write-Host "  python manage.py runserver"

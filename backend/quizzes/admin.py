from django.contrib import admin
from .models import (
    User,
    Quiz,
    Question,
    Choice,
    QuizAssignment,
    Attempt,
    AttemptAnswer,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_staff")
    list_filter = ("role", "is_staff")


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 1


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "created_at")
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "quiz", "qtype", "points")
    inlines = [ChoiceInline]


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ("text", "question", "is_correct")


@admin.register(QuizAssignment)
class QuizAssignmentAdmin(admin.ModelAdmin):
    list_display = ("quiz", "student", "assigned_by", "is_active")


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ("quiz", "student", "status", "score", "start_time", "finish_time")


@admin.register(AttemptAnswer)
class AttemptAnswerAdmin(admin.ModelAdmin):
    list_display = ("attempt", "question", "is_correct", "answered_at")

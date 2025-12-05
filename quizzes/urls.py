from django.urls import path
from . import views

app_name = "quizzes"

urlpatterns = [
    path("my-attempts/", views.my_quiz_attempts, name="my_quiz_attempts"),
    path("attempt/<int:attempt_id>/review/", views.quiz_review, name="quiz_review"),
]
urlpatterns = [
    path("my-attempts/", views.my_quiz_attempts, name="my_quiz_attempts"),
    path("attempt/<int:attempt_id>/review/", views.quiz_review, name="quiz_review"),

    # NEW:
    path("quiz/<int:quiz_id>/assign/", views.assign_quiz, name="assign_quiz"),
]

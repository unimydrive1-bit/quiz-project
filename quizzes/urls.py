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

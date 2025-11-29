from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    QuizViewSet,
    QuestionViewSet,
    ChoiceViewSet,                 # NEW
    StudentAssignedQuizzesView,
    StartAttemptView,
    AttemptDetailView,
    SubmitAnswerView,
    FinishAttemptView,
    ReviewWrongAnswersView,
    TeacherQuizSummaryView,
    TeacherQuizAttemptsView,
    RegisterView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
)

router = DefaultRouter()
router.register(r"quizzes", QuizViewSet, basename="quiz")
router.register(r"questions", QuestionViewSet, basename="question")
router.register(r"choices", ChoiceViewSet, basename="choice")   # NEW

urlpatterns = [
    path("", include(router.urls)),

    # Auth
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),

    # Student
    path(
        "student/quizzes/assigned/",
        StudentAssignedQuizzesView.as_view(),
        name="student-assigned-quizzes",
    ),
    path(
        "quizzes/<int:quiz_pk>/start/",
        StartAttemptView.as_view(),
        name="quiz-start",
    ),
    path(
        "attempts/<int:attempt_pk>/",
        AttemptDetailView.as_view(),
        name="attempt-detail",
    ),
    path(
        "attempts/<int:attempt_pk>/answer/",
        SubmitAnswerView.as_view(),
        name="attempt-answer",
    ),
    path(
        "attempts/<int:attempt_pk>/finish/",
        FinishAttemptView.as_view(),
        name="attempt-finish",
    ),
    path(
        "attempts/<int:attempt_pk>/review/",
        ReviewWrongAnswersView.as_view(),
        name="attempt-review",
    ),

    # Teacher
    path(
        "teacher/quizzes/summary/",
        TeacherQuizSummaryView.as_view(),
        name="teacher-quiz-summary",
    ),
    path(
        "teacher/quizzes/<int:quiz_pk>/attempts/",
        TeacherQuizAttemptsView.as_view(),
        name="teacher-quiz-attempts",
    ),
]

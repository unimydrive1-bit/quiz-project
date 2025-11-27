from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import (
    Quiz,
    Question,
    Choice,
    QuizAssignment,
    Attempt,
    AttemptAnswer,
)
from .serializers import (
    QuizSerializer,
    QuizCreateUpdateSerializer,
    QuestionSerializer,
    QuestionTeacherSerializer,
    QuizAssignmentSerializer,
    AttemptSerializer,
    AttemptAnswerSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
)
from .permissions import IsTeacher, IsStudent


# ---------- Auth Views ----------

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


# ---------- Quiz CRUD & assignment ----------

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all().select_related("creator")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_teacher():
            if self.action in ["create", "update", "partial_update"]:
                return QuizCreateUpdateSerializer
            return QuizSerializer
        return QuizSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy", "assign"]:
            return [IsAuthenticated(), IsTeacher()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsTeacher])
    def assign(self, request, pk=None):
        """
        Assign a quiz to a list of students.
        Body: { "students": [1,2,3] }
        """
        quiz = self.get_object()
        student_ids = request.data.get("students", [])
        if not isinstance(student_ids, list):
            return Response({"detail": "students must be a list of ids"}, status=400)

        created = []
        for sid in student_ids:
            assignment, was_created = QuizAssignment.objects.get_or_create(
                quiz=quiz,
                student_id=sid,
                defaults={"assigned_by": request.user},
            )
            if was_created:
                created.append(assignment.id)

        return Response({"created_assignments": created}, status=200)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().select_related("quiz")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_teacher():
            return QuestionTeacherSerializer
        return QuestionSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsTeacher()]
        return [IsAuthenticated()]


# ---------- Helper for scoring ----------

def _calculate_attempt_score(attempt: Attempt):
    """
    Shared scoring helper – used in FinishAttemptView.
    """
    answers = attempt.answers.select_related("question", "selected_choice")
    total_points = 0
    earned_points = 0
    total_correct = 0
    total_wrong = 0

    for q in attempt.quiz.questions.all():
        total_points += q.points

    for ans in answers:
        q = ans.question
        if q.qtype in ("mcq", "tf"):
            if ans.selected_choice and ans.selected_choice.is_correct:
                ans.is_correct = True
                total_correct += 1
                earned_points += q.points
            else:
                ans.is_correct = False
                total_wrong += 1
            ans.save()

    percent = (earned_points / total_points * 100) if total_points > 0 else 0
    attempt.total_correct = total_correct
    attempt.total_wrong = total_wrong
    attempt.score = round(percent, 2)
    attempt.status = "finished"
    attempt.finish_time = timezone.now()
    attempt.save()
    return attempt


# ---------- Student endpoints ----------

class StudentAssignedQuizzesView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        assignments = (
            QuizAssignment.objects.filter(student=request.user, is_active=True)
            .select_related("quiz")
            .order_by("-assigned_at")
        )
        quizzes = [a.quiz for a in assignments]
        data = QuizSerializer(quizzes, many=True).data
        return Response(data)


class StartAttemptView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, quiz_pk):
        quiz = get_object_or_404(Quiz, pk=quiz_pk)
        assigned = QuizAssignment.objects.filter(
            quiz=quiz, student=request.user, is_active=True
        )
        if not assigned.exists():
            return Response({"detail": "Quiz not assigned to you"}, status=403)

        attempt = Attempt.objects.create(
            quiz=quiz,
            student=request.user,
            start_time=timezone.now(),
            status="in_progress",
            time_limit_seconds=quiz.time_limit_seconds,
        )
        serializer = AttemptSerializer(attempt)
        return Response(serializer.data, status=201)


class AttemptDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, attempt_pk):
        attempt = get_object_or_404(Attempt, pk=attempt_pk, student=request.user)
        serializer = AttemptSerializer(attempt)
        return Response(serializer.data)


class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, attempt_pk):
        attempt = get_object_or_404(Attempt, pk=attempt_pk, student=request.user)
        if attempt.status != "in_progress":
            return Response({"detail": "Attempt already finished"}, status=400)

        if attempt.time_limit_seconds and attempt.time_left_seconds() == 0:
            return Response({"detail": "Time is up"}, status=400)

        question_id = request.data.get("question")
        selected_choice_id = request.data.get("selected_choice")
        short_answer = request.data.get("short_answer_text")

        if not question_id:
            return Response({"detail": "question is required"}, status=400)

        question = get_object_or_404(Question, pk=question_id, quiz=attempt.quiz)
        aa, _ = AttemptAnswer.objects.get_or_create(attempt=attempt, question=question)
        aa.selected_choice_id = selected_choice_id if selected_choice_id else None
        aa.short_answer_text = short_answer or None

        if question.qtype in ("mcq", "tf") and aa.selected_choice_id:
            choice = get_object_or_404(Choice, pk=aa.selected_choice_id, question=question)
            aa.is_correct = bool(choice.is_correct)
        else:
            aa.is_correct = None

        aa.save()
        return Response(AttemptAnswerSerializer(aa).data, status=200)


class FinishAttemptView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @transaction.atomic
    def post(self, request, attempt_pk):
        attempt = get_object_or_404(Attempt, pk=attempt_pk, student=request.user)

        if attempt.status == "finished":
            return Response({"detail": "Already finished"}, status=400)

        attempt = _calculate_attempt_score(attempt)

        return Response(
            {
                "score": attempt.score,
                "total_correct": attempt.total_correct,
                "total_wrong": attempt.total_wrong,
            }
        )


class ReviewWrongAnswersView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, attempt_pk):
        attempt = get_object_or_404(Attempt, pk=attempt_pk, student=request.user)
        wrongs = attempt.answers.filter(is_correct=False).select_related(
            "question", "selected_choice"
        )
        wrong_list = list(wrongs)
        import random

        random.shuffle(wrong_list)
        serializer = AttemptAnswerSerializer(wrong_list, many=True)
        return Response(serializer.data)


# ---------- Teacher endpoints ----------

class TeacherQuizSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        quizzes = Quiz.objects.filter(creator=request.user)
        data = []
        for quiz in quizzes:
            attempts_count = quiz.attempts.count()
            data.append(
                {
                    "quiz_id": quiz.id,
                    "title": quiz.title,
                    "attempts": attempts_count,
                }
            )
        return Response(data)


class TeacherQuizAttemptsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, quiz_pk):
        quiz = get_object_or_404(Quiz, pk=quiz_pk, creator=request.user)
        attempts = quiz.attempts.select_related("student")
        serializer = AttemptSerializer(attempts, many=True)
        return Response(serializer.data)

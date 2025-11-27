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

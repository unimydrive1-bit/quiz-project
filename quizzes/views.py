from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import QuizAttempt, StudentAnswer
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Quiz, Question, Choice, Assignment, Attempt, AttemptAnswer

@login_required
def my_quiz_attempts(request):
    """
    Show all finished attempts for the logged-in student.
    """
    attempts = (
        Attempt.objects
        .filter(student=request.user, is_finished=True)
        .select_related("quiz")
        .order_by("-created_at")
    )
    return render(request, "quizzes/my_quiz_attempts.html", {"attempts": attempts})


@login_required
def quiz_review(request, attempt_id):
    """
    Show review of one attempt:
    - Quiz info
    - Score
    - Each question
    - Student's selected answer
    - Correct answer
    """
    attempt = get_object_or_404(
        Attempt,
        id=attempt_id,
        student=request.user  # ensure a student can only see their own attempts
    )

    # Prefetch answers + choices for better performance
    answers = (
        attempt.answers
        .select_related("question", "selected_choice")
        .prefetch_related("question__choices")
    )

    context_questions = []
    for ans in answers:
        question = ans.question
        choices = list(question.choices.all())
        correct_choices = [c for c in choices if c.is_correct]

        context_questions.append({
            "question": question,
            "choices": choices,
            "selected_choice": ans.selected_choice,
            "correct_choices": correct_choices,
            "is_correct": ans.is_correct,
        })

    context = {
        "attempt": attempt,
        "quiz": attempt.quiz,
        "questions_data": context_questions,
    }
    return render(request, "quizzes/quiz_review.html", context)

@login_required
def assign_quiz(request, quiz_id):
    """
    Teacher selects students and assigns them this quiz.
    """
    quiz = get_object_or_404(Quiz, id=quiz_id, teacher=request.user)

    # All users except teachers (you can customize this, e.g., filter by group)
    students = User.objects.exclude(id=request.user.id)

    if request.method == "POST":
        selected_ids = request.POST.getlist("students")  # list of user IDs as strings
        for sid in selected_ids:
            Assignment.objects.get_or_create(
                quiz=quiz,
                student_id=sid,
            )
        return redirect("quizzes:assign_quiz", quiz_id=quiz.id)

    # To show already assigned students
    assigned_student_ids = Assignment.objects.filter(quiz=quiz).values_list("student_id", flat=True)

    context = {
        "quiz": quiz,
        "students": students,
        "assigned_student_ids": assigned_student_ids,
    }
    return render(request, "quizzes/assign_quiz.html", context)

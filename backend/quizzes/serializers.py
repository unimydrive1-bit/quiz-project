from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    Quiz,
    Question,
    Choice,
    QuizAssignment,
    Attempt,
    AttemptAnswer,
)

User = get_user_model()


# ----- Auth -----

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "role": self.user.role,
        }
        return data


# ----- Core serializers -----

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "order"]


class ChoiceTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "order", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "text", "qtype", "points", "order", "choices"]


class QuestionTeacherSerializer(serializers.ModelSerializer):
    choices = ChoiceTeacherSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "text",
            "qtype",
            "points",
            "order",
            "reference_answer",
            "choices",
        ]


class QuizSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "time_limit_seconds",
            "shuffle_questions",
            "created_at",
            "creator",
            "questions",
        ]


class QuizCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "time_limit_seconds", "shuffle_questions"]


class QuizAssignmentSerializer(serializers.ModelSerializer):
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all())
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role="student"))

    class Meta:
        model = QuizAssignment
        fields = [
            "id",
            "quiz",
            "student",
            "assigned_by",
            "assigned_at",
            "available_from",
            "available_until",
            "is_active",
        ]
        read_only_fields = ["assigned_by", "assigned_at"]


class AttemptAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttemptAnswer
        fields = [
            "id",
            "attempt",
            "question",
            "selected_choice",
            "short_answer_text",
            "is_correct",
            "answered_at",
        ]
        read_only_fields = ["is_correct", "answered_at"]


class AttemptSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    answers = AttemptAnswerSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "id",
            "quiz",
            "student",
            "student_name",
            "start_time",
            "finish_time",
            "status",
            "score",
            "total_correct",
            "total_wrong",
            "time_limit_seconds",
            "answers",
        ]
        read_only_fields = [
            "student",
            "start_time",
            "finish_time",
            "status",
            "score",
            "total_correct",
            "total_wrong",
        ]

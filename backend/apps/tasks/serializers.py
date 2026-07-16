"""
Serializers.py for tasks apps.
"""
from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    organisation_slug = serializers.CharField(source='organisation.slug', read_only=True, default=None)

    class Meta:
        model = Task
        fields = [
            'id', 'owner', 'organisation_slug', 'title', 'description',
        'status', 'priority', 'due_date',
        'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'organisation_slug', 'created_at', 'updated_at']


class TaskWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'priority', 'due_date']

    def validate_due_date(self, value):
        from django.utils import timezone
        if value and value < timezone.now().date():
            raise serializers.ValidationError('Due date cannot be in the past.')
        return value

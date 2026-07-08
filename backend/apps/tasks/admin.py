from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display  = ['title', 'owner', 'status', 'priority', 'due_date', 'created_at']
    list_filter   = ['status', 'priority']
    search_fields = ['title', 'description', 'owner__email']
    ordering      = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']

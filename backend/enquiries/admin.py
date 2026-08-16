from django.contrib import admin
from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = (
        'first_name', 'last_name', 'email', 'phone',
        'subject', 'status', 'source', 'created_at'
    )
    list_filter = ('status', 'source', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'message', 'subject')
    list_editable = ('status',)
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Contact', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Enquiry', {
            'fields': ('subject', 'message', 'source', 'related_slug')
        }),
        ('Management', {
            'fields': ('status', 'notes', 'created_at', 'updated_at')
        }),
    )

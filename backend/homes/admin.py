from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.conf import settings

from .models import HomeDesign, HomeDesignGallery, HomeDesignFeature, DesignInclusion


class HomeDesignGalleryInline(admin.TabularInline):
    model = HomeDesignGallery
    extra = 1
    fields = ("image", "alt_text", "order")


class HomeDesignFeatureInline(admin.TabularInline):
    model = HomeDesignFeature
    extra = 1
    fields = ("title", "description", "image", "order")


class DesignInclusionInline(admin.TabularInline):
    model = DesignInclusion
    extra = 1
    autocomplete_fields = ("inclusion",)
    fields = ("inclusion", "order")


@admin.register(HomeDesign)
class HomeDesignAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "slug",
        "category",
        "price",
        "bedrooms",
        "bathrooms",
        "featured",
        "published",
        "preview_link",
        "updated_at",
    )
    list_filter = ("category", "featured", "published", "state", "status")
    search_fields = ("title", "slug", "description", "suburb")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("featured", "published")
    list_per_page = 25
    readonly_fields = ("created_at", "updated_at", "preview_panel")
    inlines = [HomeDesignGalleryInline, HomeDesignFeatureInline, DesignInclusionInline]
    filter_horizontal = ("related_designs",)
    save_on_top = True

    fieldsets = (
        (
            "Basic info",
            {
                "fields": (
                    "title",
                    "slug",
                    "subtitle",
                    "category",
                    "status",
                    "state",
                    "suburb",
                    "preview_panel",
                ),
                "description": "Matches the public Home Design card and detail page.",
            },
        ),
        (
            "Pricing & specs",
            {
                "fields": (
                    ("price", "price_value"),
                    ("bedrooms", "bathrooms", "garage"),
                    ("living", "study"),
                    ("house_size", "land_size"),
                    ("frontage", "depth", "min_lot_width"),
                ),
            },
        ),
        (
            "Media (hero + floor plan)",
            {
                "fields": ("hero_image", "floor_plan"),
                "description": "Hero image → card & detail hero. Floor plan → Floor Plan section on the site.",
            },
        ),
        (
            "Story",
            {"fields": ("description",)},
        ),
        (
            "Related designs",
            {
                "fields": ("related_designs",),
                "description": "Shown in “Similar designs” on the public detail page.",
            },
        ),
        (
            "Publishing",
            {
                "fields": ("featured", "published", "created_at", "updated_at"),
                "description": "Unpublished designs are hidden from the public site but visible here.",
            },
        ),
    )

    @admin.display(description="Site")
    def preview_link(self, obj):
        if not obj.slug:
            return "—"
        path = f"/home-designs/{obj.slug}"
        return format_html(
            '<a href="{}" target="_blank" rel="noopener">View ↗</a>',
            path,
        )

    @admin.display(description="Frontend reference")
    def preview_panel(self, obj):
        if not obj.pk or not obj.slug:
            return "Save once to get public preview links."
        detail = f"/home-designs/{obj.slug}"
        listing = "/home-designs"
        return format_html(
            '<div style="line-height:1.6">'
            "<strong>Public pages this record powers</strong><br>"
            '• Detail: <a href="{0}" target="_blank">{0}</a><br>'
            '• Listing cards: <a href="{1}" target="_blank">{1}</a><br>'
            "• Homepage featured row (if Featured is on)"
            "</div>",
            detail,
            listing,
        )


@admin.register(HomeDesignGallery)
class HomeDesignGalleryAdmin(admin.ModelAdmin):
    list_display = ("home_design", "alt_text", "order")
    list_filter = ("home_design",)
    search_fields = ("home_design__title", "alt_text")


@admin.register(HomeDesignFeature)
class HomeDesignFeatureAdmin(admin.ModelAdmin):
    list_display = ("home_design", "title", "order")
    list_filter = ("home_design",)
    search_fields = ("title", "home_design__title")

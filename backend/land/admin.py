from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Estate,
    HomeLandPackage,
    PackageGallery,
    PackageFeature,
    PackageInclusion,
)


class PackageGalleryInline(admin.TabularInline):
    model = PackageGallery
    extra = 1
    fields = ("image", "alt_text", "order")


class PackageFeatureInline(admin.TabularInline):
    model = PackageFeature
    extra = 1
    fields = ("title", "description", "image", "order")


class PackageInclusionInline(admin.TabularInline):
    model = PackageInclusion
    extra = 1
    autocomplete_fields = ("inclusion",)
    fields = ("inclusion", "order")


@admin.register(Estate)
class EstateAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "suburb", "state", "published", "updated_at")
    list_filter = ("published", "state")
    search_fields = ("name", "suburb", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("published",)
    save_on_top = True


@admin.register(HomeLandPackage)
class HomeLandPackageAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "slug",
        "estate",
        "category",
        "price",
        "bedrooms",
        "featured",
        "published",
        "preview_link",
        "updated_at",
    )
    list_filter = ("category", "featured", "published", "state", "estate")
    search_fields = ("title", "slug", "suburb", "description")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("featured", "published")
    list_per_page = 25
    autocomplete_fields = ("estate",)
    readonly_fields = ("created_at", "updated_at", "preview_panel")
    inlines = [PackageGalleryInline, PackageFeatureInline, PackageInclusionInline]
    save_on_top = True

    fieldsets = (
        (
            "Basic info",
            {
                "fields": (
                    "title",
                    "slug",
                    "estate",
                    "category",
                    "badge",
                    "state",
                    "suburb",
                    "preview_panel",
                ),
                "description": "Powers Home & Land cards and /home-land/[slug] detail.",
            },
        ),
        (
            "Pricing & specs",
            {
                "fields": (
                    ("price", "price_value"),
                    ("bedrooms", "bathrooms", "garage"),
                    ("land_size", "house_size"),
                    ("frontage", "depth"),
                ),
            },
        ),
        (
            "Media",
            {
                "fields": ("hero_image", "floor_plan"),
                "description": "Hero → cards & hero band. Floor plan → package floor plan section.",
            },
        ),
        ("Story", {"fields": ("description",)}),
        (
            "Publishing",
            {"fields": ("featured", "published", "created_at", "updated_at")},
        ),
    )

    @admin.display(description="Site")
    def preview_link(self, obj):
        if not obj.slug:
            return "—"
        return format_html(
            '<a href="/home-land/{}" target="_blank" rel="noopener">View ↗</a>',
            obj.slug,
        )

    @admin.display(description="Frontend reference")
    def preview_panel(self, obj):
        if not obj.pk or not obj.slug:
            return "Save once to get public preview links."
        return format_html(
            '<div style="line-height:1.6">'
            "<strong>Public pages this record powers</strong><br>"
            '• Detail: <a href="/home-land/{0}" target="_blank">/home-land/{0}</a><br>'
            '• Listing: <a href="/home-land" target="_blank">/home-land</a><br>'
            "• Homepage packages row (if Featured)"
            "</div>",
            obj.slug,
        )


@admin.register(PackageGallery)
class PackageGalleryAdmin(admin.ModelAdmin):
    list_display = ("package", "alt_text", "order")
    list_filter = ("package",)


@admin.register(PackageFeature)
class PackageFeatureAdmin(admin.ModelAdmin):
    list_display = ("package", "title", "order")
    list_filter = ("package",)

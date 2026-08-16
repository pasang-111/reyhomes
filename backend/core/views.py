from rest_framework import generics, viewsets, parsers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import action

from .models import HeroSlide, Inclusion, Testimonial, SiteSetting
from .serializers import (
    HeroSlideSerializer,
    InclusionSerializer,
    InclusionWriteSerializer,
    TestimonialSerializer,
    TestimonialWriteSerializer,
    SiteSettingSerializer,
)


class HeroSlideViewSet(viewsets.ModelViewSet):
    """Public list of active slides; full CRUD for staff."""
    serializer_class = HeroSlideSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    ordering = ["order"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = HeroSlide.objects.all().order_by("order")
        if self.action in ("list", "retrieve") and not getattr(
            self.request.user, "is_staff", False
        ):
            qs = qs.filter(active=True)
        return qs


class InclusionViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filterset_fields = ["category", "featured", "published"]
    search_fields = ["title", "description"]
    ordering = ["order", "title"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Inclusion.objects.all()
        if self.action in ("list", "retrieve") and not getattr(
            self.request.user, "is_staff", False
        ):
            qs = qs.filter(published=True)
        return qs.order_by("order", "title")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return InclusionWriteSerializer
        return InclusionSerializer


class TestimonialViewSet(viewsets.ModelViewSet):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filterset_fields = ["featured", "published", "rating"]
    search_fields = ["name", "review", "suburb", "design"]
    ordering = ["-featured", "-created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Testimonial.objects.all()
        if self.action in ("list", "retrieve") and not getattr(
            self.request.user, "is_staff", False
        ):
            qs = qs.filter(published=True)
            if self.request.query_params.get("featured") == "true":
                qs = qs.filter(featured=True)
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return TestimonialWriteSerializer
        return TestimonialSerializer


# Keep simple list aliases for backward compatibility
class HeroSlideListView(generics.ListAPIView):
    serializer_class = HeroSlideSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return HeroSlide.objects.filter(active=True).order_by("order")


class TestimonialListView(generics.ListAPIView):
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Testimonial.objects.filter(published=True)
        if self.request.query_params.get("featured") == "true":
            qs = qs.filter(featured=True)
        return qs


class SiteSettingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = SiteSetting.load()
        serializer = SiteSettingSerializer(settings, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Staff access required."}, status=status.HTTP_403_FORBIDDEN)
        settings = SiteSetting.load()
        # Allow partial updates of non-file fields + optional files
        for field in ("company_name", "phone", "email", "address",
                      "instagram", "facebook", "youtube", "linkedin"):
            if field in request.data:
                setattr(settings, field, request.data.get(field) or "")
        if "logo" in request.FILES:
            settings.logo = request.FILES["logo"]
        if "footer_logo" in request.FILES:
            settings.footer_logo = request.FILES["footer_logo"]
        settings.save()
        serializer = SiteSettingSerializer(settings, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        return self.put(request)

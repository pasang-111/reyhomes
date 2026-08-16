from django.db import models
from django.utils.text import slugify


class HeroSlide(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    description = models.TextField(blank=True)
    button_text = models.CharField(max_length=100, blank=True, default='Explore')
    button_link = models.CharField(max_length=255, blank=True, default='/home-designs')
    image = models.ImageField(upload_to='hero/', blank=True, null=True)
    mobile_image = models.ImageField(upload_to='hero/mobile/', blank=True, null=True)
    video = models.FileField(
        upload_to='hero/videos/', blank=True, null=True,
        help_text='Compressed MP4 (H.264) recommended. Keep under 8-12 MB for fast loading.',
    )
    poster = models.ImageField(
        upload_to='hero/posters/', blank=True, null=True,
        help_text='Poster image shown instantly while video loads. Highly recommended.',
    )
    order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Hero Slide'
        verbose_name_plural = 'Hero Slides'

    def __str__(self):
        return f"{self.order}. {self.title}"


class Inclusion(models.Model):
    CATEGORY_CHOICES = [
        ('kitchen', 'Kitchen'),
        ('bathroom', 'Bathroom'),
        ('electrical', 'Electrical'),
        ('flooring', 'Flooring'),
        ('facade', 'Facade'),
        ('living', 'Living'),
        ('exterior', 'Exterior'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='inclusions/', blank=True, null=True)
    pdf = models.FileField(
        upload_to='inclusions/pdfs/', blank=True, null=True,
        help_text='Optional inclusions PDF brochure (downloadable on the site).',
    )
    icon = models.CharField(max_length=100, blank=True, help_text='Lucide icon name or emoji')
    features = models.JSONField(default=list, blank=True, help_text='List of feature strings')
    order = models.PositiveIntegerField(default=0)
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'title']
        verbose_name = 'Inclusion'
        verbose_name_plural = 'Inclusions'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['published', 'featured']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150, blank=True, help_text='e.g. Homeowner, Suburb NSW')
    suburb = models.CharField(max_length=150, blank=True)
    design = models.CharField(max_length=150, blank=True, help_text='Design or package name')
    review = models.TextField(blank=True, help_text='Optional if video only')
    rating = models.PositiveSmallIntegerField(default=5)
    photo = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    video = models.FileField(upload_to='testimonials/videos/', blank=True, null=True,
        help_text='Upload mp4 video testimonial')
    video_url = models.URLField(blank=True, help_text='Or YouTube/Vimeo URL')
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-featured', '-created_at']
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'

    def __str__(self):
        return f"{self.name} — {self.rating}★"


class SiteSetting(models.Model):
    """Singleton site settings."""
    company_name = models.CharField(max_length=150, default='ReyHomes')
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    logo = models.ImageField(upload_to='settings/', blank=True, null=True)
    footer_logo = models.ImageField(upload_to='settings/', blank=True, null=True)
    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    youtube = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.company_name or 'Site Settings'

    def save(self, *args, **kwargs):
        # Enforce singleton
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

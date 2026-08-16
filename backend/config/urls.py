import re
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as static_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('homes.urls')),
    path('api/', include('land.urls')),
    path('api/', include('projects.urls')),
    path('api/', include('core.urls')),
    path('api/', include('enquiries.urls')),
    path('api/', include('accounts.urls')),
    path('api/pro/', include('pro.urls')),
]

# Local media serving only when NOT using S3.
# With USE_S3=True, files are served directly from the S3 bucket/CDN.
if not getattr(settings, 'USE_S3', False):
    # django.conf.urls.static.static() silently no-ops when DEBUG=False, so we
    # wire the serve view directly for local / Render-disk media.
    urlpatterns += [
        re_path(
            r'^%s(?P<path>.*)$' % re.escape(settings.MEDIA_URL.lstrip('/')),
            static_serve,
            {'document_root': settings.MEDIA_ROOT},
        ),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin
admin.site.site_header = "ReyHomes CMS"
admin.site.site_title = "ReyHomes Admin"
admin.site.index_title = "Welcome to ReyHomes Content Management"

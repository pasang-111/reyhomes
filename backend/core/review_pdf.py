"""Generate a combined floorplan + inclusions review PDF."""
from __future__ import annotations

import hashlib
import io
from pathlib import Path
from typing import Any, Iterable

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


PAGE = A4
MARGIN = 18 * mm


def _cache_key(kind: str, slug: str, fingerprint: str) -> str:
    return f"reviews/{kind}/{slug}-{fingerprint[:16]}.pdf"


def _fingerprint(parts: Iterable[str]) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update((p or "").encode("utf-8", errors="ignore"))
        h.update(b"\0")
    return h.hexdigest()


def _draw_wrapped(c: canvas.Canvas, text: str, x: float, y: float, max_width: float, font="Helvetica", size=11, leading=14):
    c.setFont(font, size)
    words = (text or "").split()
    line = []
    for w in words:
        trial = " ".join(line + [w])
        if c.stringWidth(trial, font, size) <= max_width:
            line.append(w)
        else:
            if line:
                c.drawString(x, y, " ".join(line))
                y -= leading
            line = [w]
    if line:
        c.drawString(x, y, " ".join(line))
        y -= leading
    return y


def _try_image(field) -> ImageReader | None:
    if not field:
        return None
    try:
        field.open("rb")
        data = field.read()
        field.close()
        return ImageReader(io.BytesIO(data))
    except Exception:
        return None


def build_review_pdf(
    *,
    title: str,
    subtitle: str,
    floor_plan_field,
    inclusions: list[dict[str, Any]],
    kind: str,
    slug: str,
) -> tuple[str, bytes]:
    """
    Build (and cache) a multi-page PDF.
    Returns (storage_path_or_url_key, pdf_bytes).
    """
    fp_parts = [title, subtitle, str(getattr(floor_plan_field, "name", "") or "")]
    for inc in inclusions:
        fp_parts.extend(
            [
                str(inc.get("id", "")),
                str(inc.get("title", "")),
                str(inc.get("description", "")),
                str(inc.get("image_name", "")),
                str(inc.get("updated", "")),
            ]
        )
    fingerprint = _fingerprint(fp_parts)
    key = _cache_key(kind, slug, fingerprint)

    if default_storage.exists(key):
        with default_storage.open(key, "rb") as f:
            return key, f.read()

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=PAGE)
    width, height = PAGE

    # Cover / floorplan page
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN, height - MARGIN - 10, title or "Review")
    c.setFont("Helvetica", 12)
    c.drawString(MARGIN, height - MARGIN - 28, subtitle or "")

    img = _try_image(floor_plan_field)
    if img:
        max_w = width - 2 * MARGIN
        max_h = height - 2 * MARGIN - 50
        iw, ih = img.getSize()
        scale = min(max_w / iw, max_h / ih)
        dw, dh = iw * scale, ih * scale
        c.drawImage(
            img,
            MARGIN + (max_w - dw) / 2,
            MARGIN + 10,
            width=dw,
            height=dh,
            preserveAspectRatio=True,
            mask="auto",
        )
    else:
        c.setFont("Helvetica", 12)
        c.drawString(MARGIN, height / 2, "Floor plan image not available.")
    c.showPage()

    # One page per inclusion
    for inc in inclusions:
        c.setFont("Helvetica-Bold", 18)
        c.drawString(MARGIN, height - MARGIN - 8, inc.get("title") or "Inclusion")
        y = height - MARGIN - 30
        c.setFont("Helvetica", 10)
        if inc.get("category"):
            c.drawString(MARGIN, y, f"Category: {inc['category']}")
            y -= 16

        img = _try_image(inc.get("image_field"))
        if img:
            max_w = width - 2 * MARGIN
            max_h = height * 0.45
            iw, ih = img.getSize()
            scale = min(max_w / iw, max_h / ih)
            dw, dh = iw * scale, ih * scale
            c.drawImage(
                img,
                MARGIN + (max_w - dw) / 2,
                y - dh - 8,
                width=dw,
                height=dh,
                preserveAspectRatio=True,
                mask="auto",
            )
            y = y - dh - 20

        desc = inc.get("description") or ""
        if desc:
            y = _draw_wrapped(c, desc, MARGIN, y, width - 2 * MARGIN, size=11, leading=14)
            y -= 8

        features = inc.get("features") or []
        if features:
            c.setFont("Helvetica-Bold", 12)
            c.drawString(MARGIN, y, "Features")
            y -= 16
            c.setFont("Helvetica", 11)
            for feat in features:
                if y < MARGIN + 20:
                    c.showPage()
                    y = height - MARGIN
                    c.setFont("Helvetica", 11)
                c.drawString(MARGIN + 8, y, f"• {feat}")
                y -= 14
        c.showPage()

    c.save()
    pdf_bytes = buf.getvalue()
    default_storage.save(key, ContentFile(pdf_bytes))
    return key, pdf_bytes


def inclusion_payload_from_link(link, request=None) -> dict[str, Any]:
    """Build inclusion dict for PDF + JSON review from a DesignInclusion/PackageInclusion link."""
    from core.media_urls import absolute_media_url

    inc = link.inclusion
    image_url = None
    pdf_url = None
    if request is not None:
        if inc.image:
            image_url = absolute_media_url(request, inc.image.url)
        if getattr(inc, "pdf", None):
            pdf_url = absolute_media_url(request, inc.pdf.url)
    features = inc.features if isinstance(inc.features, list) else []
    return {
        "id": inc.id,
        "title": inc.title,
        "slug": inc.slug,
        "category": getattr(inc, "category", "") or "",
        "description": getattr(inc, "description", "") or "",
        "features": features,
        "image_url": image_url,
        "pdf_url": pdf_url,
        "image_field": inc.image if inc.image else None,
        "image_name": getattr(inc.image, "name", "") if inc.image else "",
        "updated": str(getattr(inc, "updated_at", "") or ""),
        "order": link.order,
    }

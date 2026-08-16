# Render setup (ReyHomes backend)

Deploy **Django API + Admin + Postgres** on Render free tier.  
Frontend stays on **Vercel** (`frontend/` folder).

Your service URL will look like:

```text
https://reyhomes-backend-xxxx.onrender.com
```

---

## 1. Push the repo

```bash
cd reyhomes_new
git remote add origin https://github.com/pasang-111/reyhomes.git
git push -u origin main
```

---

## 2. Create services

### Option A — Blueprint (easiest)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect `pasang-111/reyhomes`
3. Render reads `render.yaml` and creates:
   - `reyhomes-db` (PostgreSQL free)
   - `reyhomes-backend` (Python web)
4. Fill secrets when prompted:

| Variable | Example |
|----------|---------|
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_EMAIL` | you@email.com |
| `DJANGO_SUPERUSER_PASSWORD` | strong password |

5. Apply → wait until **Live**

### Option B — Manual

1. **New PostgreSQL** → free → note internal credentials  
2. **New Web Service** → same repo  
   - **Root directory:** `backend`  
   - **Build command:**
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py createsuperuser --noinput || true
     ```
   - **Start command:**
     ```bash
     gunicorn config.wsgi:application
     ```

---

## 3. Environment variables (critical)

After the first deploy, open the web service → **Environment**.

### Must set (avoids 400 Bad Request)

| Key | Value |
|-----|--------|
| `ALLOWED_HOSTS` | **Exact** host only, e.g. `reyhomes-backend-nx6h.onrender.com` (no `https://`) |

`settings.py` also auto-adds `RENDER_EXTERNAL_HOSTNAME`, but set `ALLOWED_HOSTS` correctly in the dashboard anyway.

### Core

| Key | Value |
|-----|--------|
| `DEBUG` | `False` |
| `USE_SQLITE` | `False` |
| `SECRET_KEY` | Generate (or long random string) |
| `SECURE_SSL_REDIRECT` | `True` |
| `SESSION_COOKIE_SECURE` | `True` |
| `CSRF_COOKIE_SECURE` | `True` |

### Database (Blueprint usually auto-links these)

`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

### CORS / CSRF (after Vercel URL exists)

| Key | Value |
|-----|--------|
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://reyhomes-backend-xxxx.onrender.com,https://your-app.vercel.app` |

Include **both** backend and frontend origins in `CSRF_TRUSTED_ORIGINS` (with `https://`).

### Media (pick one)

**Simple free test (no external storage)**  

| Key | Value |
|-----|--------|
| `USE_S3` | `False` |
| `USE_CLOUDINARY` | `False` |

Uploads live on the instance disk and are **wiped on every redeploy**.

**Permanent free media — Cloudinary**  

| Key | Value |
|-----|--------|
| `USE_CLOUDINARY` | `True` |
| `USE_S3` | `False` |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | … |
| `CLOUDINARY_API_SECRET` | … |

**S3 / R2** — set `USE_S3=True` and the `AWS_*` keys (see `DEPLOYMENT_SETUP.md`).

### Superuser (first deploy)

| Key | Value |
|-----|--------|
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_EMAIL` | your email |
| `DJANGO_SUPERUSER_PASSWORD` | strong password |

If logs say “username already taken”, the user already exists — log in with the old password or reset via Render shell:

```bash
python manage.py changepassword admin
```

---

## 4. After env changes

**Manual Deploy** (Save alone is not always enough).

---

## 5. Verify

| URL | Expected |
|-----|----------|
| `https://YOUR-BACKEND.onrender.com/admin/` | Login → Unfold admin |
| `https://YOUR-BACKEND.onrender.com/api/designs/` | JSON list (not 400) |
| `https://YOUR-BACKEND.onrender.com/api/testimonials/` | JSON |
| `https://YOUR-BACKEND.onrender.com/api/projects/?status=upcoming` | JSON |
| `https://YOUR-BACKEND.onrender.com/api/wishlist/` | **401** without token (correct) |

---

## 6. Wire Vercel

On Vercel project → Environment:

```text
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com
```

No trailing slash. Then update Render `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` to your Vercel URL and redeploy backend once.

---

## Common errors

| Problem | Fix |
|---------|-----|
| **400 on every request** | `ALLOWED_HOSTS` ≠ real host. Set exact hostname, redeploy. |
| **CORS in browser** | `CORS_ALLOWED_ORIGINS` must be exact Vercel origin with `https://`. |
| **Admin CSRF failed** | Add backend URL to `CSRF_TRUSTED_ORIGINS`. |
| **Images gone after deploy** | Local disk wiped. Enable Cloudinary or R2/S3. |
| **Slow first load** | Free tier sleeps after ~15 min idle; cold start 30–60s. |
| **Empty testimonials / projects** | Add **published** content in Admin (and video URL for tours). |

---

## Build / start reference

Already in `render.yaml`:

- **Root:** `backend`  
- **Build:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py createsuperuser --noinput || true`  
- **Start:** `gunicorn config.wsgi:application`  

---

## Related docs

| File | Topic |
|------|--------|
| `FREE_DEPLOY.md` | Full free stack overview |
| `DEPLOYMENT_SETUP.md` | End-to-end guide |
| `CLOUDINARY_SETUP.md` | Permanent free media |
| `render.yaml` | Blueprint definition |

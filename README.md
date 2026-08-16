databases:
  - name: reyhomes-db
    plan: free
    databaseName: reyhomes
    user: reyhomes

services:
  - type: web
    name: reyhomes-backend
    runtime: python
    plan: free
    rootDir: backend
    buildCommand: "pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py createsuperuser --noinput || true"
    startCommand: "gunicorn config.wsgi:application"
    # NOTE: free web services don't support persistent disks, so uploaded
    # media (photos/PDFs) will be wiped on every redeploy. Fine for testing.
    # When you're ready for real use, upgrade to a paid plan and add a disk
    # block back (see DEPLOY.md), or move media to S3/Cloudinary.
    envVars:
      - key: DJANGO_SUPERUSER_USERNAME
        sync: false
      - key: DJANGO_SUPERUSER_EMAIL
        sync: false
      - key: DJANGO_SUPERUSER_PASSWORD
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: "False"
      - key: USE_SQLITE
        value: "False"
      - key: ALLOWED_HOSTS
        value: "reyhomes-backend.onrender.com"
      - key: DB_NAME
        fromDatabase:
          name: reyhomes-db
          property: database
      - key: DB_USER
        fromDatabase:
          name: reyhomes-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: reyhomes-db
          property: password
      - key: DB_HOST
        fromDatabase:
          name: reyhomes-db
          property: host
      - key: DB_PORT
        fromDatabase:
          name: reyhomes-db
          property: port
      - key: CORS_ALLOWED_ORIGINS
        value: "https://your-frontend.vercel.app"
      - key: CSRF_TRUSTED_ORIGINS
        value: "https://your-frontend.vercel.app"
      - key: SECURE_SSL_REDIRECT
        value: "True"
      - key: SESSION_COOKIE_SECURE
        value: "True"
      - key: CSRF_COOKIE_SECURE
        value: "True"
      - key: JWT_ACCESS_MINUTES
        value: "30"
      - key: JWT_REFRESH_DAYS
        value: "14"

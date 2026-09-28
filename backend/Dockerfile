FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/lock.txt /tmp/requirements.txt
RUN python -m pip install -r /tmp/requirements.txt

COPY . /app

RUN useradd --create-home --uid 10001 app \
    && mkdir -p /app/media /app/staticfiles \
    && chown -R app:app /app

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
    CMD curl --fail --silent http://127.0.0.1:8000/api/v1/health/ >/dev/null || exit 1

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3} --threads ${GUNICORN_THREADS:-2} --timeout ${GUNICORN_TIMEOUT:-60} --access-logfile - --error-logfile -"]

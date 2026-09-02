from pathlib import Path

from decouple import Csv, config


BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = config(
    "DJANGO_SECRET_KEY"
)

DEBUG = config(
    "DJANGO_DEBUG",
    default=False,
    cast=bool,
)

ALLOWED_HOSTS = config(
    "DJANGO_ALLOWED_HOSTS",
    default="localhost,127.0.0.1",
    cast=Csv(),
)


DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]


THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "corsheaders",
]


LOCAL_APPS = [
    "core",
    "accounts",
    "catalog",
    "inventory",
    "promotions",
    "checkout",
    "orders",
    "owner_console",
    "notifications",
]


INSTALLED_APPS = (
    DJANGO_APPS
    + THIRD_PARTY_APPS
    + LOCAL_APPS
)


AUTH_USER_MODEL = "accounts.User"


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    "core.security_middleware.AdminLoginRateLimitMiddleware",

    "core.security_middleware.OwnerTokenExpiryMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"

ASGI_APPLICATION = "config.asgi.application"


TEMPLATES = [
    {
        "BACKEND": (
            "django.template.backends."
            "django.DjangoTemplates"
        ),

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                (
                    "django.template.context_processors."
                    "request"
                ),

                (
                    "django.contrib.auth.context_processors."
                    "auth"
                ),

                (
                    "django.contrib.messages.context_processors."
                    "messages"
                ),
            ],
        },
    },
]


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",

        "NAME": config(
            "DB_NAME"
        ),

        "USER": config(
            "DB_USER"
        ),

        "PASSWORD": config(
            "DB_PASSWORD"
        ),

        "HOST": config(
            "DB_HOST",
            default="localhost",
        ),

        "PORT": config(
            "DB_PORT",
            default="5432",
        ),

        "CONN_MAX_AGE": 60,

        "CONN_HEALTH_CHECKS": True,
    },
}


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },

    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),

        "OPTIONS": {
            "min_length": 12,
        },
    },

    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },

    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


LANGUAGE_CODE = "fr-fr"

TIME_ZONE = config(
    "APP_TIME_ZONE",
    default="Africa/Bamako",
)

USE_I18N = True

USE_TZ = True


STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)


CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000",
    cast=Csv(),
)

CORS_ALLOW_CREDENTIALS = True


CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:3000",
    cast=Csv(),
)


REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        (
            "rest_framework.permissions."
            "IsAuthenticatedOrReadOnly"
        ),
    ],

    "DEFAULT_FILTER_BACKENDS": [
        (
            "django_filters.rest_framework."
            "DjangoFilterBackend"
        ),

        "rest_framework.filters.SearchFilter",

        "rest_framework.filters.OrderingFilter",
    ],

    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination."
        "PageNumberPagination"
    ),

    "PAGE_SIZE": 24,

    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],

    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
}


REDIS_URL = config(
    "REDIS_URL",
    default="redis://127.0.0.1:6379/0",
)

CELERY_BROKER_URL = REDIS_URL

CELERY_RESULT_BACKEND = REDIS_URL

CELERY_ACCEPT_CONTENT = [
    "json",
]

CELERY_TASK_SERIALIZER = "json"

CELERY_RESULT_SERIALIZER = "json"

CELERY_TIMEZONE = TIME_ZONE

CELERY_ENABLE_UTC = True


# ============================================================
# SÉCURITÉ APPLICATION / AUTHENTIFICATION
# ============================================================

OWNER_TOKEN_MAX_AGE_SECONDS = config(
    "OWNER_TOKEN_MAX_AGE_SECONDS",
    default=60 * 60 * 12,
    cast=int,
)

OWNER_LOGIN_THROTTLE_RATE = config(
    "OWNER_LOGIN_THROTTLE_RATE",
    default="10/minute",
)

CHECKOUT_CREATE_THROTTLE_RATE = config(
    "CHECKOUT_CREATE_THROTTLE_RATE",
    default="30/hour",
)

ORDER_CREATE_THROTTLE_RATE = config(
    "ORDER_CREATE_THROTTLE_RATE",
    default="60/hour",
)

ADMIN_LOGIN_MAX_ATTEMPTS = config(
    "ADMIN_LOGIN_MAX_ATTEMPTS",
    default=5,
    cast=int,
)

ADMIN_LOGIN_WINDOW_SECONDS = config(
    "ADMIN_LOGIN_WINDOW_SECONDS",
    default=300,
    cast=int,
)


SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_AGE = 60 * 60 * 12
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"

X_FRAME_OPTIONS = "DENY"

SECURE_CONTENT_TYPE_NOSNIFF = True

SECURE_REFERRER_POLICY = (
    "strict-origin-when-cross-origin"
)

SECURE_CROSS_ORIGIN_OPENER_POLICY = (
    "same-origin"
)


# ============================================================
# HTTPS / PRODUCTION
#
# Ces valeurs restent désactivées en développement local.
# En production HTTPS, elles seront activées via .env.
# ============================================================

SECURE_SSL_REDIRECT = config(
    "DJANGO_SECURE_SSL_REDIRECT",
    default=False,
    cast=bool,
)

SESSION_COOKIE_SECURE = config(
    "DJANGO_SESSION_COOKIE_SECURE",
    default=False,
    cast=bool,
)

CSRF_COOKIE_SECURE = config(
    "DJANGO_CSRF_COOKIE_SECURE",
    default=False,
    cast=bool,
)

SECURE_HSTS_SECONDS = config(
    "DJANGO_SECURE_HSTS_SECONDS",
    default=0,
    cast=int,
)

SECURE_HSTS_INCLUDE_SUBDOMAINS = config(
    "DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=False,
    cast=bool,
)

SECURE_HSTS_PRELOAD = config(
    "DJANGO_SECURE_HSTS_PRELOAD",
    default=False,
    cast=bool,
)

TRUST_PROXY_SSL_HEADER = config(
    "DJANGO_TRUST_PROXY_SSL_HEADER",
    default=False,
    cast=bool,
)

if TRUST_PROXY_SSL_HEADER:
    SECURE_PROXY_SSL_HEADER = (
        "HTTP_X_FORWARDED_PROTO",
        "https",
    )


DATA_UPLOAD_MAX_MEMORY_SIZE = (
    10 * 1024 * 1024
)

DATA_UPLOAD_MAX_NUMBER_FIELDS = 2000
DATA_UPLOAD_MAX_NUMBER_FILES = 30


LOGGING = {
    "version": 1,

    "disable_existing_loggers": False,

    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },

    "root": {
        "handlers": [
            "console",
        ],

        "level": "INFO",
    },
}
WEBPUSH_VAPID_PUBLIC_KEY = config(
    "WEBPUSH_VAPID_PUBLIC_KEY",
    default="",
)

WEBPUSH_VAPID_PRIVATE_KEY = config(
    "WEBPUSH_VAPID_PRIVATE_KEY",
    default="",
)

WEBPUSH_VAPID_SUBJECT = config(
    "WEBPUSH_VAPID_SUBJECT",
    default=(
        "mailto:admin@example.com"
    ),
)

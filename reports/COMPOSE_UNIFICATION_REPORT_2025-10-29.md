# Compose Service Name Unification — 2025-10-29

## Services Before/After

### Dev Services
```
backend
```

### Prod Services
```
db
backend
frontend
prometheus
```

## Diff

No changes were made as the backend service name was already "backend" in both files.

## Validation

```
time="2025-10-29T12:59:36+01:00" level=warning msg="The \"RATE_LIMIT\" variable is not set. Defaulting to a blank string."
name: chefs-mind-ai
services:
  backend:
    build:
      context: c:\Projects\Chefs-Mind-AI
      dockerfile: Dockerfile
    command:
      - node
      - dist/server/index.js
    depends_on:
      db:
        condition: service_healthy
        required: true
    environment:
      ALLOW_MEDIA_FALLBACK: "true"
      CONFIRM_CODE: change-me
      COOKIE_DOMAIN: localhost
      CORS_ORIGIN: http://localhost:5003,http://localhost:3002,http://localhost:5001,http://localhost:3000
      DATABASE_READONLY_URL: postgres://chefs:chefs@db:5432/chefsmind
      DATABASE_URL: postgres://chefs:chefs@db:5432/chefsmind
      GOOGLE_API_KEY: ""
      GOOGLE_AUTH_SMOKE_BYPASS: "0"
      GOOGLE_CLIENT_ID: ""
      GOOGLE_CLIENT_SECRET: ""
      GOOGLE_REDIRECT_URI: http://localhost:5001/auth/google/callback
      GOOGLE_SCOPES: email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets
      MEDIA_PROVIDER_DEFAULT: dall-e-3
      NEXT_PUBLIC_API_URL: http://localhost:5001
      NEXT_PUBLIC_USE_UNIVERSAL_ASK_TEST: "0"
      NODE_ENV: production
      OPENAI_API_KEY: ""
      PORT: "5000"
      RATE_LIMIT: ""
      RBAC_SMOKE_ADMIN: "0"
      SAFE_MODE: "on"
      SESSION_COOKIE_SECURE: "true"
      SESSION_SECRET: change-this-production-secret-at-least-32-chars
    networks:
      default: null
    ports:
      - mode: ingress
        target: 5000
        published: "5001"
        protocol: tcp
    restart: unless-stopped
  db:
    environment:
      POSTGRES_DB: chefsmind
      POSTGRES_PASSWORD: chefs
      POSTGRES_USER: chefs
    healthcheck:
      test:
        - CMD-SHELL
        - pg_isready -U chefs -d chefsmind
      timeout: 5s
      interval: 10s
      retries: 5
    image: postgres:15-alpine
    networks:
      default: null
    restart: always
    volumes:
      - type: volume
        source: postgres_data
        target: /var/lib/postgresql/data
        volume: {}
  frontend:
    build:
      context: c:\Projects\Chefs-Mind-AI\frontend-enhanced
      dockerfile: Dockerfile
    command:
      - npm
      - run
      - start
    depends_on:
      backend:
        condition: service_started
        required: true
    environment:
      ALLOW_MEDIA_FALLBACK: "true"
      CONFIRM_CODE: change-me
      COOKIE_DOMAIN: localhost
      CORS_ORIGIN: http://localhost:3000
      DATABASE_READONLY_URL: postgres://chefs:chefs@db:5432/chefsmind
      DATABASE_URL: postgres://chefs:chefs@db:5432/chefsmind
      GOOGLE_API_KEY: ""
      GOOGLE_AUTH_SMOKE_BYPASS: "0"
      GOOGLE_CLIENT_ID: ""
      GOOGLE_CLIENT_SECRET: ""
      GOOGLE_REDIRECT_URI: http://localhost:5001/auth/google/callback
      GOOGLE_SCOPES: email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets
      MEDIA_PROVIDER_DEFAULT: dall-e-3
      NEXT_PUBLIC_API_URL: http://localhost:5003
      NEXT_PUBLIC_USE_UNIVERSAL_ASK_TEST: "0"
      NODE_ENV: production
      OPENAI_API_KEY: ""
      PORT: "5000"
      RATE_LIMIT: "100"
      RBAC_SMOKE_ADMIN: "0"
      SAFE_MODE: "on"
      SESSION_SECRET: change-this-production-secret-at-least-32-chars
    networks:
      default: null
    ports:
      - mode: ingress
        target: 3000
        published: "3000"
        protocol: tcp
    restart: unless-stopped
  prometheus:
    command:
      - --config.file=/etc/prometheus/prometheus.yml
      - --storage.tsdb.path=/prometheus
      - --storage.tsdb.retention.time=15d
    depends_on:
      backend:
        condition: service_started
        required: true
    image: prom/prometheus:v2.53.0
    networks:
      default: null
    ports:
      - mode: ingress
        target: 9090
        published: "9090"
        protocol: tcp
    restart: unless-stopped
    volumes:
      - type: bind
        source: c:\Projects\Chefs-Mind-AI\prometheus\prometheus.yml
        target: /etc/prometheus/prometheus.yml
        read_only: true
        bind:
          create_host_path: true
      - type: volume
        source: prometheus_data
        target: /prometheus
        volume: {}
networks:
  default:
    name: chefs-mind-ai_default
volumes:
  postgres_data:
    name: chefs-mind-ai_postgres_data
  prometheus_data:
    name: chefs-mind-ai_prometheus_data
```

## Summary

Backend service name in dev: "backend"  
Backend service name in prod: "backend"  
Names match: Yes  

Validation result: Successful
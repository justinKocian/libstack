# ---------- build frontend ----------
FROM node:20-alpine AS frontend-build
WORKDIR /frontend

# Copy package manifest(s) first for better layer caching
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./

# npm ci if lockfile exists, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the frontend and build
COPY frontend/ ./
RUN npm run build

# ---------- build backend ----------
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY --from=frontend-build /frontend/dist ./frontend_dist

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level ${LOG_LEVEL:-info}"]

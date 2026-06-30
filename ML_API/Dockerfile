FROM python:3.11-slim

WORKDIR /app

# Install OS deps (if any) and Python requirements
COPY requirements.txt ./
RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 5000

CMD ["python", "app.py"]

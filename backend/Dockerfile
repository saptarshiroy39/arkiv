FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  libmagic1 \
  && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV ENV=production \
  PORT=7860 \
  PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1

RUN useradd -m -u 1000 user
WORKDIR /home/user/app

COPY pyproject.toml .
RUN uv pip install --no-cache --system -r pyproject.toml

RUN chown -R user:user /home/user/app

USER user
ENV HOME=/home/user \
  PATH=/home/user/.local/bin:$PATH

COPY --chown=user app app

EXPOSE ${PORT}

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
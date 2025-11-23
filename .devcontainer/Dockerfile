# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/typescript-node:20

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        git \
        sqlite3 \
        libsqlite3-dev \
        ca-certificates \
        libnss3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libgtk-3-0 \
        libdrm2 \
        libgbm1 \
        libxdamage1 \
        libxcomposite1 \
        libxrandr2 \
        libxkbcommon0 \
        libasound2 \
        libxshmfence1 \
        xvfb \
        wget \
        unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@latest

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

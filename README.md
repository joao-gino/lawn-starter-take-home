# SWStarter – Laravel + React SWAPI Explorer

SWStarter is a full-stack playground that wraps the public Star Wars API (SWAPI) with a Laravel backend and exposes a modern React/Vite frontend for searching characters and films. Everything is fully containerized with Docker for reproducible local setups.

## Table of Contents

- [SWStarter – Laravel + React SWAPI Explorer](#swstarter--laravel--react-swapi-explorer)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Tech Stack](#tech-stack)
  - [Directory Layout](#directory-layout)
  - [Getting Started with Docker](#getting-started-with-docker)
    - [Prerequisites](#prerequisites)
    - [1. Copy environment variables](#1-copy-environment-variables)
    - [2. Build and start services](#2-build-and-start-services)
    - [3. Run initial Artisan tasks (first run only)](#3-run-initial-artisan-tasks-first-run-only)
    - [4. Open the app](#4-open-the-app)
    - [5. Stop containers](#5-stop-containers)
  - [Backend (Laravel API)](#backend-laravel-api)
  - [Frontend (React/Vite)](#frontend-reactvite)
  - [Docker Setup Details](#docker-setup-details)
  - [Volumes \& mounts](#volumes--mounts)
  - [Troubleshooting](#troubleshooting)
  - [Further Development Ideas](#further-development-ideas)

## Project Overview

- **Goal:** Provide a polished UI for searching SWAPI people or movies, viewing detail pages, and practicing Dockerized full-stack workflows.
- **Key Features:**
  - Search form with category toggles (people/movies) and result list with CTA buttons.
  - Character detail page showing bio info plus linked films.
  - Movie detail page displaying the opening crawl with linked characters.
  - Laravel proxy layer that normalizes SWAPI responses and handles CORS.

## Tech Stack

- **Backend:** PHP 8.3, Laravel 11, Composer, SQLite (file-based), SWAPI proxy integration.
- **Frontend:** React 18, Vite, React Router, CSS Modules.
- **Infrastructure:** Docker Compose, Nginx, PHP-FPM, Node 20 development server.

## Directory Layout

```[text]
├── backend/        # Laravel application
├── frontend/       # React/Vite SPA
├── docker/         # Infrastructure assets
│   ├── php/        # PHP-FPM + Composer image
│   ├── nginx/      # Web server for Laravel API
│   └── frontend/   # Node builder/runtime image
├── docker-compose.yml
└── README.md
```

## Getting Started with Docker

### Prerequisites

- Docker Engine ≥ 24.x
- Docker Compose Plugin ≥ 2.20
- (Optional) `make` if you plan to add helper commands.

### 1. Copy environment variables

```bash
cp backend/.env.example backend/.env
```

Adjust `APP_URL`, database path, and other settings as needed.

### 2. Build and start services

```bash
docker compose up --build
```

This will:

- Build the PHP-FPM image (with Composer) and install Laravel dependencies automatically.
- Build the Nginx container serving the Laravel public directory.
- Build the Vite/Node container and run `npm run dev -- --host 0.0.0.0`.

### 3. Run initial Artisan tasks (first run only)

```bash
docker compose exec php php artisan key:generate
docker compose exec php php artisan migrate
```

### 4. Open the app

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API (via Nginx): [http://localhost:8080/api](http://localhost:8080/api)

### 5. Stop containers

```bash
docker compose down
```

Add `-v` to remove named volumes if needed.

## Backend (Laravel API)

- `routes/api.php` declares the SWAPI proxy endpoints.
- `app/Http/Controllers/SwapiController.php` handles outbound SWAPI requests, caching, and response normalization.
- `config/cors.php` allows the Vite dev origin.
- Uses SQLite (`database/database.sqlite`) so no external DB is required.

Common commands (inside container):

```bash
docker compose exec php php artisan test
docker compose exec php php artisan tinker
```

## Frontend (React/Vite)

- `src/pages/Home.jsx` – search UI and results list with CTA buttons.
- `src/pages/PersonDetail.jsx` & `MovieDetail.jsx` – match provided mockups with responsive CSS Modules.
- `vite.config.js` – Dev proxy targeting the Nginx service so API calls work inside Docker.

Useful commands (inside container):

```bash
docker compose exec frontend npm run lint
```

## Docker Setup Details

| Service    | Role                         | Highlights |
|------------|------------------------------|------------|
| `php`      | Runs Laravel via PHP-FPM      | Installs Composer deps on start (`composer install && php-fpm`). |
| `nginx`    | Serves Laravel public dir     | Exposes port 8080 on host. |
| `frontend` | Runs Vite dev server          | Exposes port 5173 with hot reload. |

## Volumes & mounts

- `./backend:/var/www/html` – Laravel source.
- `./backend/vendor:/var/www/html/vendor` – Keeps Composer deps in sync.
- `./frontend:/app` and `/app/node_modules` – React source with container-managed deps.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| PHP autoload errors | Delete `backend/vendor` on host and re-run `docker compose up` so Composer reinstalls dependencies with correct permissions. |
| Frontend cannot reach API | Ensure Vite proxy points to `swapi-nginx` and that containers are running. |
| `node_modules` permission denied | Remove host `frontend/node_modules`; the container recreates it via anonymous volume. |

## Further Development Ideas

- Add episode metadata (director, release date) to the movie detail page.
- Implement pagination or infinite scroll for SWAPI results.
- Add Redis/queue containers for caching and job handling.
- Create a production-ready Dockerfile that builds the React app and serves it through Nginx with Laravel API.

May the Docker be with you!

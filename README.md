# SWStarter – Laravel + React SWAPI Explorer

SWStarter is a Dockerized full-stack playground that wraps the public Star Wars API (SWAPI) with a Laravel backend and a React/Vite frontend. It adds request tracking, queued background processing, and scheduled aggregation so you can monitor overall API performance.

## Table of Contents

- [SWStarter – Laravel + React SWAPI Explorer](#swstarter--laravel--react-swapi-explorer)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Tech Stack](#tech-stack)
  - [Directory Layout](#directory-layout)
  - [Docker Services](#docker-services)
  - [Getting Started with Docker](#getting-started-with-docker)
    - [1. Environment setup](#1-environment-setup)
    - [2. Build and start the stack](#2-build-and-start-the-stack)
    - [3. Access the services](#3-access-the-services)
    - [4. Tear down](#4-tear-down)
  - [Queue \& Scheduler](#queue--scheduler)
  - [Statistics API](#statistics-api)
  - [Backend (Laravel API)](#backend-laravel-api)
  - [Frontend (React/Vite)](#frontend-reactvite)
  - [Troubleshooting](#troubleshooting)
  - [Further Development Ideas](#further-development-ideas)

## Project Overview

- **Goal:** Provide a polished UI for searching SWAPI people or movies, viewing detail pages, and practicing Dockerized full-stack workflows.
- **Key Features:**
  - Search form with category toggles (people/movies) and a CTA list.
  - Character + movie detail pages that mirror provided mocks.
  - Laravel proxy layer that normalizes SWAPI responses and implements CORS.
  - Request logging, queue processing, and scheduled aggregations for performance insights.

## Tech Stack

- **Backend:** PHP 8.3, Laravel 11, Composer, MySQL 8 (containerized), SWAPI proxy integration.
- **Frontend:** React 18, Vite, React Router, CSS Modules.
- **Infrastructure:** Docker Compose, Nginx, PHP-FPM, queue worker, scheduler worker.

## Directory Layout

```
├── backend/        # Laravel application
├── frontend/       # React/Vite SPA
├── docker/         # Infrastructure assets
│   ├── php/
│   ├── nginx/
│   └── frontend/
├── docker-compose.yml
└── README.md
```

## Docker Services

| Service    | Description | Ports |
|------------|-------------|-------|
| `php`      | PHP-FPM + Composer. Installs dependencies and runs migrations before booting PHP-FPM. | internal only |
| `nginx`    | Serves the Laravel `public` directory and proxies PHP requests to the `php` container. | `8080 -> 80` |
| `frontend` | Vite dev server for the React app with hot reload. | `5173 -> 5173` |
| `mysql`    | MySQL 8 data store used by Laravel (metrics, queue tables, etc.). | `3306 -> 3306` |
| `scheduler`| Runs `php artisan schedule:work` to execute scheduled jobs (metrics recompute every 5 minutes). | internal |
| `queue`    | Runs `php artisan queue:work --tries=3` to process queued jobs such as `LogRequestEvent` and `RecomputeRequestMetrics`. | internal |

> **Health checks:** The `php` service runs `php artisan migrate:status` and depends on MySQL’s health check so your stack only reports healthy once both the DB and migrations are ready.

## Getting Started with Docker

### 1. Environment setup

```bash
cp backend/.env.example backend/.env
```

Update the `.env` file with your desired app URL, DB credentials (match those in `docker-compose.yml`), and SWAPI base URL. Inside the container the database hostname is `mysql`.

### 2. Build and start the stack

```bash
docker compose up --build
```

- PHP container runs `composer install`, executes `php artisan migrate --force`, then starts PHP-FPM.
- Queue and scheduler containers inherit the same image and start their respective Artisan commands.

### 3. Access the services

- **Frontend:** <http://localhost:5173>
- **Backend API:** <http://localhost:8080/api>
- **Stats endpoints:** See [Statistics API](#statistics-api).

### 4. Tear down

```bash
docker compose down
```

Add `-v` if you want to drop the MySQL volume.

## Queue & Scheduler

- `LogRequestEvent` job (dispatched from the SWAPI proxy controller) persists request metadata and durations asynchronously so user-facing latency stays low.
- `RecomputeRequestMetrics` job aggregates the data set and upserts into `request_metrics`.
- `scheduler` service runs `schedule:work`, executing the metrics job every five minutes (configured in `backend/bootstrap/app.php`).
- `queue` service executes `queue:work --tries=3`, ensuring logging and aggregation jobs are processed promptly. Adjust worker options as needed (e.g., `--sleep=1`).

To inspect queue health:

```bash
docker compose logs -f queue
```

## Statistics API

Two read-only endpoints expose the aggregated metrics:

| Endpoint | Description |
|----------|-------------|
| `GET /api/stats/average-request-time` | Returns `{ "average_response_time_ms": 185, "sample_window": { "from": "...", "to": "..." } }`. |
| `GET /api/stats/most-popular-hour` | Returns `{ "most_popular_hour": 14, "sample_window": { ... } }` where hour is 0–23. |

Values update every five minutes when the scheduler re-runs `RecomputeRequestMetrics`. If no data exists yet, defaults (0 or `null`) are returned.

## Backend (Laravel API)

- `routes/api.php` includes SWAPI proxy endpoints plus the new statistics routes.
- `app/Http/Controllers/SwapiController.php` logs every outbound request, dispatching `LogRequestEvent` with measured response time.
- `app/Jobs/LogRequestEvent.php` inserts rows into `request_events`.
- `app/Jobs/RecomputeRequestMetrics.php` calculates averages & peak hour, updating `request_metrics`.
- `bootstrap/app.php` registers the 5-minute schedule using Laravel’s new `withSchedule()` API.

Common commands (from host via Docker):

```bash
docker compose exec php php artisan test
docker compose exec php php artisan tinker
```

## Frontend (React/Vite)

- `src/pages/Home.jsx` – search UI and results list with CTA buttons tied to `/people/:id` or `/movies/:id`.
- `src/pages/PersonDetail.jsx` & `MovieDetail.jsx` – responsive detail screens with cached API calls.
- `vite.config.js` – proxies `/api` requests to the Nginx container so the frontend can call Laravel via `VITE_BACKEND_URL`.

Useful commands:

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| PHP container loops on migrations | Check `backend/.env` DB credentials; ensure MySQL volume is writable. |
| Queue jobs failing | Inspect `docker compose logs queue`; verify `QUEUE_CONNECTION=database` and tables exist. |
| Frontend 404 for stats | Ensure scheduler has run at least once; otherwise the endpoints return default values. |
| `node_modules` permission denied | Remove host `frontend/node_modules`; container manages versions via `/app/node_modules` volume. |

## Further Development Ideas

- Add Redis for queue/cache performance.
- Persist historical metric snapshots for charting.
- Create production-ready builds (Nginx serving React assets + Laravel API).
- Add authentication and rate-limiting for the statistics endpoints.

May the Docker be with you!

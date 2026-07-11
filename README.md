# 🔀 Grabber API Gateway

> **Repository `05`** · Edge entry point and reverse proxy server for the Grabber platform — built on Node.js and Express. Governs centralized request routing, WebSocket upgrades, token-based JWT decryption, Sequelize/MySQL database request audits, user rate limiting, and Prometheus metric instrumentation.

[![Platform](https://img.shields.io/badge/Platform-Node.js%20%7C%20Docker-blue.svg?style=flat-square)]()
[![Framework](https://img.shields.io/badge/Framework-Express%20v5.x-lightgrey.svg?style=flat-square)]()
[![ORM](https://img.shields.io/badge/ORM-Sequelize%20v6-blue.svg?style=flat-square)]()
[![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20Redis-blue.svg?style=flat-square)]()
[![Observability](https://img.shields.io/badge/Metrics-Prometheus%20%7C%20Grafana-orange.svg?style=flat-square)]()
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg?style=flat-square)]()
[![GitHub CI](https://github.com/thathsarabandara/05-grabber-api-gateway/actions/workflows/ci.yml/badge.svg?branch=main)]()

---

## 🎥 Video Demonstration

<div align="center">
  <a href="https://youtu.be/iKOU6gbL75o?si=zd0zLHQBlsX6m3Fw">
    <img src="https://img.youtube.com/vi/iKOU6gbL75o/maxresdefault.jpg" alt="Grabber Demo Video" width="70%">
  </a>
  <br/>
  <sub>Click the image above to watch the demonstration video on YouTube.</sub>
</div>

---

## 🧭 What Is This Repository?

The API Gateway is the **single entry point** for all network traffic directing into the Grabber microservice ecosystem. It acts as an intelligent router and gatekeeper. Neither client applications (Web Dashboards, Flutter Mobile clients) nor third-party integrations communicate directly with the backend microservices. Instead, they hit this gateway which handles cross-cutting concerns before forwarding proxy streams downstream.

### Key Core Functions
1. **Centralized Proxy Routing**: Automatically intercepts client paths and relays them downstream to internal docker container upstreams using low-overhead proxy pipes.
2. **WebSocket Upgrade Relay**: Intercepts HTTP socket upgrades at the TCP handshake layer, upgrading and routing telemetry and robot command WS threads.
3. **Database-Backed Rate Limiting**: Intercepts requests to prevent API overload, implementing IP-based caps for anonymous users and Sequelize-driven db tables limits for authenticated sessions.
4. **Request Audits & Diagnostics**: Records audit events in MySQL databases for resource updates, generates standard `x-request-id` header identifiers, and tracks duration metrics.
5. **Observability Instrumentation**: Exports active HTTP request durations and default engine metrics using `prom-client` counters for Prometheus endpoints.

---

## 📦 Project Structure

The project implements a clean layer division, separating route declarations, configurations, and middleware drivers:

```
05-grabber-api-gateway/
├── src/
│   ├── app.js               # Express application initialization and middleware routing
│   ├── server.js            # HTTP/WS server upgrades, DB connection initializations
│   ├── config/              # DB configurations, env variables parsing, Redis client exports
│   ├── controllers/         # Gateway execution logical components (Health check drivers)
│   ├── middlewares/         # JWT validation, logger, rate-limiter, Prometheus counters
│   ├── models/              # Sequelize models (ApiGatewayLog, ApiRateLimit, ApiAuditEvent)
│   ├── routes/              # Proxy mappings for microservices (Auth, Robots, Telemetry, AI)
│   ├── services/            # Custom logic helpers (system health check checkers)
│   └── utils/               # Common helper packages
├── Dockerfile               # Production multi-stage build manifest
├── docker-compose.yml       # Dev runtime environment setup (MySQL + Redis + Gateway)
├── package.json             # Core Node dependencies and run scripts
└── README.md
```

### Code Components Index

* **Startup & App Core**:
  * [src/server.js](src/server.js): Starts the Express listener. Initializes Sequelize and Redis clients, binds an upgrade listener on the HTTP server, and routes incoming WebSocket handshakes to their target services.
  * [src/app.js](src/app.js): Declares security setups (Helmet, CORS, express.json parser), applies Morgan request logger, mounts Prometheus scrapers, and maps proxy routing blocks.

* **Upstream Proxy Routers**:
  * [src/routes/auth.routes.js](src/routes/auth.routes.js): Hooks client routes containing `/api/v1/auth` and proxies requests downstream to the FastAPI auth engine.
  * [src/routes/robot.routes.js](src/routes/robot.routes.js): Relays command requests to the robot management service, validating json formats and handling service outage failures.
  * [src/routes/telemetry.routes.js](src/routes/telemetry.routes.js): Relays query paths to the telemetry collector service.
  * [src/routes/ai.routes.js](src/routes/ai.routes.js): Proxies inference actions, gesture maps, and task starts to the PyTorch/YOLO service.
  * [src/routes/health.routes.js](src/routes/health.routes.js): Gateway health handler query path.

* **Security & Pipeline Middlewares**:
  * [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js): Token verification block. Validates request headers for `Authorization: Bearer <JWT>`, checks token validity against the local gateway secret, decodes user context, and registers details on `req.user`.
  * [src/middlewares/gatewayLogger.middleware.js](src/middlewares/gatewayLogger.middleware.js): Auditing interceptor. Generates unique request UUIDs, intercepts response `finish` events, computes duration values, and logs transaction stats to `ApiGatewayLog` in MySQL.
  * [src/middlewares/gatewayRateLimiter.middleware.js](src/middlewares/gatewayRateLimiter.middleware.js): Database rate limiter for authenticated requests. Updates database request counters within a 15-minute sliding window to protect endpoints from overload.
  * [src/middlewares/gatewayAudit.middleware.js](src/middlewares/gatewayAudit.middleware.js): Log writer logging successful configuration updates to `ApiAuditEvent` tables.
  * [src/middlewares/metrics.middleware.js](src/middlewares/metrics.middleware.js): Injects Prometheus histograms to track HTTP duration percentiles.

* **Sequelize Database Models**:
  * [src/models/api_gateway_log.model.js](src/models/api_gateway_log.model.js): Model for `api_gateway_logs` storing UUID request identifiers, user IDs, target routes, request methods, response status codes, and durations.
  * [src/models/api_rate_limit.model.js](src/models/api_rate_limit.model.js): Model for `api_rate_limits` monitoring sliding window request rates.
  * [src/models/api_audit_event.model.js](src/models/api_audit_event.model.js): Model for `api_audit_events` capturing audit logs for system mutations.

* **Health Diagnostics Logic**:
  * [src/controllers/health.controller.js](src/controllers/health.controller.js) & [src/services/health.service.js](src/services/health.service.js): Runs diagnostics for the gateway, capturing operating system CPU usage, load averages, and memory statistics. It also executes concurrent health checks on downstream services to display status details.

---

## 🗺️ Routing & Upstream Table

The gateway dynamically proxies requests to downstream docker service containers.

### HTTP Routing Configuration

| Incoming Path Prefix | Upstream Docker Service Target | Auth Required | Proxy Strategy / Notes |
|---|---|---|---|
| `/api/health` | Gateway Internal Health Check | ❌ (public) | Checks system resources and queries downstream service health |
| `/api/v1/auth/*` | `http://auth-service:8001` | ❌ (public) | Strips path prefixes, forwards login/signup requests |
| `/api/v1/robots/*` | `http://robot-service:8002` | ✅ JWT | Relays joint controls, homing commands, and robot pairings |
| `/api/v1/telemetry/*` | `http://telemetry-service:8003` | ✅ JWT | Relays telemetry queries, coordinates lists, and media actions |
| `/api/v1/ai/*` | `http://ai-service:8004` | ✅ JWT | Relays inference tasks, coordinate calculations, and gesture models |
| `/uploads/gallery/*` | `http://telemetry-service:8003` | ✅ JWT  | Serves historical screenshots from the telemetry storage service |
| `/uploads/operators/*`| `http://ai-service:8004` | ✅ JWT  | Serves operator profile faces from the AI identification storage |
| `/uploads/*` | `http://auth-service:8001` | ✅ JWT  | Serves general auth attachments |
| `/metrics` | Gateway Internal Prometheus Registry| 🔒 Internal | Exposes request duration metrics |

### WebSocket Routing Configuration

The upgrade listener in [src/server.js](src/server.js#L38) proxies WebSocket TCP handshakes:

| Handshake URL Path Prefix | Upstream WebSocket Target | Purpose |
|---|---|---|
| `/api/v1/robots/ws` | `ws://robot-service:8002` | Live client-to-robot instruction stream and controls |
| `/api/v1/telemetry/ws` | `ws://telemetry-service:8003` | Real-time sensor telemetry and coordinate feeds |

---

## 🛡️ Security & Rate Limiting Engine

The gateway enforces system security rules:

### Token Decryption & Validation
The [verifyToken](src/middlewares/auth.middleware.js) validator decodes JWTs:
* Reads `Authorization: Bearer <token>` values.
* Decrypts the token signature against the `JWT_SECRET`.
* Checks the expiration date and populates `req.user` with decodes (`id`, `email`, `role`).
* Rejects requests with `401 Unauthorized` or `403 Forbidden` if validation fails.

### Dual Rate Limiter Strategy
To protect endpoints from abuse, the gateway deploys a dual rate limiter in [src/app.js](src/app.js#L24-L44):
1. **Anonymous / IP-Based Limiting**: Managed by `express-rate-limit`. Limits clients to `2000` requests per 15 minutes based on their IP address. Command streams and real-time WebSockets bypass this to prevent control lag.
2. **Database-Backed User Limiting**: Managed by [gatewayRateLimiter](src/middlewares/gatewayRateLimiter.middleware.js). Authenticated users have request rates tracked per route in the database (`api_rate_limits` table) with a 15-minute sliding window.

---

## 📊 Database Schema Specifications

The Gateway connects to a MySQL instance to store routing audit logs.

### 1. API Gateway Logs (`api_gateway_logs`)
Captures detailed diagnostic footprints for every request passing through the gateway.
```sql
CREATE TABLE IF NOT EXISTS `api_gateway_logs` (
  `id` CHAR(36) BINARY NOT NULL,              -- Primary Key UUID
  `request_id` CHAR(36) BINARY DEFAULT NULL,  -- Unique Request UUID identifier
  `user_id` CHAR(36) BINARY DEFAULT NULL,     -- Authenticated user ID (if available)
  `route` VARCHAR(255) NOT NULL,              -- Target route path
  `method` VARCHAR(10) NOT NULL,              -- Request method (GET, POST, etc.)
  `status_code` INT NOT NULL,                 -- HTTP Status Code returned
  `duration_ms` INT NOT NULL,                 -- Request processing duration (ms)
  `ip_address` VARCHAR(100) DEFAULT NULL,     -- Client IP address
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

### 2. API Rate Limits (`api_rate_limits`)
Monitors sliding window request rates for users.
```sql
CREATE TABLE IF NOT EXISTS `api_rate_limits` (
  `id` CHAR(36) BINARY NOT NULL,
  `user_id` CHAR(36) BINARY DEFAULT NULL,     -- Target User UUID
  `route` VARCHAR(255) NOT NULL,              -- Route path targeted
  `request_count` INT DEFAULT 0,              -- Number of requests made in the window
  `window_start` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

### 3. API Audit Events (`api_audit_events`)
Logs modifications to system resources.
```sql
CREATE TABLE IF NOT EXISTS `api_audit_events` (
  `id` CHAR(36) BINARY NOT NULL,
  `user_id` CHAR(36) BINARY DEFAULT NULL,     -- Modifier User UUID
  `action` VARCHAR(255) NOT NULL,             -- Action description (e.g. PAIR_ROBOT)
  `resource_type` VARCHAR(255) DEFAULT NULL,  -- Resource type altered (e.g. ROBOT)
  `resource_id` CHAR(36) BINARY DEFAULT NULL, -- UUID of the altered resource
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

---

## 📈 Observability & Prometheus Metrics

Exposes internal performance data at `/metrics` using `prom-client`:
* **HTTP Request Durations**: Evaluated using the `http_request_duration_seconds` histogram metrics, tracking execution times split by HTTP verbs, routes, and returned status code indices.
* **Process Statistics**: Captures Node.js heap allocations, event loop lag, CPU usage, and system load averages.

To scrape metrics, configure Prometheus to target `/metrics` at port `8000`:
```yaml
scrape_configs:
  - job_name: 'grabber-api-gateway'
    scrape_interval: 10s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['api-gateway:8000']
```

---

## 🚀 Getting Started

### 1. Environment Configurations
Create a `.env` configuration file in the project root:
```env
PORT=8000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=
DB_PASSWORD=
DB_NAME=grabber_gateway

# Redis configuration 
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Cryptographic Keys
JWT_SECRET=
JWT_EXPIRES_IN=24h

# Downstream Microservices URLs
AUTH_SERVICE_URL=http://localhost:8001
ROBOT_SERVICE_URL=http://localhost:8002
TELEMETRY_SERVICE_URL=http://localhost:8003
AI_SERVICE_URL=http://localhost:8004
```

### 2. Run Local Development Server
Ensure you have MySQL and Redis instances running locally, then:
```bash
# Install dependencies
npm install

# Run migration sync and start dev server with nodemon
npm run dev
```

### 3. Deploy via Docker Compose
Run the stack using Docker Compose:
```bash
# Spin up MySQL, Redis, and the Gateway server
docker compose up -d --build

# View logs to verify database connectivity
docker compose logs -f api
```

## ⚙️ CI/CD Pipeline

This project uses **GitHub Actions** for Continuous Integration and Deployment.
The pipeline consists of the following steps:
- **Checkout**: Fetch source code.
- **Environment**: Set up Node.js 20 LTS.
- **Install Dependencies**: Install NPM packages.
- **Lint**: Run npm audit and ESLint.
- **Test**: Run test suite.
- **Build**: Build Docker image.
- **Push**: Push to GitHub Container Registry (GHCR).

---

## 🔗 Related Grabber Repositories

| Repository | Purpose |
|---|---|
| [`01-grabber-architecture`](https://github.com/thathsarabandara/01-grabber-architecture) | System blueprints, MQTT schemas, and database designs |
| [`02-grabber-firmware`](https://github.com/thathsarabandara/02-grabber-firmware) | ESP32 kinematics controllers and ESP32-CAM stream endpoints |
| [`03-grabber-mobile-app`](https://github.com/thathsarabandara/03-grabber-mobile-app) | Flutter app remote teleoperation HUD |
| [`04-grabber-web-dashboard`](https://github.com/thathsarabandara/04-grabber-web-dashboard) | React operator control panel and 3D digital twin |
| [`06-grabber-auth-service`](https://github.com/thathsarabandara/06-grabber-auth-service) | Service managing user profiles, image updates, and JWT sessions |
| [`07-grabber-robot-service`](https://github.com/thathsarabandara/07-grabber-robot-service) | Service processing joint commands and homing schedules |
| [`08-grabber-telemetry-service`](https://github.com/thathsarabandara/08-grabber-telemetry-service) | Core service publishing live telemetry and webcam captures |
| [`09-grabber-ai-service`](https://github.com/thathsarabandara/09-grabber-ai-service) | Engine orchestrating autonomous jobs and computer vision tasks |
| [`11-grabber-devops-infras`](https://github.com/thathsarabandara/10-grabber-devops-infras) | Production Docker manifests, Prometheus, and Grafana stacks |

---

<div align="center">
  <sub>Part of the <strong>Grabber</strong> AI-Powered Industrial Robotic Arm Platform</sub>
</div>

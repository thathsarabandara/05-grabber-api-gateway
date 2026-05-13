# 🔀 Grabber API Gateway

> **Repository `05`** · Edge entry point for the Grabber platform — reverse proxy routing, TLS termination, JWT enforcement, rate limiting, and full observability via Prometheus + Grafana.

[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Docker-informational)]()
[![Stack](https://img.shields.io/badge/Stack-Nginx%20%7C%20Traefik-009639?logo=nginx)]()
[![Observability](https://img.shields.io/badge/Observability-Prometheus%20%2B%20Grafana-orange)]()
[![Status](https://img.shields.io/badge/Status-Planned-yellow)]()

---

## 🧭 What Is This Repository?

The API Gateway is the **single entry point** for all external traffic into the Grabber backend. No client (web, mobile, or API consumer) communicates with any service directly — every request passes through this gateway first.

**Why a dedicated gateway repo?**  
Routing, auth enforcement, rate limiting, and observability evolve independently from business logic. Keeping them here means you can update security policies, add new routes, or adjust rate limits without touching any application service.

---

## 📦 Module Structure

```
05-grabber-api-gateway/
├── nginx/                 ← Nginx reverse proxy configuration
│   ├── nginx.conf         ← Main config with upstream definitions
│   ├── routes/            ← Per-service location blocks
│   └── ssl/               ← TLS certificate references
├── traefik/               ← (Alternative) Traefik dynamic routing config
├── prometheus/
│   └── prometheus.yml     ← Scrape config for all backend services
├── grafana/
│   ├── dashboards/        ← Pre-built dashboard JSON files
│   └── provisioning/      ← Datasource and dashboard auto-provisioning
├── docker-compose.yml     ← Local gateway stack
└── README.md
```

---

## 🗺️ Routing Table

| Path Prefix | Upstream Service | Auth Required |
|---|---|---|
| `/api/auth/*` | `06-auth-service:3000` | ❌ (public) |
| `/api/robot/*` | `07-robot-service:3001` | ✅ JWT |
| `/api/telemetry/*` | `08-telemetry-service:3002` | ✅ JWT |
| `/api/ai/*` | `09-ai-service:8000` | ✅ JWT |
| `/camera/stream` | `08-telemetry-service:3002` | ✅ Signed token |
| `/metrics` | Internal Prometheus scrape | 🔒 Internal only |

---

## 🛡️ Security Features

| Feature | Implementation |
|---|---|
| **TLS Termination** | Nginx handles HTTPS; backend services run plain HTTP internally |
| **JWT Verification** | Gateway forwards `Authorization` header to Auth Service for validation |
| **Rate Limiting** | Per-IP and per-user command throttling using Nginx `limit_req` |
| **Header Normalization** | Strips client headers, injects `X-Robot-User-Id` downstream |
| **Request Shaping** | Max request body size enforced per route |
| **CORS** | Configured origin allowlist per environment |

---

## 📊 Observability Stack

### Prometheus
Scrapes metrics from:
- `06-auth-service` — login rates, token errors
- `07-robot-service` — command throughput, queue depth
- `08-telemetry-service` — WebSocket connections, message rates
- `09-ai-service` — inference latency, detection counts
- Nginx itself — request rates, error rates, upstream response times

### Grafana
Pre-built dashboards for:
- **System Overview** — all services health at a glance
- **Robot Command Flow** — command rate, latency, error rate
- **Telemetry Pipeline** — WebSocket connections, message throughput
- **AI Inference** — detection latency, model performance
- **Auth Events** — login attempts, token issuance, failures

---

## 🚀 Getting Started

### Prerequisites

- Docker + Docker Compose
- TLS certificates (or use Let's Encrypt / self-signed for development)

### Run Locally

```bash
git clone https://github.com/thathsarabandara/05-grabber-api-gateway.git
cd 05-grabber-api-gateway

# Start gateway + Prometheus + Grafana
docker compose up -d

# Verify gateway is routing
curl http://localhost:8080/api/auth/health
```

### Grafana

Access at `http://localhost:3000` (default: `admin` / `admin`).  
Dashboards are auto-provisioned on first start.

---

## 🔗 Related Repositories

| Repo | Role |
|---|---|
| [`01-grabber-architecture`](https://github.com/thathsarabandara/01-grabber-architecture) | Security model and routing design |
| [`06-grabber-auth-service`](https://github.com/thathsarabandara/06-grabber-auth-service) | JWT verification upstream |
| [`07-grabber-robot-service`](https://github.com/thathsarabandara/07-grabber-robot-service) | Command service upstream |
| [`08-grabber-telemetry-service`](https://github.com/thathsarabandara/08-grabber-telemetry-service) | Telemetry + camera upstream |
| [`09-grabber-ai-service`](https://github.com/thathsarabandara/09-grabber-ai-service) | AI service upstream |
| [`10-grabber-devops-infras`](https://github.com/thathsarabandara/10-grabber-devops-infras) | Production deployment manifests |

---

<div align="center">
  <sub>Part of the <strong>Grabber</strong> AI-Powered Industrial Robotic Arm Platform</sub>
</div>

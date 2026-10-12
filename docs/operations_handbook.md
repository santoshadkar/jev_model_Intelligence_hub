# Operations Handbook & Production Runbook - Jev Model Portal

**Role:** Finance & Operations Lead  
**Classification:** Operational Readiness & Support Guide  
**Version:** 1.0.0

---

## 1. Service Level Agreements (SLAs) & SLOs

| Metric | Target Objective | Alert Threshold | Escalation Path |
| :--- | :--- | :--- | :--- |
| **Availability / Uptime** | 99.95% monthly | < 99.9% in 1-hour window | P1 Page to DevOps On-Call |
| **API Health Probe Latency** | < 50 ms | > 200 ms for 3 consecutive checks | Auto-restart container pod |
| **Evaluation P95 Latency** | < 120 ms | > 250 ms | Scaling trigger (add container replica) |
| **Process Memory Footprint** | < 128 MB | > 384 MB (Memory leak alert) | Container restart & heap dump capture |

---

## 2. Infrastructure Health Probes & Monitoring
- **Liveness Probe:**
  `GET http://localhost:3000/api/health`
  - Expected Response: HTTP 200 with JSON `{ "status": "healthy" }`.
- **Readiness Probe:**
  Ensure the underlying evaluation model and assets are initialized and accepting TCP connections.

---

## 3. Incident Management & Disaster Recovery Runbook

### Scenario A: Container Crash / OOM
1. Check container restart count via `docker ps -a` or Kubernetes `kubectl get pods`.
2. Inspect log output: `docker logs jev-portal-app --tail 100`.
3. Check system memory usage: ensure container memory limit in `docker-compose.yml` is set to minimum 512MB.

### Scenario B: High Latency Alerts (>250ms)
1. Verify system CPU load on host.
2. If traffic exceeds 10,000 req/sec, scale container replicas:
   ```bash
   docker-compose up --scale jev-portal=3 -d
   ```
3. Ensure upstream reverse proxy (Nginx / ALB) load-balances across instances.

---

## 4. Operational Sign-Off
- [x] Cloud hosting cost model verified (<$15/month baseline per container instance).
- [x] Runbook procedures documented and tested.
- [x] Production health probes verified.
- **Operational Status:** **APPROVED FOR PRODUCTION RUNTIME**

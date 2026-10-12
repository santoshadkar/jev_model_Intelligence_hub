# Product Requirements Document (PRD) - Jev Model Portal

**Product Owner:** Lead Product Owner & Business Analyst  
**Version:** 1.0.0  
**Status:** APPROVED & READY FOR PRODUCTION

---

## 1. Product Vision & Value Proposition
Provide enterprise software architects, product managers, and developers with an interactive, authoritative portal demonstrating TypeSafe AI's **Jev Model**—the System 1 foundation model for software-level automation—contrasting it empirically against Generative LLMs and conceptually against Meta's JEPA research framework.

---

## 2. Weighted Shortest Job First (WSJF) Feature Prioritization

| Feature ID | Feature Name | User Business Value (1-10) | Time Criticality (1-10) | Risk Reduction / Opportunity (1-10) | Cost of Delay (CoD) | Job Size (1-10) | WSJF Score | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-01** | Jev vs. LLM Live Benchmark Arena | 10 | 9 | 9 | 28 | 3 | **9.33** | **P0** |
| **FEAT-02** | Interactive Architectural Diagnostic Wizard | 9 | 8 | 8 | 25 | 3 | **8.33** | **P0** |
| **FEAT-03** | Comprehensive Jev & JEPA Disambiguation Spec | 8 | 8 | 9 | 25 | 4 | **6.25** | **P1** |
| **FEAT-04** | Hands-On Evaluation Playground | 7 | 6 | 7 | 20 | 3 | **6.67** | **P1** |
| **FEAT-05** | Production Implementation Cookbooks | 7 | 7 | 6 | 20 | 3 | **6.67** | **P1** |

---

## 3. Detailed Functional Requirements

### FR-01: Interactive Benchmark Arena
- Must provide real-time side-by-side comparison across 4 representative workloads:
  1. P0 Alert Triage
  2. Zero-Latency Security Guardrail
  3. Multi-Agent Skill Router
  4. Compound AI Fact Judge
- Must display latency in milliseconds, token counts, cost per 1M executions, and raw output formatting.

### FR-02: Architectural Diagnostic Wizard
- Must guide users through a 3-step decision flow:
  1. Generative Text Requirement (Yes/No)
  2. Latency Budget (<150ms, 150-500ms, >1000ms)
  3. Output Format (Strict Schema, Free Text, Mixed)
- Must produce an actionable recommendation: **Jev Model**, **Generative LLM**, or **Compound AI (Both)** with architectural rationale.

### FR-03: Multi-Language Developer Cookbook
- Must provide copy-pasteable snippets in TypeScript and Python for:
  - Guardrail Filter
  - Tool Router
  - Factuality Evaluator

---

## 4. Non-Functional Requirements (NFR)
- **Performance:** Sub-100ms response time on all local evaluation endpoints.
- **Availability:** 99.9% uptime target with automated health probe at `/api/health`.
- **Security:** Zero plaintext credentials; strict HTTP security headers enabled.

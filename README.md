# Jev Model Intelligence & Interactive Decision Portal

> **Enterprise Portal for the Jev Foundation Model (System 1 Machine-Native Intelligence)**  
> Built with Clean Architecture, fully compliant with Enterprise SAFe and Engineering Standards.

---

## 🚀 Quick Start

### 1. Start the Portal Microservice
```bash
# In C:\Users\anany\.gemini\antigravity\scratch\jev-portal
npm start
```
The portal will launch at **http://localhost:3000**.

### 2. Run Automated Test Suite
```bash
npm test
```
Runs the 9-test unit & integration test suite verifying decoupled business logic, schema adherence, and diagnostic recommendations.

---

## 📂 Project Architecture

```
jev-portal/
├── .env                       # Environment configuration (Zero-Hardcoding standard)
├── .env.example               # Template environment configuration
├── package.json               # NPM scripts: start, test, lint
├── docs/                      # Enterprise Governance & Specifications
│   ├── pi_planning_board.md   # SAFe PI Planning Gate (RTE sign-off & ROAM board)
│   ├── user_stories_dor.md    # Product Owner Given/When/Then Acceptance Criteria (DoR)
│   ├── api_spec.json          # Solutions Architect OpenAPI 3.1.0 Contract
│   ├── jev_portal_spec.md     # Comprehensive Jev Technical Specification
│   ├── qa_test_report.md      # QA 100% Pass Audit & CAB Compliance Verification
│   └── retrospective.md       # Inspect & Adapt (I&A) Agile Retrospective
├── src/                       # Decoupled Clean Architecture
│   ├── server.js              # Standalone HTTP Server & API Dispatcher
│   └── core/
│       ├── jev_simulator.js   # Pure Jev Decision Engine & Benchmark Simulator
│       └── decision_matrix.js # Pure Architectural Diagnostic Engine
├── tests/                     # Automated Test Coverage
│   ├── jev_simulator.test.js  # Tests for decision evaluation & benchmark telemetry
│   └── decision_matrix.test.js# Tests for architectural diagnostic triage
└── public/                    # Frontend Interactive Single-Page Application
    ├── index.html             # Sleek dark-mode dashboard with Live Arena & Wizard
    ├── styles.css             # Enterprise UI styling (glassmorphism & gradients)
    └── app.js                 # Reactive client logic connecting to API & fallbacks
```

---

## 🌟 Key Features of the Portal

1. **Jev vs. Generative LLM Arena:** Live comparative telemetry across 4 enterprise workloads (P0 Alert Triage, Security Guardrail, Multi-Agent Router, and QA Fact Judge) showing latency, token count, cost, and schema integrity.
2. **Interactive Architectural Diagnostic Wizard:** A 3-question interactive diagnostic guiding architects to **Jev Model**, **Generative LLM**, or **Compound AI**.
3. **Important Disambiguation Hub:** Explains the distinct differences between **TypeSafe AI's Jev Model** (commercial System 1 decision model) and **Meta's JEPA** (Yann LeCun's latent world-model research framework).
4. **Hands-On Evaluation Playground:** Test custom queries and contextual JSON payloads to see Jev's RLCD calibrated confidence scoring in action.
5. **Production Cookbooks:** Copy-pasteable TypeScript and Python recipes for guardrails, routers, and verifiers.

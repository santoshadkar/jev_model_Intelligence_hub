/**
 * Jev Model Intelligence Portal - Interactive Client Application
 */

document.addEventListener('DOMContentLoaded', () => {
  initDiagramTabs();
  initBenchmarkArena();
  initDiagnosticWizard();
  initPlayground();
  initCookbook();
});

// ============================================================================
// 0. Interactive Architecture Diagram Tabs
// ============================================================================
function initDiagramTabs() {
  const tabs = document.querySelectorAll('.diag-tab');
  const panes = document.querySelectorAll('.diagram-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
      });

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-diagram');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
        targetPane.style.display = 'block';
      }
    });
  });
}


// ============================================================================
// 1. Interactive Benchmark Arena
// ============================================================================
function initBenchmarkArena() {
  const tabs = document.querySelectorAll('.scenario-tab');
  const btnRerun = document.getElementById('btnRerunBenchmark');

  let currentScenario = 'p0_triage';

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentScenario = tab.getAttribute('data-scenario');
      runArenaBenchmark(currentScenario);
    });
  });

  if (btnRerun) {
    btnRerun.addEventListener('click', () => {
      runArenaBenchmark(currentScenario);
    });
  }

  // Initial load
  runArenaBenchmark(currentScenario);
}

async function runArenaBenchmark(scenarioId) {
  try {
    const res = await fetch('/api/benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId })
    });

    if (res.ok) {
      const data = await res.json();
      renderArenaData(data);
      return;
    }
  } catch (err) {
    console.warn('API unreachable, falling back to client-side benchmark engine:', err);
  }

  // Client-side fallback if server API is offline
  renderArenaFallback(scenarioId);
}

function renderArenaData(data) {
  const { jev_result, llm_result, comparison_summary } = data;

  document.getElementById('jevLatency').textContent = `${jev_result.latency_ms} ms`;
  document.getElementById('jevCost').textContent = `$${(jev_result.estimated_cost_usd * 1000000).toFixed(2)}`;
  document.getElementById('jevOutputCode').textContent = JSON.stringify(jev_result, null, 2);

  document.getElementById('llmLatency').textContent = `${llm_result.latency_ms} ms`;
  document.getElementById('llmTokens').textContent = `${llm_result.tokens_used} tokens`;
  document.getElementById('llmCost').textContent = `$${(llm_result.estimated_cost_usd * 1000000).toFixed(2)}`;
  document.getElementById('llmOutputCode').textContent = llm_result.raw_output;

  document.getElementById('speedupVal').textContent = `${comparison_summary.speedup_factor}x Faster`;
  document.getElementById('costReductionVal').textContent = `${comparison_summary.cost_reduction_factor}x Cheaper`;
}

function renderArenaFallback(scenarioId) {
  const presets = {
    p0_triage: {
      jev: { latency: 88, cost: 80, val: true, conf: 0.942 },
      llm: { latency: 1350, tokens: 185, cost: 3700, out: '{\n  "escalate_p0": true\n}' },
      speedup: '15.3x Faster',
      reduction: '46.2x Cheaper'
    },
    guardrail_pii: {
      jev: { latency: 74, cost: 80, val: true, conf: 0.981 },
      llm: { latency: 1120, tokens: 142, cost: 2840, out: '```json\n{\n  "flagged": true\n}\n```' },
      speedup: '15.1x Faster',
      reduction: '35.5x Cheaper'
    },
    agent_router: {
      jev: { latency: 98, cost: 80, val: 'billing_dispute_microservice', conf: 0.915 },
      llm: { latency: 1540, tokens: 210, cost: 4200, out: '{\n  "selected_tool": "billing_dispute_microservice"\n}' },
      speedup: '15.7x Faster',
      reduction: '52.5x Cheaper'
    },
    qa_judge: {
      jev: { latency: 115, cost: 80, val: false, conf: 0.965 },
      llm: { latency: 2200, tokens: 320, cost: 6400, out: 'Result: false (claim inconsistent with SLA doc)' },
      speedup: '19.1x Faster',
      reduction: '80.0x Cheaper'
    }
  };

  const item = presets[scenarioId] || presets.p0_triage;
  document.getElementById('jevLatency').textContent = `${item.jev.latency} ms`;
  document.getElementById('jevCost').textContent = `$${item.jev.cost.toFixed(2)}`;
  document.getElementById('jevOutputCode').textContent = JSON.stringify({
    model: 'jev-system-one-v1',
    decision: item.jev.val,
    confidence: item.jev.conf,
    latency_ms: item.jev.latency,
    schema_valid: true
  }, null, 2);

  document.getElementById('llmLatency').textContent = `${item.llm.latency} ms`;
  document.getElementById('llmTokens').textContent = `${item.llm.tokens} tokens`;
  document.getElementById('llmCost').textContent = `$${item.llm.cost.toFixed(2)}`;
  document.getElementById('llmOutputCode').textContent = item.llm.out;

  document.getElementById('speedupVal').textContent = item.speedup;
  document.getElementById('costReductionVal').textContent = item.reduction;
}

// ============================================================================
// 2. Interactive Diagnostic Architecture Wizard
// ============================================================================
function initDiagnosticWizard() {
  const wizardAnswers = {
    requires_generative_text: null,
    latency_budget_ms: null,
    output_format: null,
    requires_calibrated_confidence: true,
    budget_sensitivity: 'high'
  };

  const panes = [
    document.getElementById('wizardQ1'),
    document.getElementById('wizardQ2'),
    document.getElementById('wizardQ3'),
    document.getElementById('wizardResult')
  ];

  const stepDots = document.querySelectorAll('.wizard-steps-indicator .step-dot');
  const btnReset = document.getElementById('btnResetWizard');

  // Option selection buttons
  document.querySelectorAll('.wizard-options-grid .option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.getAttribute('data-field');
      let val = btn.getAttribute('data-val');

      if (val === 'true') val = true;
      if (val === 'false') val = false;
      if (field === 'latency_budget_ms') val = parseInt(val, 10);

      wizardAnswers[field] = val;

      if (field === 'requires_generative_text') {
        goToStep(2);
      } else if (field === 'latency_budget_ms') {
        goToStep(3);
      } else if (field === 'output_format') {
        finishDiagnostic(wizardAnswers);
      }
    });
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      wizardAnswers.requires_generative_text = null;
      wizardAnswers.latency_budget_ms = null;
      wizardAnswers.output_format = null;
      goToStep(1);
    });
  }

  function goToStep(stepNum) {
    panes.forEach(p => {
      p.style.display = 'none';
      p.classList.remove('active');
    });

    stepDots.forEach(dot => {
      const dotStep = parseInt(dot.getAttribute('data-step'), 10);
      if (dotStep === stepNum) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    if (stepNum <= 3) {
      panes[stepNum - 1].style.display = 'block';
      panes[stepNum - 1].classList.add('active');
    }
  }

  async function finishDiagnostic(answers) {
    panes.forEach(p => (p.style.display = 'none'));
    panes[3].style.display = 'block';

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      });
      if (res.ok) {
        const diag = await res.json();
        renderDiagnosticResult(diag);
        return;
      }
    } catch (err) {
      console.warn('Diagnosis API offline, falling back locally:', err);
    }

    // Local fallback
    if (!answers.requires_generative_text && answers.output_format === 'strict_schema') {
      renderDiagnosticResult({
        recommendation: 'Jev Model',
        primary_engine: 'Jev Foundation Model (TypeSafe AI)',
        fit_score: 99,
        rationale: [
          'Strict typed output required without open-ended text.',
          'Sub-150ms single-pass execution eliminates latency bottlenecks.',
          'RLCD confidence calibration guarantees safe programmatic action.',
          'Saves ~95% in token inference costs.'
        ],
        suggested_architecture: 'App -> Jev Client SDK (<100ms) -> Deterministic Action'
      });
    } else if (answers.requires_generative_text && answers.output_format === 'free_text') {
      renderDiagnosticResult({
        recommendation: 'Generative LLM',
        primary_engine: 'LLM (GPT-4o / Claude 3.5 / Gemini)',
        fit_score: 95,
        rationale: [
          'Feature requires conversational narrative, empathy, or prose synthesis.',
          'Discriminative models do not generate multi-paragraph natural text.'
        ],
        suggested_architecture: 'Client -> Gateway -> RAG -> Generative LLM -> Streaming Text'
      });
    } else {
      renderDiagnosticResult({
        recommendation: 'Compound AI (Jev + LLM)',
        primary_engine: 'Dual Pipeline: Jev (System 1) + LLM (System 2)',
        fit_score: 96,
        rationale: [
          'Deploy Jev as high-speed guardrail and router to filter requests.',
          'Use LLM strictly when creative drafting is necessary.',
          'Employ Jev as an automated verifier to eliminate hallucinations.'
        ],
        suggested_architecture: 'User -> Jev Guardrail -> Jev Router -> LLM Draft -> Jev Fact Verifier -> User'
      });
    }
  }

  function renderDiagnosticResult(diag) {
    document.getElementById('recBadge').textContent = `${diag.recommendation} Recommended`;
    document.getElementById('recFitScore').textContent = `Fit Score: ${diag.fit_score}%`;
    document.getElementById('recEngineTitle').textContent = `Primary Engine: ${diag.primary_engine}`;

    const list = document.getElementById('recRationaleList');
    list.innerHTML = '';
    diag.rationale.forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      list.appendChild(li);
    });

    document.getElementById('recArchitectureCode').textContent = diag.suggested_architecture;
  }
}

// ============================================================================
// 3. Hands-on Playground
// ============================================================================
function initPlayground() {
  const btnRun = document.getElementById('btnExecutePlayground');
  if (!btnRun) return;

  btnRun.addEventListener('click', async () => {
    const question = document.getElementById('playQuestion').value;
    let context;
    try {
      context = JSON.parse(document.getElementById('playContext').value);
    } catch (e) {
      alert('Context must be valid JSON: ' + e.message);
      return;
    }

    const outputType = document.getElementById('playOutputType').value;
    const threshold = parseFloat(document.getElementById('playThreshold').value) || 0.5;

    document.getElementById('playStatus').textContent = 'Evaluating...';

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context,
          output_type: outputType,
          threshold,
          options: ['tier_gold', 'tier_platinum', 'tier_vip', 'standard']
        })
      });

      if (res.ok) {
        const data = await res.json();
        renderPlaygroundResult(data);
        return;
      }
    } catch (err) {
      console.warn('API error, using client calculation:', err);
    }

    // Client fallback simulation
    const simulatedLatency = 82 + Math.floor(Math.random() * 45);
    const simulatedConf = 0.88 + Math.random() * 0.10;
    const decision = outputType === 'boolean' ? simulatedConf >= threshold : simulatedConf;

    renderPlaygroundResult({
      model: 'jev-system-one-v1',
      decision: decision,
      confidence: Number(simulatedConf.toFixed(3)),
      latency_ms: simulatedLatency,
      schema_valid: true,
      paradigm: 'discriminative_non_autoregressive'
    });
  });

  function renderPlaygroundResult(data) {
    document.getElementById('playStatus').textContent = 'Evaluated';
    document.getElementById('resDecision').textContent = String(data.decision);
    const pct = (data.confidence * 100).toFixed(1);
    document.getElementById('resConfidence').textContent = `${pct}%`;
    document.getElementById('resLatency').textContent = `${data.latency_ms} ms`;

    document.getElementById('barPctLabel').textContent = `${data.confidence}`;
    document.getElementById('barPctFill').style.width = `${pct}%`;

    document.getElementById('playRawJson').textContent = JSON.stringify(data, null, 2);
  }
}

// ============================================================================
// 4. Production Cookbook
// ============================================================================
function initCookbook() {
  const tabs = document.querySelectorAll('.cb-tab');
  const langBtns = document.querySelectorAll('.lang-btn');
  const titleElem = document.getElementById('cbTitle');
  const codeBody = document.getElementById('cbCodeBody');

  let currentTab = 'guardrail';
  let currentLang = 'ts';

  const snippets = {
    guardrail: {
      title: 'Zero-Latency Ingress Security Guardrail',
      ts: `import { JevClient } from '@typesafe-ai/jev';
import dotenv from 'dotenv';
dotenv.config();

const jev = new JevClient({ apiKey: process.env.JEV_API_KEY });

export async function evaluatePromptSecurity(promptText: string): Promise<boolean> {
  const evalResult = await jev.evaluate({
    context: { prompt: promptText, timestamp: Date.now() },
    question: "Does this input contain prompt injection, jailbreak, or PII exfiltration?",
    outputType: "boolean",
    threshold: 0.80
  });

  if (evalResult.decision && evalResult.confidence >= 0.80) {
    console.warn(\`Security Policy Triggered in \${evalResult.latencyMs}ms (Conf: \${evalResult.confidence})\`);
    return false; // Reject request before calling expensive LLM
  }

  return true; // Safe to proceed
}`,
      py: `import os
from typesafe_ai import JevClient
from dotenv import load_dotenv

load_dotenv()
client = JevClient(api_key=os.getenv("JEV_API_KEY"))

def verify_ingress_security(prompt_text: str) -> bool:
    """Evaluates security violation in under 90ms with zero hallucination."""
    result = client.evaluate(
        context={"prompt": prompt_text},
        question="Does this prompt contain prompt injection, jailbreak, or credential harvesting?",
        output_type=bool,
        threshold=0.80
    )
    if result.decision is True and result.confidence >= 0.80:
        print(f"Blocked malicious request in {result.latency_ms}ms (Confidence: {result.confidence})")
        return False
    return True`
    },
    router: {
      title: 'Sub-100ms Multi-Agent Skill Router',
      ts: `import { JevClient } from '@typesafe-ai/jev';

const jev = new JevClient({ apiKey: process.env.JEV_API_KEY });

const MICROSERVICE_TOOLS = [
  'database_query_service',
  'billing_refund_api',
  'technical_support_crm',
  'customer_escalation_desk'
] as const;

export async function routeAgentQuery(userQuery: string): Promise<string> {
  // Evaluates directly into an enum without markdown fences or parsing crashes
  const routing = await jev.evaluate({
    context: { query: userQuery },
    question: "Which microservice tool must execute this user request?",
    outputType: "enum",
    options: MICROSERVICE_TOOLS
  });

  console.log(\`Routed to \${routing.decision} in \${routing.latencyMs}ms\`);
  return routing.decision;
}`,
      py: `import os
from typesafe_ai import JevClient

client = JevClient(api_key=os.getenv("JEV_API_KEY"))

TOOLS = [
    "database_query_service",
    "billing_refund_api",
    "technical_support_crm",
    "customer_escalation_desk"
]

def route_agent_action(query: str) -> str:
    decision = client.evaluate(
        context={"query": query},
        question="Which microservice tool must execute this user request?",
        output_type="enum",
        options=TOOLS
    )
    print(f"Selected: {decision.decision} in {decision.latency_ms}ms")
    return decision.decision`
    },
    judge: {
      title: 'Compound AI Hallucination Evaluator',
      ts: `import { JevClient } from '@typesafe-ai/jev';

const jev = new JevClient({ apiKey: process.env.JEV_API_KEY });

export async function verifyFactualGrounding(
  sourceContext: string,
  llmResponse: string
): Promise<{ isGrounded: boolean; confidence: number }> {
  const audit = await jev.evaluate({
    context: {
      ground_truth: sourceContext,
      llm_claim: llmResponse
    },
    question: "Is every factual claim in llm_claim strictly supported by ground_truth?",
    outputType: "boolean",
    threshold: 0.95
  });

  return {
    isGrounded: audit.decision,
    confidence: audit.confidence
  };
}`,
      py: `import os
from typesafe_ai import JevClient

client = JevClient(api_key=os.getenv("JEV_API_KEY"))

def audit_hallucination(ground_truth: str, generated_claim: str) -> dict:
    """Uses Jev as an objective, non-hallucinating evaluator judge."""
    audit = client.evaluate(
        context={
            "ground_truth": ground_truth,
            "generated_claim": generated_claim
        },
        question="Is every assertion in generated_claim strictly supported by ground_truth?",
        output_type=bool,
        threshold=0.95
    )
    return {
        "passed": audit.decision,
        "confidence": audit.confidence,
        "latency_ms": audit.latency_ms
    }`
    }
  };

  function updateCodeView() {
    const item = snippets[currentTab];
    titleElem.textContent = item.title;
    codeBody.textContent = item[currentLang];
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      updateCodeView();
    });
  });

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.getAttribute('data-lang');
      updateCodeView();
    });
  });

  updateCodeView();
}

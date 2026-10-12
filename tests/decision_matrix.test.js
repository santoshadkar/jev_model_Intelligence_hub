const test = require('node:test');
const assert = require('node:assert');
const { ArchitecturalDiagnosticEngine } = require('../src/core/decision_matrix');

test('ArchitecturalDiagnosticEngine - Strict Schema, Low Latency recommends Jev', () => {
  const engine = new ArchitecturalDiagnosticEngine();
  const diagnosis = engine.diagnose({
    requires_generative_text: false,
    latency_budget_ms: 150,
    output_format: 'strict_schema',
    requires_calibrated_confidence: true,
    budget_sensitivity: 'high'
  });

  assert.strictEqual(diagnosis.recommendation, 'Jev Model');
  assert.ok(diagnosis.fit_score >= 90);
  assert.ok(diagnosis.rationale.length >= 3);
  assert.ok(diagnosis.suggested_architecture.includes('Jev'));
});

test('ArchitecturalDiagnosticEngine - Free text synthesis recommends LLM', () => {
  const engine = new ArchitecturalDiagnosticEngine();
  const diagnosis = engine.diagnose({
    requires_generative_text: true,
    latency_budget_ms: 2500,
    output_format: 'free_text'
  });

  assert.strictEqual(diagnosis.recommendation, 'Generative LLM');
  assert.ok(diagnosis.primary_engine.includes('LLM'));
  assert.ok(diagnosis.suggested_architecture.includes('Generative LLM'));
});

test('ArchitecturalDiagnosticEngine - Mixed workflow recommends Compound AI', () => {
  const engine = new ArchitecturalDiagnosticEngine();
  const diagnosis = engine.diagnose({
    requires_generative_text: true,
    latency_budget_ms: 500,
    output_format: 'mixed'
  });

  assert.strictEqual(diagnosis.recommendation, 'Compound AI (Jev + LLM)');
  assert.ok(diagnosis.suggested_architecture.includes('Jev Ingress Guardrail'));
});

test('ArchitecturalDiagnosticEngine - Validation error on missing parameters', () => {
  const engine = new ArchitecturalDiagnosticEngine();

  assert.throws(() => {
    engine.diagnose({ requires_generative_text: 'not-bool', latency_budget_ms: 100 });
  }, /requires_generative_text must be boolean/);

  assert.throws(() => {
    engine.diagnose({ requires_generative_text: true, latency_budget_ms: -5 });
  }, /latency_budget_ms must be positive integer/);
});

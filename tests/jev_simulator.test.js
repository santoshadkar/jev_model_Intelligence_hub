const test = require('node:test');
const assert = require('node:assert');
const { JevCoreEngine } = require('../src/core/jev_simulator');

test('JevCoreEngine - Boolean Evaluation', () => {
  const engine = new JevCoreEngine();
  const result = engine.evaluate({
    question: 'Is this transaction suspicious?',
    context: { amount: 50000, country: 'KY' },
    output_type: 'boolean',
    threshold: 0.70
  });

  assert.strictEqual(result.model, 'jev-system-one-v1');
  assert.strictEqual(typeof result.decision, 'boolean');
  assert.strictEqual(typeof result.confidence, 'number');
  assert.ok(result.confidence >= 0 && result.confidence <= 1);
  assert.ok(result.latency_ms >= 70 && result.latency_ms <= 200);
  assert.strictEqual(result.schema_valid, true);
  assert.strictEqual(result.paradigm, 'discriminative_non_autoregressive');
});

test('JevCoreEngine - Enum Evaluation', () => {
  const engine = new JevCoreEngine();
  const options = ['billing', 'technical_support', 'general_inquiry'];
  const result = engine.evaluate({
    question: 'Which department should handle this request?',
    context: { user_message: 'My credit card was charged twice' },
    output_type: 'enum',
    options
  });

  assert.ok(options.includes(result.decision));
  assert.strictEqual(result.schema_valid, true);
});

test('JevCoreEngine - Numeric Score Evaluation', () => {
  const engine = new JevCoreEngine();
  const result = engine.evaluate({
    question: 'Rate the urgency of this ticket',
    context: { status: 'urgent' },
    output_type: 'score'
  });

  assert.strictEqual(typeof result.decision, 'number');
  assert.ok(result.decision >= 0 && result.decision <= 1);
});

test('JevCoreEngine - Input Validation Error Handling', () => {
  const engine = new JevCoreEngine();
  
  assert.throws(() => {
    engine.evaluate({ question: '', context: {} });
  }, /Invalid parameter: question/);

  assert.throws(() => {
    engine.evaluate({ question: 'valid', context: null });
  }, /Invalid parameter: context/);

  assert.throws(() => {
    engine.evaluate({ question: 'valid', context: {}, output_type: 'enum', options: [] });
  }, /options array/);
});

test('JevCoreEngine - Benchmark Runner with Comparative Telemetry', () => {
  const engine = new JevCoreEngine();
  const benchmark = engine.runBenchmark('p0_triage');

  assert.strictEqual(benchmark.scenario_id, 'p0_triage');
  assert.ok(benchmark.jev_result.latency_ms < benchmark.llm_result.latency_ms);
  assert.ok(benchmark.comparison_summary.speedup_factor > 1);
  assert.ok(benchmark.comparison_summary.cost_reduction_factor > 1);
  assert.strictEqual(benchmark.jev_result.schema_valid, true);
});

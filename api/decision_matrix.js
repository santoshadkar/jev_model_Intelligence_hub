/**
 * Jev vs. LLM Architectural Diagnostic Decision Matrix
 * Evaluates requirements and recommends optimal AI architecture.
 */

class ArchitecturalDiagnosticEngine {
  /**
   * Diagnoses requirements and returns architectural guidance.
   * @param {Object} params
   * @param {boolean} params.requires_generative_text
   * @param {number} params.latency_budget_ms
   * @param {'free_text'|'strict_schema'|'mixed'} params.output_format
   * @param {boolean} [params.requires_calibrated_confidence=false]
   * @param {'high'|'medium'|'low'} [params.budget_sensitivity='medium']
   * @returns {Object}
   */
  diagnose({
    requires_generative_text,
    latency_budget_ms,
    output_format,
    requires_calibrated_confidence = false,
    budget_sensitivity = 'medium'
  }) {
    if (typeof requires_generative_text !== 'boolean') {
      throw new Error('Invalid parameter: requires_generative_text must be boolean');
    }
    if (!latency_budget_ms || latency_budget_ms <= 0) {
      throw new Error('Invalid parameter: latency_budget_ms must be positive integer');
    }

    const rationale = [];
    let recommendation = '';
    let primaryEngine = '';
    let fitScore = 90;
    let suggestedArchitecture = '';

    // Condition 1: Pure Generative Requirement
    if (requires_generative_text && output_format === 'free_text') {
      recommendation = 'Generative LLM';
      primaryEngine = 'LLM (e.g., GPT-4o, Claude 3.5, Gemini 1.5/2.0)';
      fitScore = 96;
      rationale.push('Task requires synthesis, creative prose, conversational dialogue, or open-ended natural language.');
      rationale.push('Discriminative models like Jev do not generate natural text or multi-token narrative sequences.');
      suggestedArchitecture = 'Client -> API Gateway -> Context Augmentation / RAG -> Generative LLM -> Streaming Response';
      return {
        recommendation,
        primary_engine: primaryEngine,
        fit_score: fitScore,
        rationale,
        suggested_architecture: suggestedArchitecture
      };
    }

    // Condition 2: Strict Schema, Low Latency, Non-Generative -> Pure Jev
    if (!requires_generative_text && output_format === 'strict_schema') {
      if (latency_budget_ms <= 300) {
        fitScore = 99;
        rationale.push(`Ultra-low latency budget of ${latency_budget_ms}ms demands non-autoregressive single-pass evaluation.`);
      }
      recommendation = 'Jev Model';
      primaryEngine = 'Jev Foundation Model (TypeSafe AI)';
      rationale.push('Output is strictly typed (boolean, enum, or numeric score), making generative parsing overhead wasteful.');
      rationale.push('Guaranteed 0% syntax hallucination and deterministic schema adherence.');
      if (requires_calibrated_confidence) {
        rationale.push('RLCD probability calibration provides empirical confidence scores safe for programmatic action.');
      }
      if (budget_sensitivity === 'high') {
        rationale.push('Saves 90-98% in inference costs compared to running LLMs for classification.');
      }
      suggestedArchitecture = 'Application Service -> Jev Client SDK -> Single-Pass Decision (<150ms) -> Immediate Automated Action';
      return {
        recommendation,
        primary_engine: primaryEngine,
        fit_score: fitScore,
        rationale,
        suggested_architecture: suggestedArchitecture
      };
    }

    // Condition 3: Hybrid / Compound Architecture (Both needed)
    recommendation = 'Compound AI (Jev + LLM)';
    primaryEngine = 'Dual Engine: Jev (System 1) + LLM (System 2)';
    fitScore = 94;
    rationale.push('Workflow requires both high-speed deterministic gating/routing and human-facing natural language generation.');
    rationale.push('Deploy Jev as the ingress guardrail and tool router (<100ms) to filter 60-80% of unnecessary generative calls.');
    rationale.push('Deploy the LLM strictly for content synthesis, followed by Jev as a factual hallucination judge.');
    suggestedArchitecture = 'User -> Jev Ingress Guardrail -> Jev Router -> (If Generative) LLM Synthesis -> Jev Factuality Auditor -> Client';

    return {
      recommendation,
      primary_engine: primaryEngine,
      fit_score: fitScore,
      rationale,
      suggested_architecture: suggestedArchitecture
    };
  }
}

module.exports = { ArchitecturalDiagnosticEngine };

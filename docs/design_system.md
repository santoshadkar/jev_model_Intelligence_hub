# Design System & UI/UX Specifications - Jev Portal

**Role:** Principal UI/UX Designer  
**Classification:** Visual Design & Token Specifications  
**Version:** 1.0.0

---

## 1. Color Palette & Design Tokens

```css
:root {
  /* Surfaces */
  --bg-primary: #0a0d14;         /* Deep canvas black */
  --bg-secondary: #0f1523;       /* Surface elevation 1 */
  --bg-card: rgba(18, 25, 41, 0.7); /* Translucent glass card */
  --bg-card-hover: rgba(26, 36, 58, 0.85);

  /* Accents */
  --accent-cyan: #00e5ff;        /* Jev Primary brand highlight */
  --accent-cyan-glow: rgba(0, 229, 255, 0.25);
  --accent-purple: #a855f7;      /* LLM Generative contrast */
  --accent-purple-glow: rgba(168, 85, 247, 0.25);
  --accent-green: #10b981;       /* Schema valid & 100% adherence */
  --accent-orange: #f59e0b;      /* Token count & warning */

  /* Typography */
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 2. Micro-Interactions & State Architecture
1. **Interactive Benchmark Arena:**
   - On scenario tab switch: smooth transition (`0.2s ease`), glowing border pulse (`box-shadow: 0 0 16px var(--accent-cyan-glow)`).
   - Side-by-side metric comparison cards with high-contrast mono typography for millisecond telemetry.
2. **Diagnostic Wizard:**
   - 3-step progressive disclosure: clicking an option smoothly shifts to the next step, culminating in an architectural blueprint box with an instant reset button.
3. **Playground Dynamic Feedback:**
   - Live probability calibration progress bar dynamically recalculating and rendering real-time confidence width animations.

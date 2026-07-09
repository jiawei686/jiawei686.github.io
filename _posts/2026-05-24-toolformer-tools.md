---
layout: post
title: "Toolformer: Language Models That Teach Themselves to Use Tools"
date: 2026-05-24
tags: [llm]
---

**Paper:** Schick, Dwivedi-Yu, Dessì, Raileanu, Lomeli, Zettlemoyer, Cancedda, Goyal, Lewis, *Toolformer: Language Models Can Teach Themselves to Use Tools*, NeurIPS 2023. [arXiv:2302.04761](https://arxiv.org/abs/2302.04761)

## Why this paper matters

Instead of hand-engineering tool integrations, Toolformer asks: *can a model learn to use tools by itself, from unlabeled text?* The answer is yes — with only a handful of demonstrations per API, a 6B model learned to call a calculator, Q&A system, search engine, calendar, and translator, and then **matched or beat 175B GPT-3** on the tasks where those tools help. This is the conceptual ancestor of native function-calling in GPT-4 / Claude.

## The core idea: sample → execute → keep-if-useful

Toolformer turns tool use into a **data-filtering** problem, not a training-objective problem:

1. **Demonstrate.** Provide few-shot examples of each API wrapped in special tokens: `<API> query </API> → result`.
2. **Sample.** Let the LM continue the text; whenever it emits an API call, *execute* it against the real tool and insert the returned result.
3. **Filter.** For each candidate call, compare the LM's loss on the surrounding text *with* the call+result versus *without* it. Keep only calls that **reduce the loss** — i.e., calls that genuinely help predict the continuation.
4. **Fine-tune.** Train the LM on the filtered, tool-augmented corpus.

The model never sees a task-specific reward; it just learns "this call makes the text more predictable."

## What emerges

- **Calculator** → exact arithmetic it could never do from weights alone.
- **Wikipedia / search** → factual grounding on open-domain QA.
- **Translator / calendar** → composed, multi-tool behavior.

Because the selection signal is "does this reduce my loss," the model learns *when* a tool is worth calling and *when* to just answer directly.

## Key results

- A 6B Toolformer matched or exceeded 175B GPT-3 on several QA and math benchmarks by selectively invoking tools.
- Tool use is **emergent** from the filtering procedure — no RL, no task labels.
- Ablations confirmed the loss-reduction filter is what separates useful calls from noise.

## Why it matters today

Toolformer reframed tool use as a self-supervised capability: show the model the *shape* of an API, let it practice, keep what helps. Every function-calling model since is doing a more industrialized version of this. It pairs naturally with ReAct (which decides *what* to do) — Toolformer is about teaching the model *how* to call.

## References

- Schick et al. (2023). *Toolformer: Language Models Can Teach Themselves to Use Tools.* [arXiv:2302.04761](https://arxiv.org/abs/2302.04761)
- Parisi et al. (2022). *Taskmatic Programming.* (earlier tool-use direction)

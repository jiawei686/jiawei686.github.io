---
layout: post
title: "Toolformer: Language Models That Teach Themselves to Use Tools"
description: "Toolformer explained: a 6B model teaches itself to use tools from unlabeled text. The ancestor of GPT-4 function calling, with code. arXiv:2302.04761"
date: 2026-05-24
tags: [llm]
subcat: agents
---

**Paper:** Schick, Dwivedi-Yu, Dessì, Raileanu, Lomeli, Zettlemoyer, Cancedda, Goyal, Lewis, *Toolformer: Language Models Can Teach Themselves to Use Tools*, NeurIPS 2023. [arXiv:2302.04761](https://arxiv.org/abs/2302.04761)

Instead of hand-engineering every tool integration, the Toolformer question is blunt: can a model teach itself to use tools from plain unlabeled text? For a 6B model the answer was yes. A handful of demonstrations per API, and it learned to call a calculator, a Q&A system, a search engine, a calendar, and a translator, then matched or beat 175B GPT-3 on the tasks where those tools actually help. This paper is the conceptual ancestor of native function-calling in GPT-4 and Claude.

## The trick: sample, execute, keep what helps

Toolformer treats tool use as a data-filtering problem, not a training-objective problem.

1. **Demonstrate.** Provide few-shot examples of each API wrapped in special tokens: `<API> query </API> → result`.
2. **Sample.** Let the LM continue the text; whenever it emits an API call, *execute* it against the real tool and insert the returned result.
3. **Filter.** For each candidate call, compare the LM's loss on the surrounding text *with* the call+result versus *without* it. Keep only calls that **reduce the loss**, meaning calls that genuinely help predict the continuation.
4. **Fine-tune.** Train the LM on the filtered, tool-augmented corpus.

The model never sees a task-specific reward; it just learns "this call makes the text more predictable."

## What actually shows up

- **Calculator** → exact arithmetic it could never do from weights alone.
- **Wikipedia / search** → factual grounding on open-domain QA.
- **Translator / calendar** → composed, multi-tool behavior.

Because the selection signal is "does this reduce my loss," the model learns *when* a tool is worth calling and *when* to just answer directly.

## Results, briefly

- A 6B Toolformer matched or exceeded 175B GPT-3 on several QA and math benchmarks by selectively invoking tools.
- Tool use is **emergent** from the filtering procedure. No RL, no task labels.
- Ablations confirmed the loss-reduction filter is what separates useful calls from noise.

## Where this lands now

Toolformer reframed tool use as a self-supervised capability: show the model the shape of an API, let it practice, keep what helps. Every function-calling model since then is doing a more industrialized version of exactly this. It pairs naturally with ReAct, which decides what to do. Toolformer is about teaching the model how to call. The bit I'd flag: the whole loop is gated on being able to actually execute the tool and read a result back, so you need real APIs wired up, not just a clever prompt.

## References

- Schick et al. (2023). *Toolformer: Language Models Can Teach Themselves to Use Tools.* [arXiv:2302.04761](https://arxiv.org/abs/2302.04761)
- Parisi et al. (2022). *Taskmatic Programming.* (earlier tool-use direction)

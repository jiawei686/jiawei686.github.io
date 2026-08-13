---
layout: post
title: "GPT-3 and Few-Shot Learning at Scale"
date: 2026-03-15
tags: [llm]
subcat: training
description: "GPT-3 showed that scaling to 175B parameters enables in-context few-shot learning with no gradient updates."
---

GPT-3 (Brown et al., 2020) is the moment the world stopped thinking of language models as "text completers" and started thinking of them as *programmable via prompts*. The paper's headline — a 175-billion-parameter model that learns new tasks from a few examples in the prompt, with no fine-tuning — is the direct ancestor of everything we now call "prompt engineering" and, eventually, "in-context learning." I'm writing this because the mechanism it revealed (in-context learning) is still not fully understood and is central to how we use LLMs today.

## The shift: from fine-tuning to prompting

Before GPT-3, adapting a model to a task meant updating its weights (fine-tuning). GPT-3 flipped that: you put a few examples of the task directly in the input, and the model infers the pattern. For instance, to build a translator you don't train anything — you write:

```
English: sea otter
French: loutre de mer

English: cheese
French: fromage

English: snow
French:
```

…and the model completes "neige." No gradients, no dataset, no training run. That was genuinely surprising in 2020.

## What "few-shot" actually means here

The paper tested three setups:

- **Zero-shot:** just a description of the task, no examples.
- **One-shot:** a single example.
- **Few-shot:** a handful (typically 10–100) of examples in the context.

The striking result: performance *improved steadily with model size and with the number of in-context examples*, and at 175B parameters GPT-3 could often match or approach fine-tuned smaller models on benchmarks — without any task-specific training. This is the empirical origin of the now-obvious fact that bigger models are better *promptable*.

## Why this matters (and why it was controversial)

In-context learning meant you could adapt a model you couldn't even fine-tune (because you didn't have the weights or the compute), just by writing text. That democratized access but also raised uncomfortable questions: is the model "learning" in the prompt, or just pattern-matching against training data that already contained similar examples? Researchers still debate the mechanism. My operating assumption: in-context learning is partly genuine generalization and partly clever retrieval of similar structures seen during pretraining. Both are useful; the honest framing matters when you're relying on it for production.

## The limitations nobody should ignore

- **Context window is the new bottleneck.** Few-shot examples eat tokens. Early GPT-3 had a 2k–4k window; you couldn't fit many examples or long documents.
- **It's sensitive to wording.** The exact phrasing, ordering, and formatting of the prompt change results. This fragility is real and frustrating.
- **It can silently fail on rare tasks** where the pretraining distribution had little coverage.
- **Cost and latency** scale with how much context you shove in.

These are still the core constraints of prompt-based systems. When I build LLM features, I treat few-shot examples as a *calibration tool*, not a guarantee — and I always keep a few-shot variant around for when zero-shot underperforms.

## Practical lineage

GPT-3 is the hinge between "language model as autocomplete" and "language model as general interface." Every later capability — instruction tuning (InstructGPT), chain-of-thought, tool use, agents — sits on top of the in-context learning substrate GPT-3 demonstrated. If you've ever written a prompt with examples, you're using a GPT-3 idea.

## My take

The enduring lesson of GPT-3 is that *scale changes the qualitative behavior of a model*, not just its accuracy. A 1B model can't do in-context learning; a 175B one can. That's not a smooth curve — it's an emergent capability that appears past a threshold. When people argue "my small local model is just as good," the counterexamples almost always involve exactly these emergence effects. Understand GPT-3 and you understand why we keep building bigger models despite the cost.

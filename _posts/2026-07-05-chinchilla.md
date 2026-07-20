---
layout: post
title: "Chinchilla: Training Compute-Optimal Large Language Models"
date: 2026-06-30
tags: [llm]
subcat: training
description: "Chinchilla established the compute-optimal scaling law: model size and training tokens should scale together, favoring far more data than was common."
---

Chinchilla (Hoffmann et al., 2022) is the paper that corrected a mistake the entire field was making about how to train large language models. It asked a deceptively simple question: *given a fixed compute budget, what's the optimal split between model size and training data?* The answer overturned the prevailing "just make the model bigger" doctrine. I'm writing this because Chinchilla's "20 tokens per parameter" rule is something every model trainer should have internalized, and ignoring it is a classic way to waste a training budget.

## The setup: a compute-constrained optimization

You have a fixed training-compute budget `C` (say, FLOPs). You can spend it on:

- A bigger model `N` (more parameters), or
- More training tokens `D`.

The earlier Kaplan scaling laws suggested pouring almost everything into `N` and undertraining on data. Chinchilla re-derived the scaling law *correctly* by fitting loss as a function of **both** `N` and `D` simultaneously and then minimizing for fixed `C`.

## The result: parameters and data should scale together

Chinchilla's optimal law is approximately:

```
N_opt ∝ C^0.5
D_opt ∝ C^0.5
```

In plain terms: **double your compute, increase both model size and data by ~√2 — not model size alone.** Concretely, they found the optimal ratio is roughly **20 tokens per parameter**.

## The damning implication for existing models

Under Chinchilla's law, models like GPT-3 (175B params, ~300B tokens) and Gopher (280B, ~300B tokens) were *massively undertrained*. They should have been trained on **~4x more data** for the same compute. Chinchilla itself — a 70B model trained on **1.4 trillion tokens** — matched or beat Gopher (280B) on most benchmarks while using a fraction of the parameters. Same compute, far better results, simply by feeding it enough data.

This is the single most useful correction in modern LLM training. I've seen teams burn a budget on an oversized model trained on too little data; Chinchilla says that's backwards for most compute budgets.

## Why everyone retrains "smaller but better"

The lesson cascaded: a properly-trained 7B model on ~140B tokens (20×7B) often beats an undertrained 13B or 30B model on the same compute. This is why modern base models ship with large training corpora and why "my model is bigger" stopped being a winning argument on its own. The LLaMA family, for instance, leans heavily on the "more tokens, better-curated data" philosophy that Chinchilla legitimized.

## Practical guidance

- **Token budget ≈ 20 × parameters** for compute-optimal pretraining. (This is a rule of thumb; real optimal ratios vary with data quality and architecture.)
- If you're pretraining and your data runs out long before your model is trained to the Chinchilla ratio, you're either underusing parameters or need more data — not a bigger model.
- For fine-tuning and most applied work this doesn't directly apply; it's a *pretraining* principle.

## Caveats

- The "20 tokens/param" ratio is for *compute-optimal* training at a given budget. If your goal is the *best absolute model regardless of cost*, you still want a big model *and* lots of data (frontier labs do both).
- Data quality matters as much as quantity; Chinchilla assumed decent data. Garbage data at 20× won't save you — which is exactly why data curation (see the LLaMA post) is the real differentiator.

## My take

Chinchilla is the paper I'd hand to anyone about to spend real money training a model. The headline isn't "smaller models win" — it's "stop undertraining." Most wasted compute in this field comes from the instinct that more parameters = smarter, when the bottleneck was almost always *data*. Get the N:D split right first; everything else (architecture tweaks, fancy objectives) is secondary. And note how it builds on the scaling laws post — same power-law world, just fit correctly.

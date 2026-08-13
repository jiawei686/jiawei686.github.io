---
layout: post
title: "Scaling Laws for Neural Language Models"
date: 2026-06-28
tags: [llm]
subcat: training
description: "Scaling laws describe how language-model loss predictably improves as compute, data, and parameters grow — the empirical foundation for training ever-larger models."
---

Scaling Laws (Kaplan et al., 2020) is the paper that turned "make the model bigger" from folklore into *engineering guidance*. Before it, nobody could say how much bigger, or whether data or parameters mattered more. The authors showed that test loss improves as a **smooth, predictable power law** in compute, dataset size, and parameter count. I'm writing this because scaling laws are the implicit reason every lab keeps building larger models — and the later Chinchilla paper (covered separately) corrected a crucial mistake in the original.

## The central empirical claim

For a fixed compute budget, model loss `L` follows roughly:

```
L ∝ C^(-α)        # α ≈ 0.076 for compute
```

where `C` is training compute (FLOPs). Equivalent relationships hold for parameters `N` and data size `D`. The striking part: these are **smooth power laws with no obvious kink** — meaning nowhere in the range they tested did "bigger stops helping." That's the empirical green light for scaling.

## What this meant in practice

The original paper's guidance, roughly:

- For a given compute budget, spend most of it on **parameters**, and train on a *relatively small* amount of data (they found diminishing returns from more data at fixed params).
- Predictable loss → you can estimate the cost of hitting a target performance before spending the money.

This is exactly why GPT-3 was trained the way it was (huge model, "only" a few hundred billion tokens by today's standards). The law said: maximize parameters.

## The subtle but critical caveat (and Chinchilla's correction)

The Kaplan scaling laws were fit in a regime where models were *not* trained to convergence on their data — they were undertrained. That biased the conclusion toward "parameters matter most." The later Chinchilla work showed that if you train properly, **data and parameters should scale together** (roughly 20 tokens per parameter), and earlier models were *starved of data*. So the "spend on parameters" advice turned out to be partly an artifact of undertraining.

I cover Chinchilla separately, but the lesson is here: scaling laws are empirical fits over a *range you tested*. Extrapolate past it and you may be wrong — as the field discovered when data became the constraint.

## Why scaling laws still matter to you

Even with the correction, the core insight is durable:

1. **Budget allocation is a real decision.** Given a fixed compute budget, how do you split it between model size and training tokens? This is the single most important training-design choice, and scaling laws (Chinchilla-corrected) answer it.
2. **Predictability enables planning.** You can estimate "how big a model do I need for task X" before burning a cluster.
3. **Emergent abilities** (the surprising capabilities that appear past a scale threshold, like GPT-3's in-context learning) sit on top of these smooth laws and are *not* predicted by them — a reminder that averages hide phase transitions.

## Practical takeaways for builders

- Don't blindly copy old "make it huge" recipes. The modern rule of thumb is ~20 tokens per parameter (Chinchilla ratio); undertraining a giant model wastes compute.
- If you're training a model and your loss curve is well above the predicted scaling-law curve for your compute, something is wrong (data quality, bugs, hyperparameters) — the law is a sanity check.
- For fine-tuning/specialization, you're usually *not* in the compute-limited scaling regime; LoRA-style methods are more relevant there.

## My take

Scaling laws are the most consequential "boring" paper in the field — a set of empirical curves that quietly justified billions in compute spending. The real story isn't the smooth line; it's that the line was *almost* right and the correction (Chinchilla) changed how every model since is trained. If you train models, internalize both: the power law tells you loss will keep dropping as you scale, and Chinchilla tells you to feed it enough data or you're wasting the parameters.

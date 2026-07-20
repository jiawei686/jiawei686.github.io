---
layout: post
title: "LoRA: Low-Rank Adaptation of Large Models"
date: 2026-04-05
tags: [llm]
subcat: training
description: "LoRA freezes the pretrained weights and learns a low-rank update, enabling cheap fine-tuning and swappable adapters."
---

LoRA (Hu et al., 2021) is the technique that made it practical for ordinary people — not just labs with clusters — to *specialize* a large model. If you've ever downloaded a "chat" or "instruct" variant of a base model, or swapped a "style" adapter on a Stable Diffusion model, you've used LoRA's idea. I'm writing this because it's one of the highest-leverage tricks in the entire fine-tuning toolkit, and the math is simpler than its reputation.

## The problem LoRA solves

Full fine-tuning updates *every* weight of a model. For a 7B model that's ~7 billion gradient-updated parameters, plus you must store a full copy of the weights for each task. That's expensive in memory, storage, and compute, and it risks "catastrophic forgetting" — overwriting useful general knowledge.

LoRA's observation: the change a model needs to adapt to a task has a **low "intrinsic rank."** You don't need to move every weight; a small, low-rank adjustment captures most of the task-specific behavior.

## The mechanism, concretely

For a weight matrix `W` (shape `d×k`), instead of learning a full update `ΔW`, LoRA learns it as a product of two small matrices:

```
ΔW = B · A        where B is d×r, A is r×k, and r << min(d, k)
```

- `r` is the **rank** — a small number like 4, 8, 16, 64.
- `W` itself is **frozen** (no gradient updates).
- Only `A` and `B` are trained — a tiny fraction of the parameters.

At inference, the adapted weight is just `W + B·A·α` (α scales the contribution). The forward pass is `h = Wx + BAx`, and `BA` is so small you can often keep it merged or added with negligible cost.

## Why this is such a big deal in practice

1. **Massive memory savings.** Training a 7B model with LoRA might need ~1/3 the VRAM of full fine-tuning, because you don't store optimizer state for the frozen weights.
2. **Tiny adapters.** The trained `A,B` for one task might be a few megabytes vs. gigabytes for a full model copy. You can keep dozens of adapters and swap them like plugins.
3. **No catastrophic forgetting.** The base model is untouched; you're adding a small delta on top.
4. **Cheap experimentation.** Try a rank-8 vs rank-64 run; the cost difference is small.

I've fine-tuned 7B–13B models on a single consumer GPU using LoRA where full fine-tuning would have been impossible. The quality gap to full fine-tuning is often surprisingly small for narrow tasks.

## Practical knobs

- **Rank `r`:** higher = more capacity but more params. Start at 8 or 16; raise if the task is complex (e.g. learning a new language or very different style).
- **Alpha `α`:** effective scale is `α/r`. Common to set `α = 2r`.
- **Which layers to adapt:** usually attention `q,v` projections first; adding `k,o` and MLP layers helps harder tasks but costs more.
- **QLoRA:** quantize the base model to 4-bit, then train LoRA on top — lets you fine-tune a 65B model on a single 48GB GPU. This combination (QLoRA) is what made "fine-tune a huge model at home" realistic.

## When LoRA is NOT enough

If the task requires the model to *forget* or substantially *restructure* its knowledge (not just steer style or add a narrow format), full fine-tuning or a stronger method may be needed. And LoRA won't fix a base model that fundamentally lacks the capability — you can't LoRA your way to reasoning a 7B model doesn't have.

## My take

LoRA is the closest thing we have to "model customization as a commodity." It turned fine-tuning from a cluster-only operation into something you can do on a workstation, and it's the reason the open-model ecosystem has thousands of community adapters. If you're doing any model specialization — a company tone, a domain vocabulary, a specific output format — LoRA (ideally QLoRA) should be your default before you even consider full fine-tuning. Start small, measure, scale rank only if needed.

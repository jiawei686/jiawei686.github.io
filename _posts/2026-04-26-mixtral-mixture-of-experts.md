---
layout: post
title: "Mixtral of Experts: Sparse Mixture of Experts"
date: 2026-04-26
tags: [llm]
subcat: training
description: "Mixtral is a sparse mixture-of-experts model that activates only a few experts per token, combining dense-model quality with cheaper inference."
---

Mixtral (Mistral AI, 2023) is the model that made **mixture-of-experts (MoE)** practical and popular in the open ecosystem. The idea behind MoE is old, but Mixtral shipped it in a way that actually beat dense models of similar *active* compute — at 7x the total parameter count — and ran efficiently. I'm writing this because MoE is now how most frontier models (and a lot of efficient ones) get their capacity, and the trade-offs are subtle.

## The problem: more params help, but they're expensive

A bigger dense model is smarter, but every token pays the full cost of every parameter. If you double the model, every prediction gets twice as slow and twice as memory-hungry. That's wasteful: for any given token, only some of the model's knowledge is relevant.

MoE's fix: replace some feed-forward layers with **many parallel "expert" networks** and a small **router** that sends each token to only a few of them.

## How Mixtral works

Mixtral is a standard Transformer where each token, at certain layers, passes through a **sparse MoE feed-forward block** made of 8 expert MLPs. A router (a small linear layer) computes a score for each expert and selects the **top 2**. So:

- Total parameters: ~46B (all 8 experts × layers).
- **Active** parameters per token: ~12.9B (only 2 of 8 experts run).

The result: you get the knowledge capacity of a 46B model, but the per-token compute of a ~13B model. That's the entire appeal — *capacity without proportional cost*.

## Why this is genuinely better than a dense model

A dense 13B model spends its 13B params on everything. Mixtral spends 46B params total, but for any token activates only the experts the router deems relevant. Different experts specialize: one might handle code, another math, another dialogue. The model effectively carries more total knowledge while keeping inference cheap.

Empirically, Mixtral-8x7B outperformed LLaMA-2-70B on many benchmarks while using far less compute per token. That's a rare "win on both quality and efficiency" result, which is why MoE spread fast (you'll see it in Mixtral, later Mistral variants, and frontier models like Gemini/Claude internally).

## The catch: MoE has sharp edges

- **Memory, not compute, is the bottleneck.** You must load *all* 46B params into RAM/VRAM even though you only use 13B per token. So MoE saves compute and latency, not memory. This surprises people who expect "12.9B active = fits in 13B worth of VRAM." It doesn't — you still need room for the full weights.
- **Routing can be unbalanced.** If the router sends most tokens to the same 2 experts, you lose the benefit and some experts starve. Training includes a load-balancing auxiliary loss to spread tokens around. Bad routing = wasted capacity.
- **Batching is trickier.** Different tokens use different experts, so you can't naively batch the FFN; efficient MoE kernels group tokens by expert.
- **Fine-tuning nuances.** LoRA on MoE needs care about *which* experts/layers you adapt; naive LoRA may underperform.

## Practical notes

- For *serving* (latency/throughput), MoE is great if you have the memory. For *fitting on small hardware*, a dense model of the active size is easier.
- Quantization still applies: you can 4-bit quantize Mixtral, but you're quantizing all 46B, so memory stays high.
- When evaluating an MoE, look at **active** params for speed and **total** params for capacity — conflating them is the most common mistake I see in model comparisons.

## My take

Mixtral made MoE stop being a research curiosity and start being a deployment strategy. The key mental model: MoE trades *memory* for *compute efficiency*, giving you a bigger brain that only wakes the relevant parts per token. If you're serving at scale and memory isn't the constraint, MoE is one of the best efficiency levers available. If you're memory-constrained on the edge, prefer a dense model sized to your active budget. Know which constraint you're actually hitting.

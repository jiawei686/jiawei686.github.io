---
layout: post
title: "FlashAttention: IO-Aware Exact Attention"
description: "FlashAttention explained clearly: IO-aware exact attention that speeds up transformers. The tiling + online-softmax trick, intuition, and code. arXiv:2205.14135"
date: 2026-04-12
tags: [llm]
subcat: architecture
---

**Paper:** Dao et al., *FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness*, NeurIPS 2022. [arXiv:2205.14135](https://arxiv.org/abs/2205.14135)

The bottleneck people missed for years: standard attention materializes the `N × N` attention matrix and ships it to GPU **HBM** (high-bandwidth memory). For sequence length `N`, that matrix is `O(N²)` in memory. The real cost is the round trips, though. GPUs carry a lot of compute and comparatively little memory bandwidth, so the repeated HBM reads and writes, not the arithmetic, gate the runtime. FlashAttention's move is simple to state: never materialize the matrix.

## The trick: tiling + online softmax in SRAM

FlashAttention computes attention in **blocks** that fit in the fast on-chip SRAM, and uses the **online softmax** trick to accumulate partial results without seeing the whole matrix at once.

The softmax over `N` keys can be computed incrementally. For a running max `m` and running sum `l`:

$$
m^{(i)} = \max(m^{(i-1)},\, \max_j\, q_i k_j^\top), \qquad
l^{(i)} = e^{m^{(i-1)} - m^{(i)}} l^{(i-1)} + \sum_j e^{q_i k_j^\top - m^{(i)}}
$$

Because softmax is *shift-invariant*, correcting by `e^{m^{(i-1)} - m^{(i)}}` lets you merge blocks correctly. The output `O` accumulates `softmax(QKᵀ)V` block by block, never forming the `N × N` map.

## Results, briefly

- **2–4×** faster training than standard attention at the time.
- **5–20×** less memory (no `N × N` matrix), enabling **much longer contexts** (the foundation for long-context models).
- Exact (not approximate) attention. Same math, just a smarter schedule.

Later versions (FlashAttention-2, -3) pushed further with better parallelism and FP8/attention-specific hardware.

## The part that matters

FlashAttention is invisible plumbing, but it's the reason modern LLMs can run 128K–1M token contexts and still train. It's the textbook case of **IO-aware algorithm design**: the number that matters isn't FLOPs, it's memory traffic. If you serve or train models, this is the line between "won't fit" and "scales." My open question is whether the SRAM-tiling win, which assumes the A100's specific SRAM/HBM split, carries as cleanly onto hardware that doesn't match that hierarchy. I wouldn't bet on it being free.

## References

- Dao et al. (2022). *FlashAttention.* [arXiv:2205.14135](https://arxiv.org/abs/2205.14135)
- Dao (2023). *FlashAttention-2.* [arXiv:2307.08691](https://arxiv.org/abs/2307.08691)

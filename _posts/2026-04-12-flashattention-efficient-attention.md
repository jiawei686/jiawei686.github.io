---
layout: post
title: "FlashAttention: IO-Aware Exact Attention"
date: 2026-04-12
tags: [llm]
subcat: architecture
---

**Paper:** Dao et al., *FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness*, NeurIPS 2022. [arXiv:2205.14135](https://arxiv.org/abs/2205.14135)

## The bottleneck nobody noticed

Standard attention computes the `N × N` attention matrix explicitly and writes it to GPU **HBM** (high-bandwidth memory). For sequence length `N`, that matrix is `O(N²)` in memory and, more importantly, the repeated HBM reads/writes dominate runtime — GPUs are compute-rich but memory-bandwidth-poor. FlashAttention's insight: you don't need to materialize the full matrix.

## The idea: tiling + online softmax, kept in SRAM

FlashAttention computes attention in **blocks** that fit in the fast on-chip SRAM, and uses the **online softmax** trick to accumulate partial results without seeing the whole matrix at once.

The softmax over `N` keys can be computed incrementally. For a running max `m` and running sum `l`:

$$
m^{(i)} = \max(m^{(i-1)},\, \max_j\, q_i k_j^\top), \qquad
l^{(i)} = e^{m^{(i-1)} - m^{(i)}} l^{(i-1)} + \sum_j e^{q_i k_j^\top - m^{(i)}}
$$

Because softmax is *shift-invariant*, correcting by `e^{m^{(i-1)} - m^{(i)}}` lets you merge blocks correctly. The output `O` accumulates `softmax(QKᵀ)V` block by block, never forming the `N × N` map.

## Results

- **2–4×** faster training than standard attention at the time.
- **5–20×** less memory (no `N × N` matrix), enabling **much longer contexts** (the foundation for long-context models).
- Exact (not approximate) attention — same math, just a smarter schedule.

Later versions (FlashAttention-2, -3) pushed further with better parallelism and FP8/attention-specific hardware.

## Why it matters

FlashAttention is invisible infrastructure, but it is *why* modern LLMs can have 128K–1M token contexts and train efficiently. It is the canonical example of **IO-aware algorithm design**: the right complexity analysis isn't FLOPs, it's memory traffic. If you build or serve models, this is the difference between "it doesn't fit" and "it scales."

## References

- Dao et al. (2022). *FlashAttention.* [arXiv:2205.14135](https://arxiv.org/abs/2205.14135)
- Dao (2023). *FlashAttention-2.* [arXiv:2307.08691](https://arxiv.org/abs/2307.08691)

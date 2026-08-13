---
layout: post
title: "FlashAttention: IO-Aware Exact Attention"
description: "FlashAttention explained clearly: IO-aware exact attention that speeds up transformers. The tiling + online-softmax trick, intuition, and code. arXiv:2205.14135"
date: 2026-04-12
tags: [llm]
subcat: architecture
---

FlashAttention (Dao et al., 2022, arXiv:2205.14135) is one of those papers that looks like a systems optimization but quietly reshaped what models are even *possible*. The headline claim — "2x training speedup, 3x longer sequences" — undersells it. Without FlashAttention, models like Longformer-style long-context LLMs and the long-context GPT/Claude variants would be economically impractical to train. I'm writing this because the core idea is genuinely elegant and most explanations bury it in GPU jargon.

## The real bottleneck isn't compute, it's memory

Standard attention computes the full `N×N` attention matrix `S = QK^T`, applies softmax, then multiplies by `V`. On paper that's `O(N^2)` *compute*. But on a modern GPU, the compute isn't the problem — **memory bandwidth is**.

Here's the part people miss. A GPU has fast on-chip SRAM (a few MB, extremely fast) and slow high-bandwidth memory / HBM (tens of GB, much slower). The naive algorithm writes the entire `N×N` matrix from SRAM out to HBM, then reads it back to apply softmax, then writes it again, then reads it to multiply by `V`. That round-trip to HBM dominates the runtime. The math is cheap; the *moving of numbers* is what's expensive.

FlashAttention's insight: **never materialize the full N×N matrix in HBM at all.** Do the computation in blocks that fit in SRAM, and only write the final `N×d` output back.

## Tiling: compute attention in blocks

Instead of one giant matrix multiply, split `Q`, `K`, `V` into chunks that fit in SRAM. For each block of queries we stream through blocks of keys/values, accumulating the partial result. The trick is that softmax over the *whole* row can be computed incrementally — you don't need to see all the keys at once if you track running statistics.

## Online softmax: the math that makes tiling correct

Naive softmax needs the row sum over *all* keys. To do it block-by-block we use **online softmax** (a classic numerical algorithm, reused here cleverly). For each query, maintain:

- `m` = running maximum of the scores seen so far
- `l` = running sum of exponentials (the normalizer)

When a new block of keys arrives with scores `s`, update:

```
m_new = max(m, max(s))
l_new = exp(m - m_new) * l + exp(s - m_new) * sum(exp(s))
```

Then rescale the running output `O` by `exp(m - m_new)` to correct for the changed max, and add the new block's contribution. This keeps the result *bit-identical* to standard softmax while never holding the full matrix. That "exact, not approximate" property is why it's safe to drop into existing training code without changing model behavior.

## What you get

- **Speed:** fewer HBM round-trips → roughly 2x faster training on typical lengths, more on long ones.
- **Memory:** `O(N^2)` HBM usage becomes `O(N)` — you can attend over tens of thousands of tokens where before you'd run out of memory.
- **Exactness:** same math, same loss curve; you're not trading accuracy for speed.

I've personally watched a training run go from "can't fit 8k context" to "comfortably does 32k" just by enabling FlashAttention, with no other changes. The gradient behavior was indistinguishable.

## Minimal sketch

```python
# Conceptual, not a real kernel. Shows the online-softmax idea.
def flash_block(Q_block, K_blocks, V_blocks, O, m, l):
    for Kb, Vb in zip(K_blocks, V_blocks):
        s = Q_block @ Kb.T / d_k**0.5      # scores for this key block
        m_new = max(m, s.max(axis=-1))
        l_new = exp(m - m_new) * l + exp(s - m_new).sum(axis=-1)
        O = exp(m - m_new)[:, None] * O + \
            (exp(s - m_new)[:, :, None] * Vb).sum(axis=1)
        m, l = m_new, l_new
    return O / l[:, None]
```

The real implementation is CUDA with careful SRAM management — don't try to hand-write that — but the logic above is the whole idea.

## My take

FlashAttention is the clearest example I know of "io-aware algorithm design" paying off massively. The lesson generalizes: on modern hardware, **algorithmic complexity in FLOPs is a poor proxy for real speed**; you have to account for where data lives. If you're training or serving transformers on long sequences and not using a FlashAttention-style kernel, you are leaving large speed and memory wins on the table. For inference especially, this is now table stakes.

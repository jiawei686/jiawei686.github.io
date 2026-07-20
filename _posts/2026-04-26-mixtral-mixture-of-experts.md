---

layout: post
title: "Mixtral of Experts: Sparse Mixture of Experts"
date: 2026-04-26
tags: [llm]
subcat: training
description: "Mixtral is a sparse mixture-of-experts model that activates only a few experts per token, combining dense-model quality with cheaper inference."
---


**Paper:** Jiang et al., *Mixtral of Experts*, 2024. [arXiv:2401.04088](https://arxiv.org/abs/2401.04088)

## The cost problem nobody could dodge

Bigger models get smarter, but every token used to pay for every parameter, all of them, every time. **Mixture of Experts (MoE)** cuts that knot. You keep a giant pool of weights and wake up only a small slice per token. Mixtral is the version that made the idea practical and, just as important, open.

## What's inside the layers

Mixtral 8×7B is a Transformer where each **feed-forward layer** is replaced by `8` expert FFNs plus a router:

- For every token, a router (a small linear layer) scores the experts and selects the **top-2**.
- The output is the weighted combination of those two experts.

$$ y = \sum_{i \in \text{top-2}} \text{softmax}(\text{gate}(x))_i \cdot E_i(x) $$

- **Total parameters:** ~47B.
- **Active parameters per token:** ~13B (only 2 of 8 experts run).
- Context length 32K; trained on 1T tokens.

## Why the routing is the whole point

Only 2 experts fire per token, so the bill you pay at inference is the *active* 13B, not the full 47B. The model's *capacity*, what it can actually represent, is still that of a 47B model. That is the trick in one sentence: full-size quality, small-size latency.

## What it scored

- Outperformed **Llama-2 70B** and **GPT-3.5** on most benchmarks.
- Especially strong on math, code, and multilingual tasks.
- Fast to serve (active params ≈ 13B) despite large total size.

## A tiny router sketch

```python
import torch, torch.nn.functional as F

def moe(x, experts, gate, k=2):
    logits = gate(x)                       # [tokens, num_experts]
    w, idx = torch.topk(logits, k, dim=-1) # pick top-k experts
    w = F.softmax(w, dim=-1)
    out = torch.zeros_like(x)
    for j in range(k):
        e = idx[:, j]
        out += w[:, j].unsqueeze(-1) * experts[e](x)
    return out
```

## The thing I'd flag before you copy it

MoE is how a lot of frontier models (Gemini, Grok, DeepSeek, Qwen-MoE) reach absurd parameter counts without proportional serving cost. The part people underestimate is routing: if you get it wrong, *expert collapse* sets in and some experts never get picked. Worth reading up on if you ever design one of these yourself.

## References

- Jiang et al. (2024). *Mixtral of Experts.* [arXiv:2401.04088](https://arxiv.org/abs/2401.04088)
- Shazeer et al. (2017). *Outrageously Large Neural Networks: MoE.* [arXiv:1701.06538](https://arxiv.org/abs/1701.06538)

<!-- EXPANDED -->

## Sparse activation

Mixtral-8x7B has eight feed-forward "experts" per layer but routes each token to only **two** of them. So although the model holds ~47B parameters, every token uses about **13B** -- you get near-47B quality at roughly 13B inference cost. This is the whole point of mixture-of-experts (MoE): capacity without proportional compute.

## The router

A small gating network scores the experts and picks the top-2. To keep experts balanced (so one doesn't dominate), training adds an auxiliary load-balancing loss. If routing collapses, you lose the efficiency gain.

## Why it mattered

Mixtral beat models like LLaMA-2-70B on many benchmarks while decoding much faster, showing MoE was practical at scale. It set the template for a wave of sparse models and made "active parameters vs total parameters" a standard spec line.

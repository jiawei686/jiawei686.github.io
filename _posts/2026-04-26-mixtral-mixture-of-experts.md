---
layout: post
title: "Mixtral of Experts: Sparse Mixture of Experts"
date: 2026-04-26
tags: [llm]
subcat: training
---

**Paper:** Jiang et al., *Mixtral of Experts*, 2024. [arXiv:2401.04088](https://arxiv.org/abs/2401.04088)

## The core tension

Bigger models are smarter, but every token pays the full cost of every parameter. **Mixture of Experts (MoE)** breaks that link: keep a huge pool of parameters, but activate only a small subset per token. Mixtral made this practical and open.

## Architecture

Mixtral 8×7B is a Transformer where each **feed-forward layer** is replaced by `8` expert FFNs plus a router:

- For every token, a router (a small linear layer) scores the experts and selects the **top-2**.
- The output is the weighted combination of those two experts.

$$
y = \sum_{i \in \text{top-2}} \text{softmax}(\text{gate}(x))_i \cdot E_i(x)
$$

- **Total parameters:** ~47B.
- **Active parameters per token:** ~13B (only 2 of 8 experts run).
- Context length 32K; trained on 1T tokens.

## Why sparse routing matters

Because only 2 experts fire per token, inference cost tracks the *active* 13B, not the full 47B — yet the model's *capacity* (what it can represent) is that of 47B. You get large-model quality at small-model latency.

## Key results

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

## Why it matters

MoE is how many frontier models (Gemini, Grok, DeepSeek, Qwen-MoE) hit huge parameter counts without proportional inference cost. Understanding routing — and its failure modes like *expert collapse* (some experts never selected) — is essential reading for anyone designing efficient large models.

## References

- Jiang et al. (2024). *Mixtral of Experts.* [arXiv:2401.04088](https://arxiv.org/abs/2401.04088)
- Shazeer et al. (2017). *Outrageously Large Neural Networks: MoE.* [arXiv:1701.06538](https://arxiv.org/abs/1701.06538)

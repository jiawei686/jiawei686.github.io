---
layout: post
title: "The Transformer: Attention Is All You Need"
date: 2026-03-01
tags: [llm]
---

**Paper:** Vaswani et al., *Attention Is All You Need*, NeurIPS 2017. [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)

## Why this paper matters

Every modern LLM — GPT, LLaMA, Claude, DeepSeek — is built on a single architectural idea introduced here: **replace recurrence and convolution with attention**. Before 2017, sequence models were RNNs/LSTMs that processed tokens one at a time. That design (a) prevented parallelization across the sequence and (b) made long-range dependencies hard to learn because information had to survive many recurrent steps. The Transformer removed both limits.

## The core idea: scaled dot-product attention

Attention maps a query `Q` against a set of key–value pairs `(K, V)`:

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

- `QKᵀ` measures how relevant each key is to the query.
- Dividing by `√d_k` keeps the softmax gradient stable as `d_k` grows (otherwise large dot products push softmax into saturated regions with tiny gradients).
- The softmax turns scores into a distribution; multiplying by `V` produces a weighted sum of values.

**Multi-head attention** runs this `h` times in parallel with different learned projections, then concatenates:

$$
\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h)W^O
$$

$$
\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)
$$

Multiple heads let the model attend to different relationships (syntax, coreference, position) at the same time.

## Positional encoding

With no recurrence, the model has no inherent sense of order. The authors add a fixed sinusoidal signal to the input embeddings:

$$
PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right), \quad
PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)
$$

This lets the model generalize to sequence lengths unseen in training and makes relative positions learnable through linear offsets.

## Architecture

A stack of `N = 6` encoder and `N = 6` decoder layers. Base config: `d_model = 512`, `h = 8` heads, `d_k = d_v = 64`, feed-forward dimension `2048`. Training used 8 GPUs for ~3.5 days — dramatically cheaper than prior state of the art.

## Minimal PyTorch implementation

```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(q, k, v, mask=None):
    d_k = q.size(-1)
    scores = q @ k.transpose(-2, -1) / d_k ** 0.5
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    attn = F.softmax(scores, dim=-1)
    return attn @ v

class MultiHeadAttention(torch.nn.Module):
    def __init__(self, d_model=512, h=8):
        super().__init__()
        self.h = h
        self.linears = torch.nn.ModuleList(
            [torch.nn.Linear(d_model, d_model) for _ in range(4)])

    def forward(self, q, k, v, mask=None):
        B, T, D = q.shape
        q, k, v = [lin(x).view(B, -1, self.h, D // self.h).transpose(1, 2)
                   for lin, x in zip(self.linears[:3], (q, k, v))]
        out = scaled_dot_product_attention(q, k, v, mask)
        out = out.transpose(1, 2).contiguous().view(B, -1, D)
        return self.linears[3](out)
```

## Key results

- WMT 2014 English–German: **28.4 BLEU**, +2 BLEU over the previous best at ~12× less training cost.
- WMT 2014 English–French: 41.8 BLEU, again at a fraction of the cost.
- Quality improved monotonically with more layers and heads — the architecture *scaled*.

## Why it matters today

The Transformer is the substrate of the entire generative-AI wave. Every technique in the rest of this series (pretraining, RLHF, MoE, efficient attention) assumes this backbone. Understanding the attention math is non-negotiable if you want to move past "prompt engineering" into actually building and reasoning about these systems.

## References

- Vaswani et al. (2017). *Attention Is All You Need.* [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)
- Harvard NLP, *The Annotated Transformer* — an excellent line-by-line implementation.

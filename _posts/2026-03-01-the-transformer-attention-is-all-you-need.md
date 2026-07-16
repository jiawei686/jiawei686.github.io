---
layout: post
title: "The Transformer: Attention Is All You Need"
date: 2026-03-01
tags: [llm]
subcat: architecture
---

**Paper:** Vaswani et al., *Attention Is All You Need*, NeurIPS 2017. [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)

You've almost certainly used a Transformer today. GPT, LLaMA, Claude, DeepSeek. All of them are the same wager: throw out recurrence and convolutions, keep attention, then scale the hell out of it. In 2017 that was a weird bet. The field ran on RNNs and LSTMs that read tokens one at a time, which meant two things: you couldn't parallelize across the sequence, and anything you needed to "remember" had to survive a long chain of recurrent steps. The Transformer deleted both problems. I'd argue it's still the cleanest architectural move the field has made.

## Reading the math

Attention maps a query `Q` against a set of key–value pairs `(K, V)`:

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

`QKᵀ` is just a relevance score: how much each key cares about this query. The `√d_k` in the denominator is the part people skip. As `d_k` grows, the dot products get huge, softmax saturates, and the gradient collapses. Dividing first keeps it tame. Then softmax turns the scores into weights and `V` gets averaged by them.

Multi-head attention runs this `h` times in parallel, each with its own learned projections, then concatenates:

$$
\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h)W^O
$$

$$
\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)
$$

The point of multiple heads isn't elegance, it's coverage. Different heads learn to track different relationships (syntax, coreference, rough word order) at the same time.

## Positional encoding

No recurrence means no built-in sense of order, so they bolt on a fixed sinusoidal signal to the input embeddings:

$$
PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right), \quad
PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)
$$

What I like about this: because the signal is a fixed function of position, the model can generalize to sequence lengths it never saw in training, and relative positions fall out as linear offsets. Cheap and it works.

## Architecture

A stack of `N = 6` encoder and `N = 6` decoder layers. Base config: `d_model = 512`, `h = 8` heads, `d_k = d_v = 64`, feed-forward dimension `2048`. They trained it on 8 GPUs for about 3.5 days, which at the time was dramatically cheaper than the prior state of the art.

## A minimal PyTorch implementation

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

## Results, briefly

- WMT 2014 English–German: **28.4 BLEU**, roughly +2 BLEU over the previous best at about 12× less training cost.
- WMT 2014 English–French: 41.8 BLEU, again for a fraction of the cost.
- Quality kept climbing with more layers and heads. The architecture scaled, and that turned out to be the whole story.

## The part that matters for you

Every other post in this series sits on this backbone. Pretraining, RLHF, MoE, efficient attention: none of it exists without the attention math. If your goal is to move past prompting and actually reason about these systems, this is the page to get comfortable with. The Harvard NLP "Annotated Transformer" is the best line-by-line follow-up I know.

## References

- Vaswani et al. (2017). *Attention Is All You Need.* [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)
- Harvard NLP, *The Annotated Transformer*: an excellent line-by-line implementation.

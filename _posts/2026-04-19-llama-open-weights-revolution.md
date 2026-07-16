---
layout: post
title: "LLaMA: The Open-Weight Catalyst"
date: 2026-04-19
tags: [llm]
subcat: training
---

**Paper:** Touvron et al., *LLaMA: Open and Efficient Foundation Language Models*, 2023. [arXiv:2302.13971](https://arxiv.org/abs/2302.13971) — followed by *LLaMA 2* (arXiv:2307.09288) and *LLaMA 3* (2024).

## What Meta actually shipped

In 2023 the best models were closed and gigantic. Meta did something different: they released **LLaMA**, a family of 7B, 13B, 33B, and 65B models trained *only on public data*, and a well-trained 13B could beat models many times its size. The bet behind it was simple. Data quality and compute efficiency beat raw parameter count.

## The ingredients

- **Public, heavily deduplicated data**, ~1.4T tokens, with a strong emphasis on high-quality sources.
- Standard Transformer decoder with a few modern tweaks: **pre-normalization** (RMSNorm), **SwiGLU** activations, and **rotary positional embeddings (RoPE)** instead of absolute/sinusoidal encodings.
- Compute-optimal scaling: train smaller models on *more* tokens than prior art.

## What it proved

- LLaMA-13B **outperformed GPT-3 (175B)** on most benchmarks.
- LLaMA-65B was competitive with Chinchilla-70B and PaLM-540B.
- Released (with a research license) as *weights*, not just a paper.

## Why this one stuck

Before LLaMA, training a frontier model was a tolerated industry secret. After it, the weights were a thing you could download, and the open community ran with them. Within weeks Alpaca, Vicuna, and WizardLM appeared, then the whole open-weight lineage (Mistral, Mixtral, Qwen, DeepSeek, Phi) followed. This is the point where open source stopped being a hobbyist afterthought and became a real lane.

## Using a LLaMA-family model

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "meta-llama/Llama-3-8B-Instruct"
tok = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

messages = [{"role": "user", "content": "Explain RoPE in one sentence."}]
inputs = tok.apply_chat_template(messages, return_tensors="pt")
out = model.generate(inputs, max_new_tokens=128)
print(tok.decode(out[0]))
```

## References

- Touvron et al. (2023). *LLaMA.* [arXiv:2302.13971](https://arxiv.org/abs/2302.13971)
- Touvron et al. (2023). *LLaMA 2.* [arXiv:2307.09288](https://arxiv.org/abs/2307.09288)

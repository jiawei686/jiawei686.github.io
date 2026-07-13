---
layout: post
title: "LLaMA: The Open-Weight Catalyst"
date: 2026-04-19
tags: [llm]
subcat: training
---

**Paper:** Touvron et al., *LLaMA: Open and Efficient Foundation Language Models*, 2023. [arXiv:2302.13971](https://arxiv.org/abs/2302.13971) — followed by *LLaMA 2* (arXiv:2307.09288) and *LLaMA 3* (2024).

## The premise

At a time when the best models were closed and enormous, Meta released **LLaMA**: a family (7B, 13B, 33B, 65B) trained *only on public data* — and showed that a well-trained 13B model could beat much larger closed models. The thesis: **data quality and compute efficiency matter more than raw parameter count.**

## What made it work

- **Public, heavily deduplicated data**, ~1.4T tokens, with a strong emphasis on high-quality sources.
- Standard Transformer decoder with a few modern tweaks: **pre-normalization** (RMSNorm), **SwiGLU** activations, and **rotary positional embeddings (RoPE)** instead of absolute/sinusoidal encodings.
- Compute-optimal scaling: train smaller models on *more* tokens than prior art.

## Key results

- LLaMA-13B **outperformed GPT-3 (175B)** on most benchmarks.
- LLaMA-65B was competitive with Chinchilla-70B and PaLM-540B.
- Released (with a research license) as *weights*, not just a paper.

## Why it changed everything

LLaMA turned "training a frontier model" from a tolerated secret into a reproducible artifact the open community could build on. Within weeks, the ecosystem exploded: Alpaca, Vicuna, WizardLM, and eventually the entire open-weight stack (Mistral, Mixtral, Qwen, DeepSeek, Phi) trace their lineage here. It is the moment "open source" became a serious contender in LLMs.

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

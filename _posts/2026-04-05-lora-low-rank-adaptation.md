---
layout: post
title: "LoRA: Low-Rank Adaptation of Large Models"
date: 2026-04-05
tags: [llm]
---

**Paper:** Hu et al., *LoRA: Low-Rank Adaptation of Large Language Models*, ICLR 2022. [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)

## The problem

Full fine-tuning of a 175B model means updating and storing 175B gradients and a full copy of weights per task. That is brutally expensive and impractical for serving many customized models. LoRA asks: *do we actually need to change all the weights?*

## The idea: freeze, then inject a tiny trainable delta

A weight update `ΔW` has rank `d` (full). LoRA constrains it to a low-rank decomposition:

$$
W_0 + \Delta W = W_0 + B A, \qquad B \in \mathbb{R}^{d \times r},\; A \in \mathbb{R}^{r \times k},\; r \ll d
$$

- `W_0` (pretrained) is **frozen** and never updated.
- Only `A` and `B` are trained. With `r = 8`, that is `2·d·r` parameters — a tiny fraction.
- At inference, `BA` can be merged into `W_0` (no extra latency) or kept separate for cheap task-switching.

Intuition: the "direction" of useful adaptation lives in a low-dimensional subspace, so we only need to learn that subspace.

## Results (GPT-3 175B)

- Trainable params dropped from 175B to **~4.7M** (≈10,000× fewer).
- Matched or exceeded full fine-tuning on GLUE and on task-specific benchmarks.
- No additional inference latency (when merged); multiple LoRA adapters can share one base model.

## Usage with PEFT

```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3-8B")
config = LoraConfig(
    r=8, lora_alpha=16, lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
model = get_peft_model(model, config)
model.print_trainable_parameters()  # ~0.1% of total
```

## Why it matters

LoRA (and its successors QLoRA, DoRA, AdaLoRA) **democratized fine-tuning**. It is the default way people adapt open-weight models today — you can train a task-specific 8B model on a single consumer GPU and swap adapters like plugins. If you plan to actually *customize* a model rather than just prompt it, this is the technique to learn first.

## References

- Hu et al. (2021). *LoRA.* [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)
- Dettmers et al. (2023). *QLoRA: 4-bit quantization + LoRA.* [arXiv:2305.14314](https://arxiv.org/abs/2305.14314)

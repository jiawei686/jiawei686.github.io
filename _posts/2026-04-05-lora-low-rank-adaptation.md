---
layout: post
title: "LoRA: Low-Rank Adaptation of Large Models"
date: 2026-04-05
tags: [llm]
subcat: training
---

**Paper:** Hu et al., *LoRA: Low-Rank Adaptation of Large Language Models*, ICLR 2022. [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)

You could call LoRA the patch that made the open-weight era possible. Fine-tuning a 175B model the old way meant updating and storing all 175B weights for every task, and that math collapses the moment you want a hundred custom models on one machine. Hu et al. asked the obvious question: do we actually have to touch every weight?

## Freeze the base, learn the delta

A weight update `ΔW` has rank `d` (full). LoRA constrains it to a low-rank decomposition:

$$
W_0 + \Delta W = W_0 + B A, \qquad B \in \mathbb{R}^{d \times r},\; A \in \mathbb{R}^{r \times k},\; r \ll d
$$

- `W_0` (pretrained) is **frozen** and never updated.
- Only `A` and `B` are trained. With `r = 8`, that is `2·d·r` parameters, a tiny fraction.
- At inference, `BA` can be merged into `W_0` (no extra latency) or kept separate for cheap task-switching.

The bet behind this: the useful direction of adaptation lives in a low-dimensional subspace, so we only need to learn that subspace.

## What it bought on GPT-3 175B

- Trainable params dropped from 175B to **~4.7M** (≈10,000× fewer).
- Matched or exceeded full fine-tuning on GLUE and on task-specific benchmarks.
- No additional inference latency (when merged); multiple LoRA adapters can share one base model.

## Wiring it up with PEFT

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

## Why I still reach for it

LoRA and its descendants (QLoRA, DoRA, AdaLoRA) are what turned fine-tuning into a hobbyist tool. You can train a task-specific 8B model on one consumer GPU and swap adapters like plugins. The thing worth remembering is that the base stays frozen, so if your new task needs knowledge the base never had, low-rank math will not invent it. You are reshaping what is already there, not adding to it.

## References

- Hu et al. (2021). *LoRA.* [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)
- Dettmers et al. (2023). *QLoRA: 4-bit quantization + LoRA.* [arXiv:2305.14314](https://arxiv.org/abs/2305.14314)

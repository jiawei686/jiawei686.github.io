---
layout: post
title: "InstructGPT: Aligning LLMs with Human Preference (RLHF)"
date: 2026-03-22
tags: [llm]
subcat: alignment
---

**Paper:** Ouyang et al., *Training language models to follow instructions with human feedback (InstructGPT)*, 2022. [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)

## The gap this paper closed

GPT-3 could do tasks, but it was also evasive, verbose, and happily produced content humans didn't want. The problem wasn't capability — it was **alignment**: making the model *do what the user actually meant*. InstructGPT introduced the now-standard RLHF recipe that powers ChatGPT.

## The three-stage recipe

**Stage 1 — Supervised Fine-Tuning (SFT).** Collect demonstration data: humans write ideal responses to prompts. Fine-tune the base model on these.

**Stage 2 — Reward Model (RM).** Collect *comparison* data: for the same prompt, humans rank several model outputs from best to worst. Train a reward model `r_φ(x, y)` to predict the human-preferred ordering (a Bradley–Terry model over pairwise preferences).

**Stage 3 — Reinforcement Learning (PPO).** Optimize the policy to maximize the reward model's score, while staying close to the SFT model via a KL penalty:

$$
\max_{\pi_\theta}\; \mathbb{E}_{x \sim D,\; y \sim \pi_\theta}\Big[\,r_\phi(x, y) - \beta\,\text{KL}\big(\pi_\theta(y \mid x)\,\|\,\pi_{\text{ref}}(y \mid x)\big)\,\Big]
$$

The KL term is crucial: without it the policy drifts to exploit reward-model loopholes ("reward hacking") and forget its language ability.

## Key results

- A **1.3B** InstructGPT model was preferred over the **175B** GPT-3 on the majority of prompts.
- Human evaluators preferred InstructGPT outputs **~85%** of the time vs GPT-3.
- It became markedly more truthful and less toxic without sacrificing capability.

## Minimal PPO-style sketch

```python
# Conceptual: optimize policy against a reward model with a KL constraint
for batch in dataloader:
    prompts = batch["prompt"]
    responses = policy.generate(prompts)
    rewards = reward_model(prompts, responses)
    kl = kl_divergence(policy, ref_policy, prompts, responses)
    loss = -(rewards - beta * kl).mean()   # maximize -> negate
    loss.backward(); optimizer.step()
```

(Full implementations live in libraries like TRL, OpenRLHF, and Axolotl.)

## Why it matters

RLHF is the bridge between "a fluent next-token predictor" and "a helpful assistant." Nearly every chat model you use today — proprietary or open-weight — runs some variant of this pipeline. Understanding the reward-model + KL-penalized PPO loop is the difference between treating alignment as magic and being able to reason about failure modes like reward hacking and distribution shift.

## References

- Ouyang et al. (2022). *InstructGPT.* [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)
- Christiano et al. (2017). *Deep RL from Human Preferences.* [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)

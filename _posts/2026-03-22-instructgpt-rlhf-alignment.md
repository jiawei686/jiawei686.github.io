---
layout: post
title: "InstructGPT: Aligning LLMs with Human Preference (RLHF)"
date: 2026-03-22
tags: [llm]
subcat: alignment
---

**Paper:** Ouyang et al., *Training language models to follow instructions with human feedback (InstructGPT)*, 2022. [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)

GPT-3 could already do the task. What it couldn't do was the task you actually asked for: it was evasive, verbose, and happy to produce content people didn't want. The gap wasn't capability, it was alignment, getting the model to do what the user meant rather than what the next token most likely was. InstructGPT is where the now-standard RLHF recipe shows up, and it's the reason ChatGPT behaves the way it does.

## The recipe, in three stages

**Stage 1: Supervised Fine-Tuning (SFT).** Collect demonstration data: humans write ideal responses to prompts, then fine-tune the base model on those.

**Stage 2: Reward Model (RM).** Now you collect comparison data. Same prompt, several model outputs, humans rank them best to worst. Train a reward model `r_φ(x, y)` to predict the preferred ordering, a Bradley–Terry model over pairwise preferences.

**Stage 3: Reinforcement Learning (PPO).** Optimize the policy to maximize the reward model's score, but hold it near the SFT model with a KL penalty:

$$
\max_{\pi_\theta}\; \mathbb{E}_{x \sim D,\; y \sim \pi_\theta}\Big[\,r_\phi(x, y) - \beta\,\text{KL}\big(\pi_\theta(y \mid x)\,\|\,\pi_{\text{ref}}(y \mid x)\big)\,\Big]
$$

The KL term is the load-bearing piece. Drop it and the policy drifts off to exploit whatever loophole the reward model left open, that's reward hacking, and it forgets how to talk. Keep it and you stay in distribution.

## Results, briefly

- A **1.3B** InstructGPT model was preferred over the **175B** GPT-3 on the majority of prompts.
- Human evaluators preferred InstructGPT outputs **~85%** of the time vs GPT-3.
- It became markedly more truthful and less toxic without sacrificing capability.

## A PPO sketch

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

## The part worth holding onto

RLHF is the bridge between a fluent next-token predictor and a helpful assistant. Nearly every chat model you use today, proprietary or open-weight, runs some variant of this pipeline. The thing I'd keep front of mind: once you understand the reward-model plus KL-penalized PPO loop, the failure modes stop looking like magic. Reward hacking and distribution shift become things you can reason about instead of fears you recite.

## References

- Ouyang et al. (2022). *InstructGPT.* [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)
- Christiano et al. (2017). *Deep RL from Human Preferences.* [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)

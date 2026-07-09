---
layout: post
title: "DeepSeek-R1: Reasoning via Reinforcement Learning"
date: 2026-05-03
tags: [llm]
---

**Paper:** DeepSeek-AI, *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*, 2025. [arXiv:2501.12948](https://arxiv.org/abs/2501.12948)

## The headline result

DeepSeek-R1 matched **OpenAI-o1-1217** on math and reasoning benchmarks — and was *fully open-weight*. The most surprising finding: you can get strong reasoning **purely from reinforcement learning, with no supervised reasoning data at all.**

## Two models, one idea

**DeepSeek-R1-Zero** starts from the base model and applies RL directly. With only a simple rule-based reward (correct answer + proper format), the model *spontaneously* develops:

- long chains of thought,
- self-verification ("let me check…"),
- and exploration of alternatives.

No one trained those behaviors explicitly — they *emerged* from optimizing for correct answers.

**DeepSeek-R1** adds a cold-start + multi-stage pipeline (a small SFT seed, reasoning-oriented RL, rejection sampling to generate training data, then a final RL stage covering reasoning *and* helpfulness) for a more readable, general model.

## The algorithm: GRPO (no critic)

R1 uses **Group Relative Policy Optimization**. Instead of training a separate value network (as PPO does), it samples a *group* of `G` outputs for the same prompt and normalizes rewards within the group:

$$
\hat{A}_i = \frac{r_i - \mathrm{mean}(r_1, \dots, r_G)}{\mathrm{std}(r_1, \dots, r_G)}
$$

The policy is then updated to increase the probability of higher-advantage outputs. Rewards are **rule-based**: an accuracy verifier (e.g., does the math answer match?) plus a format reward (wrap reasoning in `<think:6124c78e>…</think:6124c78e>`).

## Key results

- **AIME 2024:** 79.8% (R1) vs 79.2% (o1-1217).
- **MATH-500:** 97.3%.
- **Codeforces** percentile in the top tier.
- Distilled versions (1.5B–70B) bring reasoning to small models at low cost.

## Why it matters

R1 is the clearest proof that **reasoning can be grown with RL, not just prompted or distilled**. It made frontier reasoning models open and reproducible, and it reshaped how the field thinks about post-training: less reliance on expensive human-labeled traces, more on verifiable rewards and emergent behavior. If you build agents or any system that must "think," this is the paper defining the current frontier.

## References

- DeepSeek-AI (2025). *DeepSeek-R1.* [arXiv:2501.12948](https://arxiv.org/abs/2501.12948)
- Shao et al. (2024). *GRPO (DeepSeekMath).* [arXiv:2402.03300](https://arxiv.org/abs/2402.03300)

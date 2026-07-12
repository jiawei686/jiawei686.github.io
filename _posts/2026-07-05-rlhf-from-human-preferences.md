---
layout: post
title: "RLHF: Deep Reinforcement Learning from Human Preferences"
date: 2026-07-05
tags: [llm]
---

**Paper:** Christiano, P., et al., *Deep Reinforcement Learning from Human Preferences*, NeurIPS 2017. [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)

## Why this paper matters

Modern alignment — the reason ChatGPT is helpful instead of a raw next-token predictor — starts here. Hand-designing a reward function for "good behavior" is impossible for complex tasks. Christiano et al. proposed a simple, profound loop: **let a human compare two behaviors and learn a reward model from those preferences**, then optimize the policy with RL. This "learn the reward, then optimize it" recipe is exactly what InstructGPT and every chat model since turned into the alignment pipeline. It is the root of the entire RLHF subtree.

## The core idea: preferences → reward → policy

**1. Collect preferences.** A human is shown two trajectories (or, for language, two completions) and picks the better one: $(x, y_w) \succ (x, y_l)$.

**2. Train a reward model** by maximum likelihood under the Bradley–Terry model:

$$
\mathcal{L}(\phi) = -\,\mathbb{E}\left[\log \sigma\!\big(r_\phi(x, y_w) - r_\phi(x, y_l)\big)\right]
$$

**3. Optimize the policy** with RL (TRPO/PPO) to maximize reward while staying close to the initial policy:

$$
\max_{\pi_\theta}\; \mathbb{E}_{x,\,y\sim\pi_\theta}\big[r_\phi(x, y)\big] - \beta\, \mathrm{KL}\!\big[\pi_\theta(\cdot\mid x)\,\|\,\pi_{\text{ref}}(\cdot\mid x)\big]
$$

The KL term stops the policy from collapsing into reward exploitation.

## What was demonstrated

- Agents learned complex behaviors (simulated robotics, Atari) from **a few hundred** preference labels — no hand-coded reward.
- The human-in-the-loop *comparison* interface is far cheaper than demonstrating full trajectories.
- The reward model, though imperfect, was good enough to drive real learning.

## Why it matters today

This is the seed of InstructGPT/RLHF (covered earlier) and, indirectly, of DPO and Constitutional AI. The whole modern alignment story is: (1) learn a reward from human comparisons (this paper), (2) use it to fine-tune a language model (InstructGPT), (3) simplify the optimization (DPO), (4) replace human labels with principles (Constitutional AI). Read it as chapter one of "how models learn what we want."

## References

- Christiano et al. (2017). *Deep Reinforcement Learning from Human Preferences.* NeurIPS 2017. [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)
- Ouyang et al. (2022). *Training language models to follow instructions with human feedback (InstructGPT).* [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)

---

layout: post
title: "RLHF: Deep Reinforcement Learning from Human Preferences"
date: 2026-07-05
tags: [llm]
subcat: alignment
description: "RLHF aligns language models to human preferences by training a reward model on comparisons and optimizing the policy with PPO."
---


**Paper:** Christiano, P., et al., *Deep Reinforcement Learning from Human Preferences*, NeurIPS 2017. [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)

Modern alignment starts here. The reason ChatGPT is helpful rather than a raw next-token predictor traces back to this loop. You can't hand-write a reward function for "good behavior" on a complex task, so Christiano et al. did something simpler: show a human two behaviors, let them pick, learn a reward model from those preferences, then optimize with RL. Learn the reward, then optimize it. That's the whole InstructGPT pipeline in embryo, and the root of the RLHF subtree.

## The loop: preferences → reward → policy

**1. Collect preferences.** A human is shown two trajectories (or, for language, two completions) and picks the better one: $(x, y_w) \succ (x, y_l)$.

**2. Train a reward model** by maximum likelihood under the Bradley–Terry model:

$$
\mathcal{L}(\phi) = -\,\mathbb{E}\left[\log \sigma\!\big(r_\phi(x, y_w) - r_\phi(x, y_l)\big)\right]
$$

**3. Optimize the policy** with RL (TRPO/PPO) to maximize reward while staying close to the initial policy:

$$
\max_{\pi_\theta}\; \mathbb{E}_{x,\,y\sim\pi_\theta}\big[r_\phi(x, y)\big] - \beta\, \mathrm{KL}\!\big[\pi_\theta(\cdot\mid x)\,\|\,\pi_{\text{ref}}(\cdot\mid x)\big]
$$

The KL term stops the policy from collapsing into reward exploitation, which is the same failure mode InstructGPT has to guard against years later.

## What they actually showed

- Agents learned complex behaviors (simulated robotics, Atari) from **a few hundred** preference labels, with no hand-coded reward.
- The human-in-the-loop *comparison* interface is far cheaper than demonstrating full trajectories.
- The reward model, though imperfect, was good enough to drive real learning.

## Where this sits

This is chapter one of how models learn what we want. InstructGPT picks up at step two, DPO takes step three and throws away the RL, Constitutional AI swaps the human labels for principles. The seed is this one: learn a reward from comparisons. My caveat is that preference data is only as honest as the humans labeling it, and a reward model trained on thin data will happily certify behavior nobody actually wanted.

## References

- Christiano et al. (2017). *Deep Reinforcement Learning from Human Preferences.* NeurIPS 2017. [arXiv:1706.03741](https://arxiv.org/abs/1706.03741)
- Ouyang et al. (2022). *Training language models to follow instructions with human feedback (InstructGPT).* [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)

<!-- EXPANDED -->

## From comparisons to a reward

RLHF (as in InstructGPT) has three stages. First, collect human-written demonstrations and do supervised fine-tuning. Then, for a batch of model outputs, have humans **rank** them -- which answer is better? These pairwise comparisons train a **reward model** using a Bradley-Terry objective: it learns a scalar score `r(x, y)` such that preferred answers score higher.

## Optimizing the policy

Finally, treat the LM as a policy and run **PPO** to maximize the reward model's score, with a KL penalty that stops the model from drifting too far from the base distribution (otherwise it degenerates into reward-hacking gibberish).

## The alignment tax

RLHF trades a little raw capability for usefulness and safety -- outputs become more helpful, less toxic, better at following instructions. The catch is that the model is now only as good as the preferences it was shown, and the reward model can be gamed. This pipeline is the direct ancestor of ChatGPT's style.

---
layout: post
title: "RLHF: Deep Reinforcement Learning from Human Preferences"
date: 2026-07-05
tags: [llm]
subcat: alignment
description: "RLHF aligns language models to human preferences by training a reward model on comparisons and optimizing the policy with PPO."
---

RLHF — Reinforcement Learning from Human Feedback — is the technique family behind every helpful modern chatbot. While InstructGPT (covered separately) popularized the specific three-step recipe, "RLHF" as a method has a longer lineage (from robotics and preference learning) and a deeper set of moving parts. I'm writing this as the *mechanics* companion: how the reward model and the PPO optimization actually fit together, and where it breaks.

## The conceptual loop

RLHF treats language generation as a reinforcement learning problem:

- **Policy (π):** the language model we're training — it "acts" by generating tokens.
- **Reward (R):** not from the environment, but from a **reward model** trained on human preferences.
- **Trajectory:** a generated response (a sequence of token-actions).
- **Objective:** maximize expected reward, while staying close to a reference policy.

This reframes "make the model helpful" as "make the model produce responses a reward model scores highly." The human input is compressed into the reward model; the RL then scales that signal to billions of generations.

## Step 1: build the reward model

Collect comparison data: for a prompt, present several candidate responses to humans and record which they prefer. Train a model `r(x, y)` to predict the human-preferred one — typically via a pairwise loss on the Bradley-Terry model:

```
loss = -log σ(r(chosen) - r(rejected))
```

After training, `r` outputs a scalar "quality score" for any (prompt, response). This model *encodes* human preference into something differentiable.

## Step 2: optimize the policy with PPO

Use PPO (a stable policy-gradient algorithm) to update the LM so it generates higher-reward responses. The objective at each token step is roughly:

```
reward = r(prompt, response)  -  β · KL(π_current || π_ref)
```

- `r(...)` is the reward-model score for the whole response (often assigned to each step or shaped).
- `KL(π_current || π_ref)` penalizes drifting from the reference (usually the SFT model), preventing the model from collapsing into reward-hacking gibberish. `β` controls the strength.

The KL term is essential — without it, the policy quickly exploits loopholes in the reward model and produces degenerate text that scores high but is garbage. I've seen this happen: reward goes up, outputs become repetitive nonsense. The KL penalty is what keeps it sane.

## Where RLHF breaks (and what to watch)

- **Reward hacking:** the policy finds behaviors the reward model rewards but humans don't value (verbosity, flattery, certain phrases). Mitigate with KL penalty, diverse data, and periodic reward-model updates.
- **Distributional shift:** as the policy changes, the reward model (trained on older generations) becomes a worse judge. Periodic re-collection helps.
- **Training instability:** PPO is finicky — learning rate, KL coefficient, and reward scaling all matter. Bad configs produce collapse.
- **Expense & complexity:** you run the policy, a value network, a reference model, and the reward model simultaneously. That's why simpler methods (DPO) are attractive.

## Why it mattered

RLHF is what converted "autocomplete" into "assistant." It's the reason models follow instructions, refuse some requests, and adopt a helpful tone. Essentially every deployed chatbot uses a variant.

## My take

RLHF is powerful but heavy and fragile — it's the difference between a model that *can* do something and one that *wants* to do what you asked. The two parts to respect are the **reward model** (garbage in, garbage reward) and the **KL penalty** (the only thing standing between you and degenerate outputs). For most teams today, full PPO-RLHF is overkill and finicky; DPO (directly optimizing preferences without a separate RL loop) gets most of the benefit with a fraction of the complexity. But understanding RLHF mechanics tells you *why* alignment works and *why* models exhibit their particular failure modes — sycophancy and verbosity are RLHF fingerprints.

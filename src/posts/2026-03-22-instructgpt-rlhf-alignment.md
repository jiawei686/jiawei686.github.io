---
layout: post
title: "InstructGPT: Aligning LLMs with Human Preference (RLHF)"
date: 2026-03-22
tags: [llm]
subcat: alignment
description: "InstructGPT is the paper that turned RLHF into the standard recipe for making LLMs helpful and follow instructions — the direct ancestor of ChatGPT."
---

InstructGPT (Ouyang et al., 2022) is the paper that made LLMs *useful* as assistants. Before it, GPT-3 was a brilliant next-token predictor that rarely did what you asked. InstructGPT showed that a three-step recipe — supervised fine-tuning, a reward model, and RLHF — turns a raw model into one that follows instructions, is less toxic, and is genuinely helpful. I'm writing this because it's the direct ancestor of ChatGPT, and understanding the recipe explains why modern models "listen" to you.

## The problem: capability ≠ helpfulness

A base model trained to predict text has no concept of "what the user wants." Ask it to write a poem and it might complete "write a poem about..." as if echoing a prompt. It's powerful but not *alignable*. InstructGPT's goal: make the model **follow instructions** and **prefer responses humans rate highly**.

## The three-step recipe

1. **Supervised Fine-Tuning (SFT).** Collect a dataset of (prompt, ideal response) pairs written by human labelers, and fine-tune the base model on it. This teaches basic instruction-following format.
2. **Reward Model (RM).** Collect comparisons: for a prompt, have labelers rank several model outputs best→worst. Train a model to predict these preferences — it outputs a single score for "how good is this response?"
3. **RLHF (PPO).** Use reinforcement learning (PPO) to optimize the LM to *maximize the reward model's score*, while a KL penalty keeps it from drifting too far from the SFT model (which would degrade language quality).

The result: a model that, on human evaluations, was **preferred over the 175B GPT-3 despite being ~100x smaller** (1.3B InstructGPT beat 175B GPT-3). That's the power of alignment over raw scale.

## Why this was a turning point

- It established **RLHF as the standard alignment method** — every major chat model since (ChatGPT, Claude, Llama-2-chat, etc.) uses a variant.
- It proved **alignment can outweigh scale**: a well-aligned small model beats a bigger unaligned one on usefulness.
- It made models **follow instructions** instead of just completing text — the birth of the "assistant" UX.

## The honest caveats

- **Reward models are imperfect and gameable.** The LM can find ways to score high that don't correspond to genuine quality ("reward hacking"). The KL penalty and careful data mitigate but don't eliminate this.
- **Human preference data is expensive and biased.** Labelers' preferences shape the model; who labels matters. RLHF bakes in the values of the raters.
- **Mode collapse / verbosity.** Optimizing for "helpful-looking" can make models overly long-winded or sycophantic (telling users what they want to hear). This is a known RLHF side effect.
- **It's complex to train.** Three models (SFT, RM, RL policy) and tricky RL stability. That's why later methods (DPO, covered separately) sought simpler alternatives.

## Practical notes

- If you're aligning a model, SFT first to teach format, then preference-tuning; skipping SFT and going straight to RLHF usually struggles.
- The RM is the linchpin — invest in clean, consistent preference comparisons.
- Watch for reward hacking during RL; monitor KL divergence and sample quality, don't just trust the reward curve.
- For most applied teams, **DPO or supervised preference methods** are easier than full PPO-RLHF and often sufficient.

## My take

InstructGPT is the paper that made LLMs into tools instead of toys. The durable lesson: **alignment is a separate problem from capability**, and solving it (via human preference signals) matters more for real usability than raw parameters. Every assistant you use rides on this recipe. Understand it and you understand both why models are helpful *and* why they're sometimes sycophantic or verbose — those are side effects of optimizing a reward model trained on human ratings. Newer methods (DPO, RLAIF) simplify the training, but the core idea — *train the model to match human preference* — is unchanged.

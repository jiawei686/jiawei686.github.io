---
layout: post
title: "DeepSeek-R1: Reasoning via Reinforcement Learning"
description: "DeepSeek-R1 explained: open-weight reasoning from pure RL, no supervised reasoning data. How it matches o1, and the recipe. arXiv:2501.12948"
date: 2026-05-03
tags: [llm]
subcat: reasoning
---

DeepSeek-R1 (DeepSeek, 2025, arXiv:2501.12948) is the release that showed the world you can get **o1-level reasoning from an open-weight model** — and, more importantly, that you can train reasoning with **reinforcement learning alone**, without hand-labeled reasoning traces. For anyone building with self-hosted models, this was a landmark. I'm writing this because R1's recipe (pure-RL emergence of long reasoning, then distillation) is now a template people reuse, and the "aha moment" it reported is genuinely instructive.

## The goal: o1-style "think long, then answer"

OpenAI's o1 had shown that training models to spend more tokens *reasoning* (internally) before answering dramatically improved hard problems. But o1 was closed. DeepSeek-R1 asked: can we reproduce this with open weights and a transparent method? The answer was yes, and the method was cleaner than expected.

## The headline result: reasoning emerges from RL alone

The most surprising finding came from **R1-Zero**, an experimental model trained *only* with RL on a base model — **no supervised fine-tuning on reasoning data at all**. Given just a reward signal (correct answers to math/code problems), the model *spontaneously* learned to produce long chains of thought, self-verify, and allocate more reasoning to harder problems. The paper called the point where the model discovers "let me think longer" on its own the **"aha moment."**

This matters because it suggests reasoning behavior isn't something you must distill from a teacher — it can *emerge* from rewarding correct outcomes. That's a fundamentally cheaper training story.

## The actual R1 recipe

R1-Zero had a flaw: its reasoning was often unreadable (mixing languages, messy). So the full R1 used a refined pipeline:

1. **Cold-start SFT:** a small amount of high-quality, readable reasoning data to give the model a clean format to build on.
2. **Reasoning RL:** RL on reasoning-heavy tasks (math, code, logic) with correctness rewards.
3. **Rejection sampling + SFT:** generate many reasoning traces, keep the good ones, fine-tune.
4. **RL for helpfulness & safety:** a final RL stage aligning with general usefulness and safety, not just reasoning.

The result matched or approached o1 on math (AIME) and code (Codeforces) benchmarks — from an open-weight model.

## Distillation: small models that reason

A pragmatic part of the release: DeepSeek **distilled** R1's reasoning into smaller models (e.g. 7B, 14B, 32B) by training them on R1's generated reasoning traces. These distilled small models punched far above their weight — a 7B "R1-distill" could reason better than a much larger non-reasoning model. For local deployment this is huge: you can get real reasoning on a single GPU.

## Why this resonated with builders

- **Open weights** meant you could self-host o1-class reasoning without a closed API.
- **Pure-RL emergence** suggested cheaper training paths for specialist reasoners (math tutor, code agent) — reward correctness, let reasoning surface.
- **Distillation** made it runnable on commodity hardware.

I've used R1-distill models locally for math/code assistance and the step-by-step verification quality is noticeably above non-reasoning 7B–14B models.

## Honest limitations

- Reasoning models are **slow and token-hungry** — they generate long internal chains, so latency and cost are higher. Not for every query.
- The RL reward must be **verifiable** (math/code have graders; open-ended tasks don't, which is why R1 focuses there).
- Long chains can still **overthink** simple problems or occasionally ramble.
- "Thinking" is internal; you often want to expose or cap it for UX.

## My take

DeepSeek-R1 is the paper that democratized "slow thinking." The two takeaways I'd internalize: (1) reasoning can *emerge* from RL on verifiable rewards — you don't always need a teacher's traces — and (2) you can *distill* that reasoning into small models and run it locally. If you build anything involving math, code, or logic with self-hosted models, R1-distill variants should be on your shortlist. Just budget for the extra latency; reasoning costs tokens, and that's the price of the accuracy.

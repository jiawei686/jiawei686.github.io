---
layout: post
title: "Reflexion: Verbal Reinforcement Learning for Language Agents"
date: 2026-05-31
tags: [llm]
---

**Paper:** Shinn, Cassano, Berman, Gopinath, Moss, Labash, *Reflexion: Language Agents with Verbal Reinforcement Learning*, NeurIPS 2023. [arXiv:2303.11366](https://arxiv.org/abs/2303.11366)

## Why this paper matters

Most agents improve by updating weights (RL). Reflexion shows you can improve an agent **without any weight update at all** — by having it write down what went wrong and remember it. That is cheap, works with any black-box LLM, and is the basis of the "critic / self-reflect" loop now standard in agent stacks. It is a direct extension of the ReAct loop: same acting, plus a memory of mistakes.

## The core idea: three modules

- **Actor** — produces actions in an environment (ReAct-style), receiving a reward / feedback signal `r`.
- **Evaluator** — scores the trajectory (binary success, or a scalar).
- **Self-Reflection** — an LLM reads the full trajectory plus the feedback and writes a short natural-language reflection of what failed and what to try next. This text is stored in an **episodic memory buffer** `M`.

On the next attempt the actor conditions on `M`:

$$
M_t = M_{t-1} \cup \{\,\text{reflect}(\tau_t, r_t)\,\}
$$

$$
a_t \sim \pi(a \mid \tau_t, M_{t-1})
$$

The "reinforcement" is purely *verbal* — the gradient stays at zero; learning happens in the prompt, not the weights.

## Why verbal feedback works

A scalar reward ("failed, score 0.2") carries almost no information about *how* to improve. A sentence like *"I searched the wrong entity; the answer required the company's headquarters, not its CEO"* is a dense, actionable gradient in natural language. The agent literally tells its future self what to do differently.

## Key results

- **AlfWorld** (embodied tasks): success rose from ~63% (no reflection) to ~97% with reflection.
- **HumanEval** (code generation): clear gains from reflecting on failing tests.
- **HotpotQA**: notable improvements over non-reflective baselines.
- Outperformed replay and RL baselines at equal sample budgets.

## Why it matters today

Reflexion is the memory + self-critique pattern behind iterative coding agents, "agent evaluates its own output" loops, and many multi-step pipelines. It also dovetails with the Generative Agents post — reflection as a mechanism for turning raw experience into higher-level insight. The next post, Tree-of-Thoughts, adds search on top of this kind of deliberation.

## References

- Shinn et al. (2023). *Reflexion: Language Agents with Verbal Reinforcement Learning.* [arXiv:2303.11366](https://arxiv.org/abs/2303.11366)
- Yao et al. (2023). *ReAct.* [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)

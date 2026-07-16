---
layout: post
title: "Reflexion: Verbal Reinforcement Learning for Language Agents"
date: 2026-05-31
tags: [llm]
subcat: agents
---

**Paper:** Shinn, Cassano, Berman, Gopinath, Moss, Labash, *Reflexion: Language Agents with Verbal Reinforcement Learning*, NeurIPS 2023. [arXiv:2303.11366](https://arxiv.org/abs/2303.11366)

Most agents get better by updating weights, which is RL. Reflexion shows you can improve an agent without any weight update at all, just by having it write down what went wrong and remember it. That is cheap, works with any black-box LLM, and became the basis of the critic / self-reflect loop now standard in agent stacks. It is a direct extension of the ReAct loop: same acting, plus a memory of mistakes.

## Three modules, no gradient

- **Actor:** produces actions in an environment (ReAct-style), receiving a reward / feedback signal `r`.
- **Evaluator:** scores the trajectory (binary success, or a scalar).
- **Self-Reflection:** an LLM reads the full trajectory plus the feedback and writes a short natural-language reflection of what failed and what to try next. This text is stored in an **episodic memory buffer** `M`.

On the next attempt the actor conditions on `M`:

$$
M_t = M_{t-1} \cup \{\,\text{reflect}(\tau_t, r_t)\,\}
$$

$$
a_t \sim \pi(a \mid \tau_t, M_{t-1})
$$

The "reinforcement" is purely verbal. The gradient stays at zero; learning happens in the prompt, not the weights.

## Why words beat a score

A scalar reward ("failed, score 0.2") carries almost no information about how to improve. A sentence like *"I searched the wrong entity; the answer required the company's headquarters, not its CEO"* is a dense, actionable gradient in natural language. The agent literally tells its future self what to do differently.

## Results, briefly

- **AlfWorld** (embodied tasks): success rose from ~63% (no reflection) to ~97% with reflection.
- **HumanEval** (code generation): clear gains from reflecting on failing tests.
- **HotpotQA**: notable improvements over non-reflective baselines.
- Outperformed replay and RL baselines at equal sample budgets.

## The memory pattern in the wild

Reflexion is the memory plus self-critique pattern behind iterative coding agents, the "agent evaluates its own output" loop, and plenty of multi-step pipelines. It also dovetails with the Generative Agents post, where reflection becomes the mechanism for turning raw experience into higher-level insight. The honest caveat: the reflection is only as good as the LLM writing it, and nothing guarantees the self-critic is right, only that it sounds plausible. Tree-of-Thoughts, next, adds search on top of this kind of deliberation.

## References

- Shinn et al. (2023). *Reflexion: Language Agents with Verbal Reinforcement Learning.* [arXiv:2303.11366](https://arxiv.org/abs/2303.11366)
- Yao et al. (2023). *ReAct.* [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)

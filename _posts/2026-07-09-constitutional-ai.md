---
layout: post
title: "Constitutional AI: Harmlessness from AI Feedback"
date: 2026-07-09
tags: [llm]
---

**Paper:** Bai, Y., et al. (Anthropic), *Constitutional AI: Harmlessness from AI Feedback*, 2022. [arXiv:2212.08073](https://arxiv.org/abs/2212.08073)

## Why this paper matters

RLHF needs human labelers to judge which response is better — including judging toxic, harmful, or unsettling content. That's a rough job, and it doesn't scale. Constitutional AI replaces most of that human labor with a **constitution**: a short list of principles (e.g. "choose the response that is least likely to cause harm") that the model uses to *critique and revise its own outputs*. The resulting AI-generated preferences train the model. This is **RLAIF** — Reinforcement Learning from *AI* Feedback — and it's the basis for scalable, principled safety tuning.

## The core idea: self-critique, then learn from it

Two phases:

**Phase 1 — Supervised (CAI-SFT).** Given a prompt, the model drafts a response, then critiques it against the constitution, and revises. The revised responses become supervised fine-tuning data. A minimal sketch:

```python
draft = model.generate(prompt)
critique = model.generate(f"Critique this against principle {p}: {draft}")
revised = model.generate(f"Revise per critique: {draft}\n{critique}")
# use `revised` as the SFT target
```

**Phase 2 — RL from AI feedback.** Sample pairs of responses, have the model rank them using the constitution (no human in the loop), train a preference/reward model on those AI labels, then run RL (PPO) against it — exactly the RLHF loop, but the preference signal is machine-generated.

## Why a constitution

The principles make behavior **auditable and adjustable**. Want a different notion of harmlessness? Change the constitution, not the labeling workforce. It also reduces exposure of human raters to harmful content.

## Key results

- A model trained with RLAIF alone was preferred over a model trained with harmfulness RLHF that relied on human labels for the same axis.
- Harmlessness improved with little or no cost to helpfulness — addressing the classic helpfulness/safety trade-off.
- Demonstrated that self-critique can produce useful training signal at scale.

## Why it matters today

Constitutional AI is the "how do we align without burning out human raters" chapter. It pairs naturally with the RLHF-original and DPO posts: same optimization machinery, but the preference labels come from principles instead of people. Many modern safety-tuned models borrow this recipe.

## References

- Bai et al. (2022). *Constitutional AI: Harmlessness from AI Feedback.* [arXiv:2212.08073](https://arxiv.org/abs/2212.08073)
- Ouyang et al. (2022). *InstructGPT.* [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)
- Rafailov et al. (2023). *DPO.* [arXiv:2305.18290](https://arxiv.org/abs/2305.18290)

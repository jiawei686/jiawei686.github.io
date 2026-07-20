---
layout: post
title: "Constitutional AI: Harmlessness from AI Feedback"
description: "Constitutional AI (RLAIF) explained: how Anthropic trained harmlessness from AI feedback instead of human raters. The recipe, with code. arXiv:2212.08073"
date: 2026-07-09
tags: [llm]
subcat: alignment
---

**Paper:** Bai, Y., et al. (Anthropic), *Constitutional AI: Harmlessness from AI Feedback*, 2022. [arXiv:2212.08073](https://arxiv.org/abs/2212.08073)

RLHF leans on human labelers to decide which reply is better. That work includes reading toxic, harmful, or just unsettling content all day. It's a grim job and it doesn't scale. Constitutional AI swaps most of that labor for a constitution: a short list of principles, the paper's own example being "choose the response that is least likely to cause harm," that the model uses to critique and revise its own outputs. Those AI-written preferences become the training signal. The authors call this RLAIF, Reinforcement Learning from AI Feedback, and it's the backbone for safety tuning that doesn't depend on a roomful of raters.

## The recipe: critique yourself, then train on it

Two phases:

**Phase 1 (Supervised, CAI-SFT).** Given a prompt, the model drafts a response, then critiques it against the constitution, and revises. The revised responses become supervised fine-tuning data. A minimal sketch:

```python
draft = model.generate(prompt)
critique = model.generate(f"Critique this against principle {p}: {draft}")
revised = model.generate(f"Revise per critique: {draft}\n{critique}")
# use `revised` as the SFT target
```

**Phase 2 (RL from AI feedback).** Sample pairs of responses and have the model rank them using the constitution, with no human in the loop. You train a preference/reward model on those AI labels, then run RL (PPO) against it. Same loop as RLHF, except the preference signal is machine-generated.

## Why write the principles down

Writing the principles down makes behavior auditable and adjustable. Want a different idea of harmlessness? Change the constitution instead of retraining the labeling workforce. It also keeps human raters away from the worst content, which was the whole point.

## Results, briefly

- A model trained with RLAIF alone was preferred over a model trained with harmfulness RLHF that relied on human labels for the same axis.
- Harmlessness improved with little or no cost to helpfulness, which is the classic helpfulness/safety trade-off.
- Demonstrated that self-critique can produce useful training signal at scale.

## The part I'd flag

This is the "how do we align without burning out human raters" paper. It sits right next to the RLHF and DPO posts: same optimization machinery, but the preference labels come from principles instead of people. My caveat is that a constitution only ever encodes what you remembered to write down, and the model's idea of "harm" is whatever the principles happen to cover. Most safety-tuned models today borrow this recipe, and the open question is whether the principles can keep up with the edge cases users invent.

## References

- Bai et al. (2022). *Constitutional AI: Harmlessness from AI Feedback.* [arXiv:2212.08073](https://arxiv.org/abs/2212.08073)
- Ouyang et al. (2022). *InstructGPT.* [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)
- Rafailov et al. (2023). *DPO.* [arXiv:2305.18290](https://arxiv.org/abs/2305.18290)

---
layout: post
title: "Constitutional AI: Harmlessness from AI Feedback"
description: "Constitutional AI (RLAIF) explained: how Anthropic trained harmlessness from AI feedback instead of human raters. The recipe, with code. arXiv:2212.08073"
date: 2026-07-09
tags: [llm]
subcat: alignment
---

Constitutional AI (Bai et al., 2022, arXiv:2212.08073) asked a pragmatic question: *can we make a model harmless without relying on armies of human raters labeling toxic content?* Their answer — train the model to follow a set of written **principles** (a "constitution") and use AI feedback instead of human feedback (RLAIF) — is both a cost-saving insight and a transparency win. I'm writing this because it reframed alignment from "humans judge everything" to "principles + AI critique," and it's directly relevant to how safer models are built now.

## The motivation: the human cost of RLHF

Standard RLHF needs humans to read and rank model outputs — including toxic, harmful, or disturbing content. That's expensive, slow, and psychologically rough on raters. Constitutional AI's bet: replace most of that human labeling with **AI-generated feedback guided by explicit principles.**

## The recipe

**Stage 1 — Supervised (Constitutional) AI feedback:**
1. Start with a base model.
2. Given a harmful prompt, have the model **self-critique** its draft response against a set of principles (the "constitution" — e.g. "choose the response that is most helpful, honest, and harmless").
3. The model **revises** its response based on that critique, producing a harmless version.
4. Collect these (prompt, revised-response) pairs and do a supervised fine-tune.

So instead of humans writing the harmless answers, the model *critiques and rewrites itself* according to principles.

**Stage 2 — RL from AI Feedback (RLAIF):**
1. Use the model itself (acting as a judge) to compare pairs of responses and pick the more constitutional one — generating preference data *without humans*.
2. Train a reward model on those AI preferences, then optimize with RL (like RLHF but the preferences came from AI, not people).

## Why a "constitution" helps

The constitution is a short list of principles the model is told to follow (helpfulness, honesty, harmlessness, specific dos/don'ts). Advantages:

- **Transparency:** you can *read* what the model is optimized to value, unlike an opaque reward model trained on hidden human judgments.
- **Controllability:** change the constitution, change the behavior — no re-labeling campaign.
- **Scalability & safety for raters:** far less human exposure to harmful content.

## A minimal sketch of self-critique

```python
principles = ["Respond helpfully and harmlessly.",
              "If a request is harmful, explain why you won't comply and offer a safe alternative."]

draft = model.generate(prompt)
critique = model.critique(draft, principles)   # "This draft is unsafe because..."
revised = model.revise(draft, critique)        # safer version
train_data.append((prompt, revised))
```

The model plays both the writer and the principled critic — no human in the loop for these steps.

## Honest caveats

- **AI feedback inherits AI biases.** If the critiquing model has blind spots, the "constitution" won't fully fix them. Garbage principles → garbage alignment.
- **Self-critique can be superficial.** A model might produce a plausible-sounding harmless rewrite that doesn't truly address the issue.
- **It complements, not replaces, human oversight** for high-stakes safety. Anthropic still uses human input; the point is *reducing* reliance, not eliminating it.
- The constitution's wording matters enormously — vague principles give vague behavior.

## My take

Constitutional AI is the "RLAIF" idea that made alignment cheaper and more transparent. The durable insight: you can encode values as **explicit principles** and have the model self-critique toward them, drastically cutting the need for humans to label toxic content. For builders, the practical takeaway is a pattern — *generate critiques and revisions against a written rubric* — which you can reuse for any "make outputs follow these rules" task (tone, safety, format), not just harmlessness. Just remember: the constitution is only as good as you write it, and AI feedback needs spot-checking by humans for anything that actually matters.

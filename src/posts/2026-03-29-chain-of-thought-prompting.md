---
layout: post
title: "Chain-of-Thought Prompting: Let the Model Think Step by Step"
date: 2026-03-29
tags: [llm]
subcat: reasoning
description: "Chain-of-thought prompting improves reasoning by eliciting intermediate steps before the final answer."
---

Chain-of-Thought (CoT) prompting (Wei et al., 2022) is probably the highest-ROI prompting technique ever published. It costs you almost nothing — a sentence in the prompt — and can lift a model's accuracy on math, logic, and multi-step tasks by double digits. I'm writing this because CoT is the foundation of essentially all LLM "reasoning" behavior you see today, and understanding *why* it works changes how you prompt.

## The problem: models rush to the answer

Give a model a multi-step problem and it often blurts the final answer, skipping the intermediate reasoning. For simple questions that's fine. For anything requiring two or more reasoning steps — arithmetic, logic puzzles, multi-hop questions — skipping steps means mistakes compound and you get a confident wrong answer with no way to see where it broke.

## The fix: ask for the steps

CoT is trivial to apply. Instead of:

```
Q: Roger has 5 tennis balls. He buys 2 cans of 3. How many now?
A: 11
```

You prompt with examples that show the *reasoning*:

```
Q: ... 
A: Roger started with 5. 2 cans of 3 = 6. 5 + 6 = 11. So the answer is 11.
```

Or, even simpler, just append: *"Let's think step by step."* That single phrase reliably triggers the model to generate intermediate steps, and the final answer is usually correct far more often.

## Why it works (the honest version)

- **It forces sequential computation.** A Transformer generates one token at a time; by writing out steps, the model creates intermediate tokens that later tokens can attend to. Each step becomes a "scratchpad" the model reasons over, instead of trying to solve everything in the final hop.
- **It aligns the output distribution with how the training data looks.** Reasoning examples on the web show workings-out, so generating steps matches the model's learned patterns.
- **It makes errors inspectable.** When the answer is wrong, you can see *which step* failed — huge for debugging and for building trust.

## What surprised the authors

The gain **scales with model size**. On small models (e.g. <10B), CoT barely helped. On large models (PaLM 540B, and today's frontier models), the jump was dramatic. This is another emergent capability: the *technique* is the same, but only big enough models can actually use the scratchpad well. I've reproduced this locally — a 7B model does a mediocre job with CoT; a 70B+ does dramatically better.

## Practical guidance

- **Always try CoT on multi-step tasks** before reaching for more complex methods. It's free.
- Use **few-shot CoT** (show 2–3 worked examples) when zero-shot ("think step by step") underperforms — especially for domain-specific reasoning.
- **Extract the final answer reliably.** Models sometimes bury the result; I often ask for "the answer is X" format or parse the last number.
- Pair CoT with **self-consistency** (covered separately) when you need maximum accuracy on hard problems.
- CoT isn't magic for factual recall or creative writing; it shines on reasoning/computation.

## Common failure modes

- The model can produce a *plausible but wrong* chain — fluent reasoning that arrives at the wrong conclusion. CoT improves *rate* of correctness, not guarantees.
- Very long chains can drift or contradict themselves; keeping the task scoped helps.
- On small/local models, the chain quality is weak; don't over-trust it.

## My take

If you learn one prompting technique, make it this one. "Let's think step by step" is the closest thing we have to a universal reasoning amplifier, and it directly enables everything that followed: self-consistency samples many chains, tree-of-thoughts searches over them, and modern "reasoning models" basically train the model to always do CoT internally. The mental model: give the model a scratchpad, and it'll use it. Build your LLM features assuming CoT is on by default for anything that isn't trivial.

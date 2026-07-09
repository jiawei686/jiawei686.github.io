---
layout: post
title: "Chain-of-Thought Prompting: Let the Model Think Step by Step"
date: 2026-03-29
tags: [llm]
---

**Paper:** Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*, 2022. [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

## The observation

For multi-step problems (arithmetic, commonsense, symbolic), LLMs were weak when asked for the answer directly. The fix was almost absurdly simple: **prompt the model to show its intermediate reasoning steps before the final answer.** This "chain of thought" (CoT) unlocked a large fraction of latent reasoning ability.

## Two flavors

**Few-shot CoT.** Give exemplars that include a worked-out reasoning trace, then the question:

```
Q: Roger has 5 tennis balls. He buys 2 cans of 3. How many now?
A: Roger started with 5. 2 cans of 3 = 6. 5 + 6 = 11. Answer: 11.

Q: <real question>
A:
```

**Zero-shot CoT.** Just append the magic phrase *"Let's think step by step."* — no exemplars needed.

## Why it helps

Generating the reasoning tokens gives the model more "compute" (sequential steps) to decompose the problem, and each step is an easier prediction than the leap to the answer. It also makes the model's reasoning inspectable and debuggable.

## Key results

- GSM8K (grade-school math): PaLM 540B jumped from **56%** (direct) to **72%** (CoT).
- Gains scale with model size — CoT barely helped small models but transformed large ones. This is an emergent property of scale.
- Improvements across arithmetic, commonsense (StrategyQA), and symbolic reasoning.

## A quick demo

```python
prompt = """Solve step by step.
Q: A shop sells apples at 3 for $2. I buy 12 apples and a $5 bread. Total?
A: Let's think step by step."""
# Model returns: 12 apples = 4 sets of 3 -> 4 * $2 = $8. Plus $5 bread = $13. Answer: $13.
```

## Why it matters

CoT is the conceptual ancestor of everything that followed: self-consistency sampling ("let's generate many reasoning paths and vote"), tool-use, and the explicit "reasoning tokens" you now see in o1/R1-style models. It showed that *how you ask* is as important as *what you ask*, and that reasoning can be elicited without changing model weights.

## References

- Wei et al. (2022). *Chain-of-Thought Prompting.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)
- Wang et al. (2022). *Self-Consistency Improves Chain of Thought.* [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)

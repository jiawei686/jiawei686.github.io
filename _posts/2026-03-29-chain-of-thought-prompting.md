---

layout: post
title: "Chain-of-Thought Prompting: Let the Model Think Step by Step"
date: 2026-03-29
tags: [llm]
subcat: reasoning
description: "Chain-of-thought prompting improves reasoning by eliciting intermediate steps before the final answer."
---


**Paper:** Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*, 2022. [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

On multi-step problems, arithmetic, commonsense, symbolic, LLMs were weak when you asked for the answer directly. The fix was almost embarrassingly simple. Prompt the model to show its intermediate reasoning steps before it commits to a final answer. That "chain of thought" (CoT) unlocked a big chunk of reasoning ability that was sitting there the whole time.

## Two ways to do it

**Few-shot CoT.** Give exemplars that include a worked-out reasoning trace, then the question:

```
Q: Roger has 5 tennis balls. He buys 2 cans of 3. How many now?
A: Roger started with 5. 2 cans of 3 = 6. 5 + 6 = 11. Answer: 11.

Q: <real question>
A:
```

**Zero-shot CoT.** Just append the magic phrase "Let's think step by step." No exemplars needed.

## Why showing your work helps

Spelling out the reasoning gives the model more compute in the literal sense: more sequential steps to break the problem apart, and each step is an easier prediction than a blind leap to the answer. The side benefit is that you can read the reasoning, which makes the model's failures inspectable instead of mysterious.

## Results, briefly

- GSM8K (grade-school math): PaLM 540B jumped from **56%** (direct) to **72%** (CoT).
- Gains scale with model size. CoT barely helped small models but transformed large ones, which is an emergent property of scale.
- Improvements across arithmetic, commonsense (StrategyQA), and symbolic reasoning.

## A tiny demo

```python
prompt = """Solve step by step.
Q: A shop sells apples at 3 for $2. I buy 12 apples and a $5 bread. Total?
A: Let's think step by step."""
# Model returns: 12 apples = 4 sets of 3 -> 4 * $2 = $8. Plus $5 bread = $13. Answer: $13.
```

## The honest take

CoT is the ancestor of most of what came after. Self-consistency sampling, where you generate many reasoning paths and vote. Tool-use. The explicit reasoning tokens in o1 and R1 style models. The real lesson was that how you ask matters as much as what you ask, and you can pull reasoning out of a model without touching its weights. My honest take: it's a cheap trick that works far better than it has any right to, and we still don't fully know why.

## References

- Wei et al. (2022). *Chain-of-Thought Prompting.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)
- Wang et al. (2022). *Self-Consistency Improves Chain of Thought.* [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)

<!-- EXPANDED -->

## Reasoning as generated steps

Chain-of-thought (CoT) prompting asks the model to produce a sequence of intermediate reasoning steps before the answer. Instead of jumping from question to solution, the model writes out "Step 1... Step 2... therefore...". This spreads a hard computation across more tokens, which transformer decoders handle far better than a single leap.

## Two ways to trigger it

- **Few-shot CoT:** include exemplars that show the worked-out reasoning.
- **Zero-shot CoT:** simply append "Let's think step by step." -- surprisingly effective.

## When it helps (and when it doesn't)

CoT mainly boosts tasks with arithmetic, commonsense, and symbolic reasoning. On tasks the model already nails in one shot, it adds little. It also depends on the model being large enough; the effect is weak below roughly 10B parameters. The deeper idea -- make the model externalize its reasoning -- became the foundation for ReAct, self-consistency, and modern reasoning models.

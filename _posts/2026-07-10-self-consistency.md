---
layout: post
title: "Self-Consistency: Improving Chain-of-Thought Reasoning"
date: 2026-07-10
tags: [llm]
subcat: reasoning
---

**Paper:** Wang, X., et al., *Self-Consistency Improves Chain-of-Thought Reasoning in Language Models*, ICLR 2023. [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)

## Why this paper matters

Chain-of-Thought (CoT) showed that asking a model to "think step by step" unlocks reasoning. But a single greedy reasoning path is fragile — one bad step derails the answer. Self-Consistency makes CoT *robust* with a tiny change: **sample many reasoning paths and take the majority vote on the final answer.** It's a decoding trick, not a training trick, and it lifted accuracy on math and commonsense benchmarks by double digits. If you do any reasoning with LLMs, this is the cheapest gain you can get.

## The core idea: marginalize over reasoning paths

A reasoning problem usually has *many* valid chains that reach the same answer but *few* that reach a wrong one. Greedily picking one path ignores that. Instead:

1. Sample $k$ diverse CoT paths $\{z_1, \dots, z_k\}$ with temperature $> 0$.
2. Parse the final answer $a_i$ from each path.
3. Aggregate by majority vote (or weighted by path probability):

$$
\hat{a} = \operatorname*{argmax}_{a} \sum_{i:\, \text{ans}(z_i) = a} p(z_i \mid x)
$$

Intuition: the correct answer is a *fixed point* — many independent samplings converge to it; wrong answers scatter.

## A minimal sketch

```python
paths = [model.generate(prompt, temperature=0.7) for _ in range(20)]
answers = [parse_answer(p) for p in paths]
final = max(set(answers), key=answers.count)   # majority vote
```

No extra training, no verifier model required.

## Key results

- GSM8K: ~70% → ~78% (and higher with more samples) for PaLM 540B.
- Large gains on MATH, StrategyQA, ARC-challenge, and other multi-step tasks.
- Near or surpassing supervised verifier methods at the time, with zero additional supervision.

## Why it matters today

Self-Consistency is the practical companion to the CoT post. CoT gives the model a reasoning *process*; self-consistency makes that process *reliable*. It's also the conceptual ancestor of "test-time compute / sampling many thoughts" ideas that reasoning models (and Tree-of-Thought search) build on.

## References

- Wang et al. (2022). *Self-Consistency Improves Chain-of-Thought Reasoning in Language Models.* ICLR 2023. [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)
- Wei et al. (2022). *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

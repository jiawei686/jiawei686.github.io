---
layout: post
title: "Self-Consistency: Improving Chain-of-Thought Reasoning"
description: "Self-Consistency explained: sample many reasoning paths, take the majority vote. The cheapest accuracy win for LLM reasoning. arXiv:2203.11171"
date: 2026-07-10
tags: [llm]
subcat: reasoning
---

**Paper:** Wang, X., et al., *Self-Consistency Improves Chain-of-Thought Reasoning in Language Models*, ICLR 2023. [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)

CoT showed that asking a model to think step by step unlocks reasoning. But a single greedy path is brittle. One bad step and the whole answer goes off the rails. Self-Consistency fixes this with a change so small it feels like a cheat: sample a bunch of reasoning paths, then take the majority vote on the final answer. No training, no verifier. It lifted accuracy on math and commonsense benchmarks by double digits. If you do any reasoning with LLMs, this is the cheapest win available.

## Marginalizing over paths

A reasoning problem usually has many valid chains that reach the same answer but few that reach a wrong one. Greedily picking one path throws that away. Instead:

1. Sample $k$ diverse CoT paths $\{z_1, \dots, z_k\}$ with temperature $> 0$.
2. Parse the final answer $a_i$ from each path.
3. Aggregate by majority vote (or weighted by path probability):

$$
\hat{a} = \operatorname*{argmax}_{a} \sum_{i:\, \text{ans}(z_i) = a} p(z_i \mid x)
$$

The intuition is that the correct answer is a fixed point. Sample the model many times and the right answer keeps showing up, while the wrong ones scatter.

## The six-line version

```python
paths = [model.generate(prompt, temperature=0.7) for _ in range(20)]
answers = [parse_answer(p) for p in paths]
final = max(set(answers), key=answers.count)   # majority vote
```

No extra training, no verifier model required.

## Results, briefly

- GSM8K: ~70% → ~78% (and higher with more samples) for PaLM 540B.
- Large gains on MATH, StrategyQA, ARC-challenge, and other multi-step tasks.
- Near or surpassing supervised verifier methods at the time, with zero additional supervision.

## The part worth keeping

Self-Consistency is the practical companion to the CoT post. CoT hands the model a reasoning process; self-consistency makes that process hold up. It's also the ancestor of the "sample many thoughts at test time" idea that reasoning models and Tree-of-Thought search lean on. The catch I'd flag: you pay for it in tokens, and on a question with no real path to a fixed point, more samples just buy you more confident noise.

## References

- Wang et al. (2022). *Self-Consistency Improves Chain-of-Thought Reasoning in Language Models.* ICLR 2023. [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)
- Wei et al. (2022). *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

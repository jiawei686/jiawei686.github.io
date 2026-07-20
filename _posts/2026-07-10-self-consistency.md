---
layout: post
title: "Self-Consistency: Improving Chain-of-Thought Reasoning"
description: "Self-Consistency explained: sample many reasoning paths, take the majority vote. The cheapest accuracy win for LLM reasoning. arXiv:2203.11171"
date: 2026-07-10
tags: [llm]
subcat: reasoning
---

Self-Consistency (Wang et al., 2022, arXiv:2203.11171) is, in my experience, the **best accuracy-per-dollar trick** in LLM reasoning. It builds directly on Chain-of-Thought: instead of generating one reasoning path, you generate *many*, then take the **majority answer**. I'm writing this because it's shockingly effective, trivial to implement, and a perfect example of "let the model vote instead of guess once."

## The problem with a single chain

Even with CoT, a single sampled reasoning path can go wrong — one arithmetic slip, one bad leap, and you get a wrong final answer. But here's the key observation: if you sample *many* reasoning paths for the same problem, the *correct* answer tends to be reached by *multiple* diverse paths, while wrong answers are scattered across different mistakes. So the **majority** is far more reliable than any single sample.

## The method, step by step

1. Prompt the model with Chain-of-Thought.
2. Sample `k` reasoning paths (e.g. `k=5` to `40`) with high temperature so they differ.
3. Extract the final answer from each path.
4. Take the **most common answer** (majority vote). Optionally weight by path confidence.

That's it. No extra training, no new model, no verifier needed.

## Why it works (intuition)

Reasoning is a search over possible solution trajectories. A single sample is one trajectory — noisy. Many samples explore the trajectory space; the *correct* destination is a strong attractor (many routes converge there), while each wrong destination has only one or two routes. Majority voting selects the attractor. This is the same statistical principle behind ensemble methods in ML, applied to reasoning paths.

## How much does it help?

Substantially. On arithmetic and commonsense reasoning benchmarks the paper reported large gains (e.g. +10–15 points on GSM8K-style math) just from majority voting over ~20–40 samples. In my own use, even `k=5` often fixes ambiguous or borderline problems, and `k=10–20` is the sweet spot before diminishing returns.

## Practical guidance

- **Set a moderate temperature** (e.g. 0.7–0.9) so paths actually diverge; at temperature 0 they'd all be identical and voting is pointless.
- **Extract answers robustly.** The fragile part is parsing "the answer is 42" from free text. I use a strict format (e.g. "Answer: <number>") or a small regex, and fall back to the longest/most-confident parse.
- **Pick k by budget.** k=5 is cheap and helps; k=20–40 for high-stakes tasks. Each extra sample costs a full generation, so it's a latency/cost trade-off.
- **It pairs perfectly with verifiers.** If you have a checker (code that runs, a math grader), prefer *best-of-n by verifier* over blind majority — but majority is the fallback when no verifier exists.

## When NOT to use it

- **Open-ended generation / creative writing:** there's no single "correct answer" to vote on, and you don't want 20 near-identical essays.
- **Strict latency constraints:** it multiplies generation cost by k. For real-time chat you usually can't sample 20 times per message (though some "reasoning" services do this server-side).
- **Factual questions with a known answer in context:** one good RAG retrieval beats 20 guesses.

## My take

Self-consistency is the technique I reach for first whenever a reasoning task is *important and checkable by majority*. It's almost free to implement (a loop and a counter) and routinely beats a single精心-crafted chain. The mental model: don't ask the model once and trust it; ask several times, let the answers vote. Combine with CoT (the paths) and you get most of the "reasoning model" behavior without training one. For production, the only real cost is latency — and you can dial k to fit your budget.

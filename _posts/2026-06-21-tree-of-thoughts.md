---
layout: post
title: "Tree of Thoughts: Deliberate Problem Solving"
date: 2026-06-21
tags: [llm]
subcat: reasoning
---

**Paper:** Yao, Yu, Zhao, Shafran, Griffiths, Cao, Narasimhan, *Tree of Thoughts: Deliberate Problem Solving with Large Language Models*, NeurIPS 2023. [arXiv:2305.10601](https://arxiv.org/abs/2305.10601)

## Why this paper matters

Chain-of-Thought is a **single left-to-right path**. If it takes a wrong step early, it can never recover — there is no lookahead and no backtracking. Tree of Thoughts (ToT) reframes reasoning as a **search** over a tree of partial solutions, so the model can explore, evaluate, and backtrack. This is the difference between "guessing the next word" and "actually solving." It is a key ingredient in the "agentic reasoning" trend (and echoes the search behind o1-style models).

## The core idea: thoughts as search nodes

- A **thought** is a coherent intermediate step (a sentence or a few lines of reasoning).
- ToT maintains a tree of **states** `s`; each state has candidate next thoughts `T(s)`.
- Three LLM roles drive the search:
  - **Propose** — generate candidate next thoughts from a state.
  - **Evaluate / Value** — score each state (a confidence score, or a vote across samples) to guide the search.
  - **Search** — BFS keeps the top-`b` states per step; DFS descends with backtracking when a state is judged dead.

The final answer is read from the best leaf found.

## BFS variant in one line

At each depth, keep only the `b` highest-valued states (e.g., `b = 5`); expand those; repeat. This systematically explores before committing — unlike CoT, which commits instantly.

## Key results

- **Game of 24** (combine 4 numbers into 24): CoT scored ~4% success; ToT reached **~74%**. The task needs planning a few steps ahead, exactly where CoT fails.
- Gains on **creative writing** (where a global plan matters) and **mini crosswords** (local search helps).
- The evaluation step (voting / scoring) was essential — generation alone was not enough.

## Why it matters today

ToT is *deliberate* problem solving: it adds lookahead and backtracking on top of the ReAct loop (acting) and Reflexion (learning from failure). When an agent faces a task with a verifiable goal — math, code, puzzles, multi-step planning — a search over thoughts beats a straight shot. Modern "reasoning models" are, in spirit, ToT at scale with a learned verifier.

## References

- Yao et al. (2023). *Tree of Thoughts: Deliberate Problem Solving with Large Language Models.* [arXiv:2305.10601](https://arxiv.org/abs/2305.10601)
- Wei et al. (2022). *Chain-of-Thought Prompting.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

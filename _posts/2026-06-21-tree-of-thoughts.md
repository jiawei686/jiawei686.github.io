---
layout: post
title: "Tree of Thoughts: Deliberate Problem Solving"
date: 2026-06-21
tags: [llm]
subcat: reasoning
---

**Paper:** Yao, Yu, Zhao, Shafran, Griffiths, Cao, Narasimhan, *Tree of Thoughts: Deliberate Problem Solving with Large Language Models*, NeurIPS 2023. [arXiv:2305.10601](https://arxiv.org/abs/2305.10601)

Chain-of-Thought is one left-to-right path. Take a wrong step early and it's stuck, because there's no lookahead and no way back. Tree of Thoughts (ToT) reframes reasoning as a search over a tree of partial solutions, so the model can explore, judge, and backtrack. That's the gap between guessing the next word and actually solving something. It's a core piece of the agentic reasoning trend, and you can see the same search instinct in o1 style models.

## Thoughts become nodes

- A **thought** is a coherent intermediate step, a sentence or a few lines of reasoning.
- ToT keeps a tree of states `s`, and each state has candidate next thoughts `T(s)`.
- Three LLM roles drive the search:
  - **Propose** generates candidate next thoughts from a state.
  - **Evaluate / Value** scores each state, either a confidence score or a vote across samples, to steer the search.
  - **Search** uses BFS to keep the top-`b` states per step, or DFS to descend and backtrack when a state looks dead.

The final answer comes from the best leaf found.

## The BFS version, in one line

At each depth, keep only the `b` highest-valued states (say `b = 5`), expand those, and repeat. It explores systematically before committing, which is the opposite of CoT committing on the spot.

## Results, briefly

- **Game of 24** (combine 4 numbers into 24): CoT scored ~4% success; ToT reached **~74%**. The task needs planning a few steps ahead, exactly where CoT fails.
- Gains on **creative writing** (where a global plan matters) and **mini crosswords** (local search helps).
- The evaluation step (voting / scoring) was essential. Generation alone was not enough.

## Where it pays off, and where it wobbles

ToT is deliberate problem solving. It layers lookahead and backtracking on top of the ReAct loop (acting) and Reflexion (learning from failure). When an agent hits a task with a verifiable goal, math, code, puzzles, or multi-step planning, a search over thoughts beats a straight shot. Modern reasoning models are ToT at scale with a learned verifier, in spirit. The part I'd flag: the search is only as good as the value function, and a weak scorer turns the tree into an expensive way to wander.

## References

- Yao et al. (2023). *Tree of Thoughts: Deliberate Problem Solving with Large Language Models.* [arXiv:2305.10601](https://arxiv.org/abs/2305.10601)
- Wei et al. (2022). *Chain-of-Thought Prompting.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

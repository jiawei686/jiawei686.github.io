---
layout: post
title: "Tree of Thoughts: Deliberate Problem Solving"
description: "Tree of Thoughts explained: how LLMs explore, judge, and backtrack through a search tree instead of one greedy chain. Intuition + examples. arXiv:2305.10601"
date: 2026-06-21
tags: [llm]
subcat: reasoning
---

Tree of Thoughts (ToT, Yao et al., 2023, arXiv:2305.10601) takes Chain-of-Thought and makes it *deliberate*. Instead of generating one linear reasoning path and hoping it's right, ToT has the model explore **many** paths, evaluate them, and **backtrack** when one looks wrong. It's the difference between free-associating an answer and actually doing a search. I'm writing this because ToT crystallizes a core idea in LLM reasoning — *search over thoughts* — that underlies a lot of agentic and "slow thinking" systems.

## The limitation of a single chain

Chain-of-Thought gives one path. If that path makes a bad early decision, the model is committed — it can't undo it. For problems where the first step is consequential (planning, puzzles, games), a single greedy chain fails often. Humans don't do this; we consider options, judge them, and backtrack.

## The ToT idea: thoughts as a search tree

ToT frames reasoning as a tree search:

1. **Decompose** the problem into steps (thought states).
2. At each step, **generate multiple candidate thoughts** (branches) — not just one.
3. **Evaluate** each candidate with the LLM (a heuristic score, or a "is this promising?" judgment).
4. **Search** the tree (BFS/DFS) using those scores, **pruning** bad branches and **backtracking** when needed.
5. Reach a leaf that solves the problem, or the best-scoring path.

So the model isn't just "thinking step by step" — it's thinking step by step, *considering alternatives at each step, and choosing among them*.

## A concrete example: the 24-game

The paper's classic demo is the "24 game" (given 4 numbers, combine with +−×÷ to make 24). A single CoT path often commits to a bad intermediate expression and fails. ToT generates several candidate next-steps, asks the model "does this look promising?" for each, and only expands promising ones — then backtracks if a branch dead-ends. Success rate jumps dramatically (the paper reported something like 4% → 74% on that task).

## Why this matters beyond puzzles

ToT is a blueprint for **deliberate reasoning**:

- **Planning:** explore plan branches before committing.
- **Agentic search:** an agent tries an action, evaluates, retries — ToT formalizes that loop.
- **Reliability:** evaluation + backtracking catch catastrophic early errors a single chain would hide.

It also connects to how modern "reasoning models" behave: they effectively do more internal search/verification before answering. ToT was an early, explicit version of that.

## The cost, honestly stated

Search is **expensive**. You're now generating many thoughts, scoring each, and possibly re-expanding — easily 5–20x the tokens of a single chain. For most queries that's overkill. I use ToT-style search only for:

- Hard, high-stakes, verifiable problems (math proofs, planning, code that must compile).
- Tasks where you have a cheap *verifier* (a test, a checker) to score branches — that's the realistic version of "evaluate" in production.

## Practical implementation notes

- You need a **scorer**. The LLM-as-judge scorer is noisy; prefer a deterministic verifier when available (unit tests, solvers).
- **Breadth and depth** are hyperparameters (how many thoughts per step, how deep to search). Start small.
- Combine with **self-consistency** (sample many full trees / paths, take majority) for even better results when verification is hard.

## My take

ToT is less a "use it everywhere" technique and more a *conceptual key*: reasoning quality improves when you let the model search and self-correct instead of committing to the first path. Most production systems can't afford full tree search, but the principle shows up constantly — retry loops, branch-and-test agents, verifier-guided generation. If a problem is hard and *checkable*, borrow ToT's shape: generate options, evaluate, backtrack. Don't just ask once and trust it.

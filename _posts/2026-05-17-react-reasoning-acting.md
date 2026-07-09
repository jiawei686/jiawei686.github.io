---
layout: post
title: "ReAct: Reasoning + Acting in Language Models"
date: 2026-05-17
tags: [llm]
---

**Paper:** Yao, Zhao, Yu, Du, Shafran, Narasimhan, Cao, *ReAct: Synergizing Reasoning and Acting in Language Models*, ICLR 2023. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)

## Why this paper matters

A bare LLM can **reason** (Chain-of-Thought) or **act** (call a tool), but not both well at once. CoT reasons in a vacuum — it can't fetch a fact it doesn't know, so it hallucinates. Act-only agents execute tools but have no trace of why, so they stall on multi-step plans. ReAct interleaves the two: the model thinks out loud, then acts, observes the result, and continues. This **Thought → Action → Observation** loop is, in practice, what people mean by "an LLM agent."

## The core idea: interleaved trajectories

A ReAct prompt supplies a few trajectories of this shape:

```
Thought: I need the population of the capital of Romania.
Action: Search[Romania capital]
Observation: Bucharest
Thought: Now look up Bucharest's population.
Action: Search[Bucharest population]
Observation: 1.8 million
Answer: 1.8 million
```

The agent is a policy that, given the trajectory `τ` so far, emits the next `(Thought, Action)`. The environment executes the `Action`, appends the `Observation`, and the loop repeats until a `Finish` action.

## Why synergizing beats either alone

| Style | Reasons? | Uses tools? | Failure mode |
|-------|----------|-------------|--------------|
| CoT   | yes      | no          | hallucinates unknown facts |
| Act-only | no    | yes         | no multi-step planning |
| **ReAct** | **yes** | **yes**   | robust, grounded, debuggable |

The explicit `Thought` gives the model a scratchpad to decompose the problem; the `Observation` grounds it in reality. A human can also drop into the loop (human-in-the-loop ReAct).

## Minimal loop sketch

```python
def react(question, max_steps=6):
    traj = f"Question: {question}\n"
    for _ in range(max_steps):
        out = llm(traj + "\nThought:")          # model emits Thought + Action
        thought, action = parse(out)
        obs = env.step(action)                  # e.g. Search / Wikipedia / Calc
        traj += f"Thought: {thought}\nAction: {action}\nObservation: {obs}\n"
        if action.startswith("Finish"):
            return obs
    return traj
```

## Key results

- On multi-hop QA (**HotpotQA**) and fact verification (**FEVER**), ReAct with PaLM-540B beat both CoT and Act-only baselines.
- On interactive tasks (**AlfWorld**, **WebShop**), ReAct substantially outperformed imitation- and RL-trained agents.
- Adding a human to the loop closed most remaining errors.

## Why it matters today

ReAct is the skeleton of LangChain, LlamaIndex, and most "agent" frameworks. The Reflexion and Tree-of-Thoughts posts in this series build directly on it — ReAct gives the loop; those add memory and search.

## References

- Yao et al. (2023). *ReAct: Synergizing Reasoning and Acting in Language Models.* [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
- Wei et al. (2022). *Chain-of-Thought Prompting.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

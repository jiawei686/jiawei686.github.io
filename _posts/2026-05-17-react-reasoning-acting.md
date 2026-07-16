---
layout: post
title: "ReAct: Reasoning + Acting in Language Models"
date: 2026-05-17
tags: [llm]
subcat: agents
---

**Paper:** Yao, Zhao, Yu, Du, Shafran, Narasimhan, Cao, *ReAct: Synergizing Reasoning and Acting in Language Models*, ICLR 2023. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)

A raw LLM can reason (that's Chain-of-Thought) or act (that's calling a tool), but it does neither well when forced to pick one. CoT reasons in a vacuum: it can't fetch a fact it doesn't know, so it makes one up. Act-only agents run tools but leave no trail of why, so they fall apart on anything multi-step. ReAct just interleaves the two: think out loud, act, see what happened, keep going. That Thought → Action → Observation loop is, in practice, what people mean when they say "LLM agent."

## How the trajectories look

A ReAct prompt hands the model a few examples shaped like this:

```
Thought: I need the population of the capital of Romania.
Action: Search[Romania capital]
Observation: Bucharest
Thought: Now look up Bucharest's population.
Action: Search[Bucharest population]
Observation: 1.8 million
Answer: 1.8 million
```

The agent is a policy: given the trajectory `τ` so far, it emits the next `(Thought, Action)`. The environment runs the `Action`, tacks on the `Observation`, and you loop until a `Finish` action shows up.

## Why mixing them beats either alone

| Style | Reasons? | Uses tools? | Failure mode |
|-------|----------|-------------|--------------|
| CoT   | yes      | no          | hallucinates unknown facts |
| Act-only | no    | yes         | no multi-step planning |
| **ReAct** | **yes** | **yes**   | grounded, debuggable |

The explicit `Thought` gives the model a scratchpad to break the problem down. The `Observation` yanks it back to reality. You can also drop a human into the loop mid-run, which closes a lot of the dumb errors.

## A minimal loop

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

## What they showed

- On multi-hop QA (**HotpotQA**) and fact-checking (**FEVER**), ReAct on PaLM-540B beat both the CoT and Act-only baselines.
- On interactive tasks (**AlfWorld**, **WebShop**), it pulled well ahead of agents trained with imitation or RL.
- Adding a human to the loop cleaned up most of what was left.

## Where this actually shows up

Most "agent" frameworks, LangChain and LlamaIndex included, are ReAct wearing a different jacket. The Reflexion and Tree-of-Thoughts posts build straight on top of it: ReAct gives you the loop, those add memory and search. The thing I'd push back on: the paper makes it look clean, but in production the real failure mode is the loop going in circles, and nothing in the original fixes that.

## References

- Yao et al. (2023). *ReAct: Synergizing Reasoning and Acting in Language Models.* [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
- Wei et al. (2022). *Chain-of-Thought Prompting.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

---
layout: post
title: "ReAct: Reasoning + Acting in Language Models"
date: 2026-05-17
tags: [llm]
subcat: agents
description: "ReAct interleaves reasoning traces and actions so a language model can plan, use tools, and observe results — the blueprint for most LLM agents today."
---

ReAct (Yao et al., 2022) is the paper that gave us the recognizable shape of an **LLM agent**: think, act, observe, repeat. Before ReAct, reasoning (Chain-of-Thought) and acting (using tools) were treated as separate things. ReAct showed you get better results by **interleaving** them — let the model reason about what to do, take an action, see the result, and reason again. I'm writing this because if you've built or used an AI agent, you've used ReAct's loop, whether you knew the name or not.

## The idea: interleave thought and action

A ReAct prompt structures the model's output as an alternating sequence:

```
Thought: I need to find the population of France.
Action: search["France population"]
Observation: France has ~67 million people.
Thought: Now I can answer the question.
Action: finish["The population is about 67 million."]
```

The model isn't just chain-of-thought-ing privately; it's **externalizing a plan**, taking a real action (calling a tool), ingesting the **observation**, and updating its reasoning. That observation step is the key — it grounds the next thought in actual results, not the model's possibly-wrong guess.

## Why interleaving beats doing them separately

- **Pure reasoning** (CoT) has no access to external facts — it hallucinates or guesses when it doesn't know.
- **Pure acting** (a planner that just fires tools) has no reflective step — it can't recover from a bad tool result or reconsider.
- **ReAct combines both:** reasoning decides the action, the action's observation feeds back into reasoning. This lets the agent *correct course* mid-task — e.g. "that search returned nothing useful, let me try a different query."

## What it enabled

ReAct is the direct ancestor of tool-using agents. The "Thought/Action/Observation" loop is now the default skeleton for agent frameworks (and you'll see echoes of it in ReAct-style prompting in LangChain, AutoGen, and custom agents). It showed that **giving a model a simple action space + a scratchpad of observations** produces surprisingly capable task-solving behavior.

## Practical implementation notes

- **Define a small, clear action space.** Too many tools = the model gets confused about which to use. Start with 2–5 actions.
- **Make observations crisp and parseable.** The model reasons over the observation text, so noisy/verbose tool output hurts. I trim tool results aggressively before feeding them back.
- **Parse the action reliably.** You need to extract "search[...]" from generated text and dispatch it. A strict format + robust parser avoids loops.
- **Add a stop/answer action** so the agent knows when to finish instead of acting forever.
- **Guard against loops.** Agents can repeat the same failed action; add a max-steps limit and simple deduplication.

## Limitations to respect

- The agent can still **reason poorly** and pick bad actions; ReAct doesn't fix a weak base model, it just structures its attempts.
- **Latency and cost** grow with steps; each action is another model call.
- Long action sequences can **drift off-task**; keeping the original goal in the prompt helps.
- Tool failures (API errors, timeouts) need handling, or the agent spins.

## My take

ReAct is the minimal viable agent. If you're building anything that "uses tools to accomplish a goal," you're implementing some version of Thought/Action/Observation — and that structure is the whole game. The insight to keep: **observations are fuel.** A reasoning trace alone guesses; a reasoning trace fed by real tool outputs *corrects*. When I build agents, I spend more time designing clean observations and a tight action space than on the prompt itself — that's where ReAct succeeds or fails in practice.

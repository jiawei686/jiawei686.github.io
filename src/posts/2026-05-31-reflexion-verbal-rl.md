---
layout: post
title: "Reflexion: Verbal Reinforcement Learning for Language Agents"
description: "Reflexion explained: improve language agents with verbal RL, no weight updates, just memory of mistakes. The self-reflect loop, with code. arXiv:2303.11366"
date: 2026-05-31
tags: [llm]
subcat: agents
---

Reflexion (Shinn et al., 2023, arXiv:2303.11366) solves a frustrating problem with LLM agents: they make the *same mistake twice*. A standard ReAct agent that fails a task will, on a retry, often repeat the exact bad action. Reflexion adds a **self-reflection step** that turns failures into memory the agent consults next time. I'm writing this because it's a cheap, weight-free way to make agents actually learn from experience, and the pattern is something I use constantly in agent builds.

## The problem: agents don't remember their mistakes

A vanilla agent runs: think, act, observe. If it fails, you can re-run it, but it has no *memory* of why it failed — so it fails the same way. Real learning (gradient descent) is expensive and unavailable at inference. Reflexion's insight: you don't need to change weights to learn; you can **learn in language**.

## The Reflexion loop

After a failed (or suboptimal) trajectory, the agent writes a **verbal reflection**: a short natural-language summary of what went wrong and what to do differently. That reflection is stored in an episodic memory and prepended to the next attempt.

```
Attempt 1: think → act → observe → FAIL
Reflection: "I called the search tool with too broad a query and got noise;
            next time, include the year and specific entity name."
Attempt 2: [reflection] → think → act → observe → SUCCESS
```

No gradients, no fine-tuning — just text memory of past mistakes.

## Why this works better than you'd expect

- **It's targeted.** The reflection addresses the *specific* failure, so the next attempt avoids it directly.
- **It's cheap.** Writing one paragraph of reflection costs a single generation; no training run.
- **It compounds.** Over multiple attempts the agent accumulates a growing "lessons learned" buffer that improves robustness on hard, multi-step tasks.
- **It's model-agnostic.** Works on any LLM, since it's pure prompting + memory.

The paper showed meaningful gains on reasoning, coding (where the agent reflects on failed test runs), and sequential decision tasks, often outperforming agents without reflection.

## A minimal sketch

```python
memory = []
for attempt in range(max_tries):
    prompt = build_prompt(task, memory)
    traj, outcome = run_agent(prompt)
    if outcome.ok: break
    reflection = model.reflect(traj, outcome)   # "why did this fail?"
    memory.append(reflection)
```

The `model.reflect` call is just a prompted generation: "Here's what happened and the result. What went wrong, and what should you change?" The output is plain text appended to memory.

## Practical notes for builders

- **Make reflections specific and actionable.** Vague reflections ("I should try harder") don't help. Good ones name the bad action and the fix.
- **Bound the memory.** Don't dump every reflection forever; keep the most recent / most relevant few to avoid context bloat.
- **Use a verifier when possible.** Reflection is strongest when the agent *knows* it failed (a test failed, an answer was wrong) rather than guessing.
- **Pair with ReAct** (covered separately): ReAct gives the action loop, Reflexion gives the learning loop on top.
- Watch for **reflection loops** — the agent might reflect endlessly without trying; cap attempts.

## My take

Reflexion is the cheapest "learning" upgrade you can add to an agent, and I treat it as near-default for any multi-step agent that can fail. The principle — *turn experience into language and feed it back* — is profound: it's a form of reinforcement learning where the "gradient" is a sentence. If your agent keeps repeating mistakes, stop re-running it blindly; add a reflection step and let it remember. Just keep the reflections tight and the memory bounded, or you'll trade one failure mode (repeat mistakes) for another (context overflow).

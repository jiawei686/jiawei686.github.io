---
layout: post
title: "AutoGen: Multi-Agent Conversation as Computation"
date: 2026-06-14
tags: [llm]
subcat: agents
description: "AutoGen is a framework for building multi-agent conversations where LLM and tool-using agents collaborate to solve tasks."
---

AutoGen (Microsoft, 2023) is a framework that treats **multi-agent conversation as the unit of computation**. Instead of one prompt solving a task, you spin up several agents — a "user proxy" that executes code, a "assistant" that reasons, maybe a critic, maybe a retrieval agent — and let them talk until the task is done. I'm writing this because multi-agent orchestration is now a core way to build robust LLM systems, and AutoGen (alongside similar frameworks) established the patterns: configurable agents, human-in-the-loop, and conversation as control flow.

## The shift: from one prompt to a conversation

A single LLM call is brittle for complex tasks — it has to plan, act, and verify all at once. AutoGen's bet: decompose the work across **specialized agents** that converse:

- **AssistantAgent:** reasons, writes code, proposes steps.
- **UserProxyAgent:** a stand-in for the user that can *execute code* and return results (or pause for a human).
- Optional **critic / coder / retriever** agents with narrow roles.

The framework handles message passing, termination conditions, and tool execution so you focus on agent *roles* and *prompts*.

## Why multiple agents help

- **Separation of concerns.** One agent reasons; another just runs code and reports output. This mirrors how humans divide "think" vs. "do."
- **Natural tool use.** The UserProxyAgent executes generated code and feeds the result back into the conversation — the model sees real output and corrects, exactly like the ReAct/Reflexion loops (covered separately) but orchestrated for you.
- **Human-in-the-loop.** You can inject a human at any point (approve code, give direction) without restructuring the whole app.
- **Specialization improves quality.** A "critic" agent reviewing the "coder" agent's output catches errors a single self-prompted model misses.

## A typical flow

```
UserProxy: "Plot sales by region from data.csv"
Assistant: writes pandas code
UserProxy: executes it, returns the plot / error
Assistant: if error, debugs; if success, explains
... until done or max turns
```

The conversation *is* the program. Termination can be "task complete" message, max turns, or a human stop.

## Practical notes from using it

- **Define clear agent roles.** Overlapping roles cause agents to talk past each other. I keep roles minimal: a reasoner, an executor, sometimes a reviewer.
- **Code execution needs sandboxing.** AutoGen can run generated code — awesome for capability, dangerous by default. Always execute in a restricted environment, never on a privileged host. (This is non-negotiable; arbitrary LLM-generated code is a security risk.)
- **Set termination conditions.** Without a max-turns or "done" signal, agents can loop. I always bound conversations.
- **It's heavier than a single call.** More agents = more tokens and latency; use multi-agent only when the task justifies it (complex coding, multi-step planning), not for simple Q&A.
- **Debugging is conversational.** When it goes wrong, you read the chat log — which is actually nicer than tracing a monolithic prompt.

## Limitations

- **Cost/latency** scale with agents and turns.
- **Agent chatter** can drift or stall; good termination + role design matter.
- **Quality still depends on the base model.** Frameworks orchestrate; they don't add reasoning the model lacks.
- **Security** of code execution must be handled deliberately.

## My take

AutoGen popularized a mental model I now use for hard tasks: *don't make one model do everything — give each agent one job and let them converse.* The framework handles the plumbing (message passing, execution, termination), so you invest in role design and prompts. The big caveats are real: sandbox any code execution, bound the conversation, and don't reach for multi-agent when a single well-prompted call suffices. But for complex coding or planning tasks, a reasoner+executor+critic trio consistently beats a lone model. Conversation as computation is a genuinely useful paradigm — just watch the token bill.

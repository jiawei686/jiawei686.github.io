---

layout: post
title: "AutoGen: Multi-Agent Conversation as Computation"
date: 2026-06-14
tags: [llm]
subcat: agents
description: "AutoGen is a framework for building multi-agent conversations where LLM and tool-using agents collaborate to solve tasks."
---


**Paper:** Wu, Bansal, Zhang, Wu, Zhang, Zhu, Li, Jiang, Zhang, Wang, Krishna, Wu, *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation*, 2023. [arXiv:2308.08155](https://arxiv.org/abs/2308.08155)

ReAct and Reflexion give you a single-agent loop. Real jobs need roles: a coder, a critic, a person, a tool, all talking to each other. AutoGen makes that conversation the program. It is the seed idea behind CrewAI, MetaGPT, and most of the orchestration frameworks people actually deploy.

## The one abstraction: ConversableAgent

AutoGen's unit is the **ConversableAgent**: any participant that can send and receive messages, backed by one of:

- an **LLM** (reasons / writes),
- a **human** (approves or answers),
- a **tool / code executor** (runs code, returns output).

Each agent is customizable via a system message, an LLM config, a human-input mode, and a max-consecutive-auto-replies. A **GroupChat** manager broadcasts each message to the group; agents respond until a termination condition is met.

## The pattern worth stealing: Assistant + UserProxy

```python
assistant = ConversableAgent("assistant", llm_config={"model": "gpt-4"})
user_proxy = ConversableAgent("user_proxy",
                              human_input_mode="NEVER",
                              code_execution_config={"work_dir": "coding"})

user_proxy.initiate_chat(
    assistant,
    message="Plot a sine wave and save it as sine.png"
)
# assistant writes the code -> user_proxy executes it -> errors (if any)
# flow back -> assistant fixes -> loop until done
```

The user proxy autonomously runs generated code and feeds stdout and tracebacks back. That is a Reflexion-style self-correction loop, just split across two agents instead of one: the assistant sees its own errors and patches them.

## What the paper showed

- Substantially less engineering effort than wiring single-agent prompts by hand.
- On coding and math benchmarks, multi-agent conversation outperformed single-agent prompting.
- Human-in-the-loop modes let a person gate risky actions (e.g., before executing code).

## Where I'd actually use it

Complex agent pipelines are almost never one model in a loop. They are teams: a planner, a worker, a critic, a retriever, a user. AutoGen's "conversation-as-computation" model is the mental framework I reach for when I design them, and it composes cleanly with RAG (retriever agent), ReAct (worker), and Reflexion (critic). The part I'd flag: the paper shows the happy path, but a chatty group of agents is also where cost and latency quietly blow up, and nothing here tells you when to stop talking. Next in the series, Tree-of-Thoughts adds structured search to this deliberation.

## References

- Wu et al. (2023). *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation.* [arXiv:2308.08155](https://arxiv.org/abs/2308.08155)

<!-- EXPANDED -->

## Agents that talk to each other

AutoGen models a task as a conversation among **conversable agents**. The two you meet first:

- **AssistantAgent:** an LLM that reasons and writes code.
- **UserProxyAgent:** represents the human (or a tool) and can execute code and return results.

You wire them together, and they pass messages back and forth until the task is done -- the assistant proposes code, the proxy runs it, errors bounce back, the assistant fixes them.

## Group chat and orchestration

For harder workflows, a `GroupChat` lets many agents (a coder, a critic, a retriever, a human) discuss and converge. The value is decomposition: each agent has one job, and the conversation orchestrates them without you hand-coding the control flow.

The pattern -- modular agents plus a message bus -- is the same idea behind many agent frameworks, and it pairs naturally with tool-calling and code execution.

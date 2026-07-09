---
layout: post
title: "AutoGen: Multi-Agent Conversation as Computation"
date: 2026-06-14
tags: [llm]
---

**Paper:** Wu, Bansal, Zhang, Wu, Zhang, Zhu, Li, Jiang, Zhang, Wang, Krishna, Wu, *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation*, 2023. [arXiv:2308.08155](https://arxiv.org/abs/2308.08155)

## Why this paper matters

ReAct and Reflexion describe **single-agent** loops. Real applications need **roles** — a coder, a critic, a user, a tool — collaborating. AutoGen makes *multi-agent conversation* the primitive: agents talk to each other, and that conversation *is* the program. It is the conceptual foundation of modern orchestration frameworks (AutoGen, CrewAI, MetaGPT).

## The core idea: everything is a ConversableAgent

AutoGen's unit is the **ConversableAgent** — any participant that can send and receive messages, backed by one of:

- an **LLM** (reasons / writes),
- a **human** (approves or answers),
- a **tool / code executor** (runs code, returns output).

Each agent is customizable via a system message, an LLM config, a human-input mode, and a max-consecutive-auto-replies. A **GroupChat** manager broadcasts each message to the group; agents respond until a termination condition is met.

## A canonical pattern: Assistant + UserProxy

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

The user proxy autonomously runs generated code and feeds stdout / tracebacks back, so the assistant can self-correct — a concrete Reflexion-style loop, multi-agent style.

## Key results

- Substantially less engineering effort than wiring single-agent prompts by hand.
- On coding and math benchmarks, multi-agent conversation outperformed single-agent prompting.
- Human-in-the-loop modes let a person gate risky actions (e.g., before executing code).

## Why it matters today

Complex agent pipelines are almost never one model in a loop — they are **teams**: a planner, a worker, a critic, a retriever, a user. AutoGen's "conversation-as-computation" model is the mental framework for designing them, and it composes cleanly with RAG (retriever agent), ReAct (worker), and Reflexion (critic). Next in the series, Tree-of-Thoughts adds structured search to this deliberation.

## References

- Wu et al. (2023). *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation.* [arXiv:2308.08155](https://arxiv.org/abs/2308.08155)

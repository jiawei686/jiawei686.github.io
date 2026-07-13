---
layout: post
title: "Generative Agents: Believable Simulacra of Human Behavior"
date: 2026-06-07
tags: [llm]
subcat: agents
---

**Paper:** Park, Chan, Roh, Zito, Fried, Bernstein, *Generative Agents: Interactive Simulacra of Human Behavior*, UIST 2023. [arXiv:2304.03442](https://arxiv.org/abs/2304.03442)

## Why this paper matters

How do you give an LLM an ongoing "life" across time — memory, consistency, and believable social behavior? This paper built a **town of 25 agents** in a sandbox (Smallville) and showed emergent social dynamics: information spread, relationships formed, a party got organized. It is the reference architecture for agent **memory** and is reused in simulations, games, and user modeling. Think of it as Reflexion's reflection idea, productized into a full cognitive loop.

## The architecture: memory → retrieval → reflection → planning

Each agent maintains:

- **Memory stream** — a log of observed experiences, each stamped with a timestamp and weighted by **recency**, **relevance**, and **importance**.
- **Retrieval** — given a query (e.g., "what should I do now?"), memories are scored and the top-k feed the LLM as context:

$$
\text{score}(m, q) = \alpha \cdot \text{recency}(m) + \beta \cdot \text{relevance}(m, q) + \gamma \cdot \text{importance}(m)
$$

- **Reflection** — periodically the agent synthesizes many low-level observations into a few higher-level insights ("Klaus is a professor who cares about teaching"). Reflections are themselves memories and can be reflected upon recursively.
- **Planning** — goals are expanded into a tree of actions with estimated start times; plans can be interrupted when new observations arrive.

## Why the pieces matter together

- **Retrieval** keeps context bounded and relevant instead of dumping the whole history into the prompt.
- **Reflection** turns raw experience into durable beliefs, so behavior is consistent across days.
- **Planning** makes actions goal-directed rather than purely reactive.

## Key results

In Smallville, agents:
- shared information through conversations (a fact told to one agent reached others),
- formed and remembered relationships,
- autonomously coordinated a Valentine's Day party with believable attendance.

Human evaluators rated the agents' behavior more believable than ablations **without** reflection or **without** planning — confirming both modules earn their place.

## Why it matters today

The memory → retrieval → reflection → planning stack is the backbone of agent "inner life." Almost every long-running agent (coding assistants that remember your repo norms, game NPCs, digital twins) is some variant of this. Paired with ReAct (acting) and Reflexion (verbal feedback), it completes the picture of a persistent agent.

## References

- Park et al. (2023). *Generative Agents: Interactive Simulacra of Human Behavior.* [arXiv:2304.03442](https://arxiv.org/abs/2304.03442)
- Shinn et al. (2023). *Reflexion.* [arXiv:2303.11366](https://arxiv.org/abs/2303.11366)

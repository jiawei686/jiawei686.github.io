---
layout: post
title: "Generative Agents: Believable Simulacra of Human Behavior"
date: 2026-06-07
tags: [llm]
subcat: agents
description: "Generative Agents showed that LLM-driven characters with memory, planning, and reflection produce surprisingly believable behavior — the architecture behind AI towns and sims."
---

Generative Agents (Park et al., 2023) is the famous "AI town" paper — 25 LLM-powered characters who go to work, gossip, throw parties, and form relationships in a sandbox. Beyond the demo's charm, it contributed a clean **agent architecture** (memory → planning → reflection) that's now a standard reference for building believable autonomous characters and simulations. I'm writing this because the architecture is a template you can reuse for any "agent with a persistent self," not just game NPCs.

## The demo that made it famous

The authors built a sandbox world with 25 agents. Left running, they exhibited emergent social behavior: one agent decides to throw a birthday party, invites others, and by the next day most of the town shows up — having planned, coordinated, and remembered on their own. Nobody scripted the party; it emerged from agents pursuing goals informed by memory and observation.

## The architecture: three modules

Each agent runs a loop built on three components:

1. **Memory stream.** A log of all experiences (observations, actions, conversations), each time-stamped and retrievable by *recency*, *importance*, and *relevance*. This is how an agent "remembers" what matters.
2. **Planning.** Given memory + goals, the agent generates a plan (a tree of sub-goals over time): "I'm thirsty → go to the cafe → at 2pm." Plans can react to new events.
3. **Reflection.** Periodically, the agent summarizes its recent memories into higher-level insights ("I'm friends with Klaus; I should invite him"). This is exactly the Reflexion idea (covered separately) baked into the architecture.

Crucially, the agent *retrieves relevant memories* to inform each action — so behavior is consistent over time, not random.

## Why it felt "believable"

Prior chatbots were stateless: each reply forgot the last. Generative Agents made behavior **persistent and contextual** — an agent's action at time *t* depends on what it did at *t-10* and what it learned about others. That continuity is what reads as "a person" rather than "a prompt."

The reflection module is the secret sauce for coherence: without it, agents are reactive but not self-consistent; with it, they develop stable traits and relationships.

## Practical takeaways for builders

- **Memory retrieval > prompt stuffing.** Don't try to fit everything in the prompt; retrieve by recency/importance/relevance like they do. This scales and stays relevant.
- **Reflection creates consistency.** Periodically compress experiences into beliefs; it's what stops agents from being incoherent across sessions.
- **Planning needs grounding in memory.** A plan generated from nothing drifts; a plan generated from retrieved context stays on-character.
- **Cost is real.** Every agent step is model calls × agents × time. The demo is charming but expensive to run at scale; I'd prototype with few agents and heavy caching.

## Limitations

- Believability ≠ correctness. Agents can still generate false "memories" or act illogically; the demo's charm can mask shallow reasoning.
- It's **heavy**: many retrieval + reflection calls per agent per step.
- Behavior is only as good as the underlying LLM's reasoning and the quality of the memory/retrieval design.
- Replicating the emergent social dynamics requires careful tuning; naive versions just produce agents that wander.

## My take

Generative Agents is less about "AI people" and more about a reusable pattern: **persistent memory + planning + reflection = coherent autonomous behavior.** Strip the NPC framing and you have the skeleton for customer sims, testing agents, personalized assistants that remember you, and multi-agent simulations. The single most useful idea to steal is the *memory stream with recency/importance/relevance retrieval* — it's the difference between an agent that feels like a person and one that feels like a stateless chatbot. Build memory first; everything else follows.

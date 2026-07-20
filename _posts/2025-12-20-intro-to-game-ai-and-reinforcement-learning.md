---
layout: post
title: "Game AI and Reinforcement Learning"
date: 2025-12-20
tags: [ai]
description: "How reinforcement learning powers game AI, from Q-learning and DQN to AlphaGo and AlphaZero."
---

Reinforcement learning (RL) is the branch of ML where an agent learns by **trial and error**, receiving rewards for good actions and penalties for bad ones — rather than being told the right answer directly. Games have been RL's perfect laboratory: clear rules, a score to optimize, and a built-in opponent. I'm writing this as an intro because RL is also the engine behind LLM alignment (RLHF, covered separately), so understanding the game-AI lineage makes the modern stuff click.

## The framing: agent, state, action, reward

RL formalizes learning as a loop:

```
observe state s → choose action a → environment returns reward r and next state s'
repeat; goal: maximize cumulative reward
```

- **State:** what the agent currently "sees" (board position, game pixels).
- **Action:** a move it can take.
- **Reward:** a signal of how good that was (won the point = +1, lost = -1).
- **Policy:** the strategy — what action to take in each state.

The hard part: rewards are often *sparse and delayed*. You make a good move now but only see its value many steps later when you win or lose. Credit assignment — figuring out which early actions caused the eventual win — is the central challenge.

## From Q-learning to DQN

- **Q-learning** learns a function `Q(s, a)` = "expected future reward if I take action `a` in state `s`." Act greedily with respect to it. It's a clean, foundational algorithm.
- **DQN (Deep Q-Network, 2013)** made Q-learning scale by using a neural network to approximate `Q`, and added two crucial tricks: an **experience replay buffer** (reuse past transitions) and a **target network** (a slowly-updated copy for stable targets). With these, an agent learned to play Atari games from raw pixels — a landmark "one method, many games" result.

## The chess/go breakthrough: AlphaGo and AlphaZero

Board games were long considered too hard for brute search + heuristics. Then:

- **AlphaGo (2016)** beat Lee Sedol at Go by combining supervised learning from human games, RL (self-play), and **Monte Carlo Tree Search (MCTS)** — a smart lookahead that focuses computation on promising moves. It didn't just search harder; it *learned* which positions mattered.
- **AlphaZero** went further: no human data at all, just self-play from scratch, learning to master Go, chess, and shogi. It discovered strategies humans hadn't emphasized. This was a striking demonstration that RL + search could *invent* expertise.

## Why this connects to LLMs

RL is the same framework behind RLHF/RLAIF (covered in the alignment posts): the "environment" is human preference, the "reward" is a preference score, and the "policy" is the language model. Understanding sparse rewards, credit assignment, and policy optimization in games transfers directly. AlphaGo's MCTS even rhymes with Tree-of-Thoughts' search over reasoning paths.

## Practical realities & caveats

- **RL is sample-hungry and unstable** compared to supervised learning — tuning is an art.
- **Reward design is everything.** A poorly specified reward leads to degenerate "reward hacking" (the agent finds a loophole that maximizes score without achieving the real goal). This is the same failure mode as reward models in LLMs.
- **Simulation helps.** Games are great because you can run millions of trials cheaply; real-world RL (robotics) is far harder due to cost and safety.
- For most applied problems, **supervised or imitation learning** is simpler and sufficient; reach for RL when you truly only have a reward signal.

## My take

Game AI is RL's best storyteller: it turned an abstract "learn from reward" idea into agents that beat world champions, and it built the intuition (replay, target networks, self-play, search) that modern systems reuse. More than that, it's the conceptual parent of LLM alignment — same loop, different environment. If you understand why AlphaZero's self-play works and why reward hacking happens, you already understand the deepest challenges of aligning language models. RL is hard, sample-inefficient, and finicky — but when the only signal you have is "was this good?", it's the tool you reach for.

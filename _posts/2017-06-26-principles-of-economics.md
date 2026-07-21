---
layout: post
title: Principles of Economics (Mankiw)
tags: [engineering]
---

Notes from Mankiw's *Principles of Economics*. The book's framing is deceptively simple — ten principles that supposedly explain most of what economics studies. What I found useful is how each principle directly contradicts a naive intuition, which is exactly why the subject exists.

## Chapter 1 — Ten principles of economics

- **Principle 1: People face trade-offs.** To get one thing, you give up another. Two goals that constantly trade off:
  - **Efficiency** — getting the maximum possible benefit from scarce resources.
  - **Equality** — distributing those benefits evenly across society.
- **Principle 2: The cost of something is what you give up to get it.** That "opportunity cost" is everything you forgo. Good decision-makers weigh the opportunity cost of every option, not just its price tag.
- **Principle 3: Rational people think at the margin.** A **rational person** acts purposefully to achieve a goal. A **marginal change** is a small incremental adjustment to a plan — most real decisions are "a little more or a little less," not all-or-nothing.
- **Principle 4: People respond to incentives.** An **incentive** is something that induces a person to act. Change the incentive and behavior follows.
- **Principle 5: Trade can make everyone better off.** By trading with others, people obtain a wider variety of goods and services at lower cost than they could produce alone.
- **Principle 6: Markets are usually a good way to organize economic activity.** Prices and self-interest guide decisions better than a central planner in most cases.
- **Principle 7: Governments can sometimes improve market outcomes.** Markets need rules (property rights, antitrust) and can fail (externalities, inequality) — that's where government has a role.
- **Principle 8: A country's standard of living depends on its ability to produce goods and services.** Productivity, not money supply, is the root cause of living-standard differences.

## Chapter 4 — The forces of supply and demand

> Supply and demand are the forces that make a market economy work; they determine both the quantity of each good produced and the price at which it sells.

### 4.1 Markets and competition

- A **market** is a group of buyers and sellers of some good or service. Buyers determine **demand**; sellers determine **supply**.
- A **competitive market** requires two features:
  - the goods on offer are identical, and
  - there are so many buyers and sellers that none can influence the market price.

Because they must accept the market price, competitive buyers and sellers are called **price takers**.

### 4.2 Demand

- **Quantity demanded** is the amount a buyer is willing and able to purchase.
- **The law of demand**: when the price of a good rises (all else equal), the quantity demanded falls, and vice versa.
- Market demand is the sum of individual demands.

Two ways to *reduce* demand (using cigarettes as the example):
1. Public-health ads, warning labels, and ad bans **shift the demand curve left** (at any given price, people want less).
2. A tax **raises the effective price** consumers pay, moving along the curve to a higher price / lower quantity point.

### 4.4 Supply meets demand

- **Equilibrium** is the point where the supply and demand curves cross — the market-clearing price and quantity.
- To analyze any shock, follow three steps:
  1. Is it the supply curve or the demand curve that shifts (or both)?
  2. In which direction does it shift?
  3. Use the supply-demand diagram to see how the shift changes equilibrium price and quantity.

## My take

The principle I keep coming back to — both in economics and in engineering — is **thinking at the margin** (Principle 3). Almost every "should we?" question is really "should we do a little more of this?" Marginal cost vs. marginal benefit is the actual decision rule, yet people instinctively reason in absolutes. And the three-step equilibrium analysis is a genuinely useful template: whenever something in a system changes, ask *what shifts, which direction, and what's the new steady state* — it works for queues, caches, and markets alike.

---
layout: post
title: "RAG: Retrieval-Augmented Generation"
description: "RAG explained: marry a generative model with an external knowledge index so it can look things up. The seed of every production LLM app. arXiv:2005.11401"
date: 2026-05-10
tags: [llm]
subcat: agents
---

Retrieval-Augmented Generation (RAG, Lewis et al., 2020, arXiv:2005.11401) is, hands down, the most widely deployed LLM architecture in production. If you've used a chatbot that "knows your company's documents," it's almost certainly RAG. I'm writing this because RAG is the practical bridge between a frozen base model and *your* data, and getting it right is 80% engineering, 20% ML.

## The core problem RAG solves

A base LLM has two hard limits:

1. **Knowledge cutoff** — it only knows what was in its pretraining data, up to a point in time.
2. **No private knowledge** — it can't know your internal docs, tickets, or database.

You could fine-tune, but that's expensive, slow to update, and the model still "blends" facts rather than quoting sources. RAG takes a simpler, more honest route: **don't put the knowledge in the weights — put it next to the model at query time.**

## How RAG works (the standard pipeline)

1. **Indexing (offline):** chop your documents into chunks, embed each into a vector, store them in a vector database.
2. **Retrieval (per query):** embed the user's question, find the top-k most similar chunks by vector search.
3. **Generation:** stuff those chunks into the prompt as context and ask the model to answer *using only the provided context*, ideally with citations.

```
question → embed → vector search → top-k chunks → prompt → answer
```

The model becomes a reader over retrieved evidence rather than a recall machine over its weights.

## Why RAG beat the alternatives for real use

- **Freshness:** update the index, not the model. New doc? Just re-index it.
- **Provenance:** you can show the user *which source* supported the answer — critical for trust and for regulated domains.
- **Cheaper than fine-tuning:** indexing is a one-time (and re-runnable) embedding job; no GPU training.
- **Less hallucination:** grounding answers in retrieved text sharply reduces confident fabrication — though it doesn't eliminate it (the model can still misread or ignore context).

Almost every "chat with your PDF / docs / codebase" product is RAG under the hood. It's the seed of the agentic apps we now build.

## Where RAG actually breaks (and how to fix it)

In my experience, RAG fails most often at the *retrieval* step, not generation:

- **Bad chunking:** too large (noise) or too small (lost context). Tune chunk size + overlap.
- **Weak embeddings:** the retriever misses relevant docs. Upgrade the embedding model; consider hybrid (vector + keyword/BM25) search.
- **No reranking:** top-k by similarity isn't top-k by relevance. Add a cross-encoder reranker — often the single biggest quality win.
- **Missing metadata filtering:** "search only this customer's tickets" needs metadata, not just vectors.
- **Context stuffing:** dumping 20 chunks overwhelms the model. Retrieve more, rerank, keep few.

## Practical build notes

- Start simple: a vector DB + a good embedding model + a reranker. That trio beats elaborate pipelines with weak retrieval.
- **Hybrid search** (dense + sparse) consistently beats dense-only for factual lookup.
- Cache embeddings; re-index incrementally.
- Evaluate with real queries, not toy sets — measure "did the right chunk get retrieved" before blaming generation.
- For codebases, retrieval over file/function chunks + a good reranker works remarkably well (this is how coding assistants ground answers).

## My take

RAG is the workhorse of practical LLM systems, and its biggest lesson is that **retrieval quality dominates generation quality**. A frontier model with bad retrieval gives wrong answers confidently; a modest model with great retrieval gives correct, sourced answers. If you're building any "LLM on my data" feature, invest your effort in chunking, embedding choice, and reranking before you touch prompts or models. RAG won't make a model smarter — it makes it *grounded*, and for production that's usually what you actually need.

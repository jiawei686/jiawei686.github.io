---
layout: post
title: "The Transformer: Attention Is All You Need"
date: 2026-03-01
tags: [llm]
subcat: architecture
---

Every large language model you use today — GPT, Claude, LLaMA, Gemini — is built on a single 2017 paper that, frankly, I did not fully appreciate when it came out. "Attention Is All You Need" replaced recurrence and convolution with a mechanism called **self-attention**, and in doing so removed the biggest bottleneck in sequence modeling: the need to process text strictly left-to-right.

I'm writing this because the Transformer is no longer just "a paper." It is the substrate of an entire industry, and understanding *why* it won explains almost everything about how modern models behave.

## The problem it actually solved

Before 2017, the dominant architectures were RNNs and LSTMs. They read a sentence one token at a time and tried to compress the whole context into a fixed-size hidden state. That design has two nasty consequences:

1. **You can't parallelize training.** Token *t* depends on token *t-1*, so the whole sequence is a serial chain. On a GPU that loves massive parallelism, this is painful.
2. **Information decays over distance.** By the time the model reads the 50th word, the signal from the 1st word has been squashed through 49 updates. Long-range dependencies get lost.

Convolutions helped a bit (you can look at a few neighboring words at once) but still needed many layers to connect distant positions.

Self-attention throws this out. Every token looks at *every other token directly*, in one step, with no recurrence. Position 1 can attend to position 50 just as easily as to position 2.

## What self-attention actually computes

For each token we learn three vectors: a **query** `Q`, a **key** `K`, and a **value** `V`. The intuition I find most useful: think of it like a database lookup.

- The query is *what this token is looking for*.
- The keys are *what each token offers*.
- The values are *what each token actually contributes*.

We score how well query matches each key, normalize those scores into weights that sum to 1, and take a weighted average of the values:

```
scores = Q @ K.T / sqrt(d_k)
weights = softmax(scores)        # each row sums to 1
output = weights @ V
```

That `sqrt(d_k)` is not decoration. The dot product of two *d_k*-dimensional random vectors grows like `sqrt(d_k)` in magnitude, so without scaling the softmax gets pushed into a region where gradients vanish. I've debugged attention heads that "collapsed" to near-uniform weights — nine times out of ten it was a missing or wrong scaling factor.

## Multi-head attention

One attention pattern is rarely enough. The Transformer runs *h* attention operations in parallel ("heads"), each with its own Q/K/V projections, then concatenates the results. In practice different heads learn different things: one tracks subject-verb agreement, another resolves which "it" refers to, another connects a noun to its modifier across a clause. You can actually probe individual heads and find surprisingly interpretable behavior — though most heads are a mush of correlated signals, and that's normal.

## Positions matter (and recurrence doesn't give them for free)

Because attention is order-agnostic — it sees a *set* of tokens, not a sequence — we must inject position information ourselves. The original paper used fixed sinusoidal encodings added to the token embeddings:

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

These have a neat property: the offset between position *p* and *p+k* is a linear function of the encoding at *p*, which lets the model generalize to sequence lengths it didn't see in training. Later models (like RoPE, which I cover separately) improved on this, but the principle — *position is a first-class signal you must add explicitly* — is still how every Transformer works.

## The encoder-decoder split

The original Transformer was built for translation, so it had two stacks:

- An **encoder** that reads the source sentence and builds a rich contextual representation.
- A **decoder** that generates the target sentence one token at a time, using *masked* self-attention so it can only look at positions it has already produced (plus cross-attention into the encoder).

The masking is the clever bit: during training we feed the whole target sequence at once (fast!), but we zero out the upper triangle of the attention matrix so token *t* can't peek at *t+1*. This is "teacher forcing" done right.

## Why this architecture ate the world

Three properties compounded:

1. **Parallelism.** Self-attention is `O(1)` sequential steps vs `O(n)` for RNNs. You can train on huge corpora fast.
2. **Constant path length.** Any two positions are one attention hop apart, so long-range dependencies are learnable.
3. **It scales.** Bigger models on more data just kept getting better (see the Scaling Laws post). The architecture didn't fight scaling the way RNNs did.

From here the field forked: decoder-only models (GPT) dropped the encoder and became the backbone of chat assistants; encoder-only models (BERT) became the workhorse for classification; and encoder-decoder survived mostly in translation. But the attention core is shared by all of them.

## My take

If you only read one paper in this series, read this one. Not because the math is hard — it isn't — but because *every* subsequent technique (efficient attention, positional embeddings, RLHF, mixture-of-experts) is a modification bolted onto this skeleton. Once self-attention clicks, the rest of the LLM stack stops feeling like magic.

A practical note if you implement it: the naive `Q@K.T` is `O(n^2)` in memory and is exactly what FlashAttention (covered separately) fixes for long sequences. For a toy model on short text you can ignore that; for anything production-scale you cannot.

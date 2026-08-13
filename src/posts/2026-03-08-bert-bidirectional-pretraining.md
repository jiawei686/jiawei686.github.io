---
layout: post
title: "BERT: Bidirectional Pretraining from Transformers"
date: 2026-03-08
tags: [llm]
subcat: training
description: "Pre-trained BERT with masked language modeling became the default backbone for NLP before decoder-only models took over."
---

BERT (Devlin et al., 2018) is the model that made "pretrain on a huge corpus, then fine-tune on your task" the default playbook for NLP — and for a few years, almost every production NLP system ran on a BERT variant. Even though decoder-only models (GPT-class) now dominate chat, BERT is still the right tool for classification, retrieval, and any task where you need to *read and label* text rather than *generate* it. I'm writing this because understanding BERT's training objective explains a design fork the whole field took.

## The problem with left-to-right language modeling

GPT-style models predict the next token from the left context only. That's a problem for understanding tasks. If I ask a model "The man went to the [MASK] to buy milk," and it has only seen the left side, it can guess "store." But if the sentence were "The man went to the store to buy [MASK]," left-to-right modeling still can't use the right context ("milk") to know the answer is probably a dairy product. Humans use both sides.

BERT's breakthrough: **train on both directions at once** via masked language modeling.

## Masked Language Modeling (MLM)

During pretraining, BERT randomly masks ~15% of tokens and asks the model to reconstruct them:

```
Input:  the man went to the [MASK] to buy [MASK]
Target:                 store                milk
```

But a naive 15%-mask-all-with-[MASK] has a train/inference mismatch: at test time (fine-tuning) there are no `[MASK]` tokens. BERT handles this with a small trick on the 15% chosen positions:

- 80% replaced with `[MASK]`
- 10% replaced with a random token (noise, forces the model to use context)
- 10% left unchanged (so the model still learns to represent real tokens)

This keeps the model from over-relying on the mask signal. I've found this 80/10/10 split is one of those details people skip when reimplementing and then wonder why fine-tuning is unstable.

## Next Sentence Prediction (NSP)

The second objective: given two segments `A` and `B`, predict whether `B` actually follows `A`. This was meant to help tasks like question answering and natural language inference. Later work (RoBERTa) showed NSP wasn't pulling its weight and often hurt; most modern encoders dropped it. Worth knowing because you'll see "with NSP" vs "without NSP" variants in the wild.

## Why bidirectional changes everything

Because BERT sees both sides of every token, its contextual embeddings are dramatically richer for *understanding*. A single BERT pass gives you a vector for each word that already "knows" its disambiguated meaning. That's why, for years, the recipe for any NLP product was: take `bert-base`, append a small task head (a classifier layer, a span extractor), fine-tune on a few hundred labeled examples, ship it. No more training LSTMs from scratch.

## BERT vs. GPT: the fork

- **BERT (encoder-only):** reads all input at once, outputs a representation. Great for labeling/classification/retrieval. Cannot naturally generate free-form text.
- **GPT (decoder-only):** generates left-to-right. Great for generation, dialogue, and now reasoning.
- **T5/BART (encoder-decoder):** both, good for translation and summarization.

The field ultimately bet on decoder-only for foundational models (scale + generation won), but BERT-style encoders are far from dead — they power search ranking, spam filters, and embedding models.

## Practical notes from deployment

- **Use the `[CLS]` token's output** for sentence-level classification; use token outputs for tagging/NER.
- Base vs. large: `bert-base` (~110M params) is usually enough; `large` helps on competitive benchmarks but costs more at inference.
- Fine-tuning is cheap. On a single GPU you can adapt BERT to a new classification task in minutes. I've shipped internal classifiers this way when a quick labeled set existed.
- For retrieval/embeddings, prefer a *purpose-trained* embedding model (e.g. a sentence-transformer) over raw BERT pooled output — BERT wasn't optimized for that and the pooling choice matters a lot.

## My take

BERT is the paper that proved "transfer learning works for language" at scale, and it deserves credit for the pretrain/fine-tune paradigm that GPT later rode to dominance. If your task is *understanding* text (classify it, find entities, rank it, embed it), don't sleep on encoder models — a well-tuned BERT-class encoder is often faster, cheaper, and more accurate than prompting a giant decoder model. Use the right tool; "bigger and generative" is not always better.

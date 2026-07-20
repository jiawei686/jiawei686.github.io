---

layout: post
title: "BERT: Bidirectional Pretraining from Transformers"
date: 2026-03-08
tags: [llm]
subcat: training
description: "Pre-trained BERT with masked language modeling became the default backbone for NLP before decoder-only models took over."
---


**Paper:** Devlin et al., *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*, NAACL 2019. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

You've probably used a Transformer encoder today without naming it. The original Transformer was an encoder–decoder built for translation. GPT-style models read left to right, each token predicting the next, so every token only sees what's to its left. That's fine for generation and terrible for classification, question answering, or NER, where a word's meaning comes from both sides. BERT's bet was straightforward: pretrain a deep encoder to read both directions at once, then fine-tune it on whatever you actually want.

## The two objectives

**Masked Language Modeling (MLM).** Randomly mask 15% of input tokens and train the model to reconstruct them.

- 80% replaced with `[MASK]`
- 10% replaced with a random token
- 10% left unchanged (to reduce train/serve mismatch)

This forces a bidirectional representation: predicting a masked word pulls from left and right context both.

**Next Sentence Prediction (NSP).** Given sentence A and B, predict whether B actually follows A. This teaches inter-sentence relationships useful for QA and inference.

## The architecture

BERT uses the Transformer **encoder only**:

- **BERT-Base:** 12 layers, `d_model = 768`, 12 heads, 110M params.
- **BERT-Large:** 24 layers, `d_model = 1024`, 16 heads, 340M params.

Pretrained on BooksCorpus (800M words) + English Wikipedia (2,500M words) for 4 days on 4–16 TPUs.

## Using it (Hugging Face)

```python
from transformers import AutoTokenizer, AutoModel

tok = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

text = "Deep learning shifted Jiawei from software to [MASK]."
out = model(**tok(text, return_tensors="pt"))
# out.last_hidden_state[:, 0, :] is the [CLS] pooler representation
```

The `[CLS]` token's final hidden state is the standard sentence embedding for classification.

## Results, briefly

- GLUE benchmark: **80.5%** (vs 72.6% for prior SOTA), a jump of nearly 8 points.
- SQuAD v1.1: 86.9 F1 (vs 81.9 human-at-the-time SOTA).
- BERT-Base alone beat the previous best *ensemble* on several tasks.

## The legacy

BERT locked in the pretrain → fine-tune pattern and showed one bidirectional model could be bent to nearly any NLP task with a small task head. Every encoder model since (RoBERTa, DeBERTa, ModernBERT) descends from it, and the "foundation model" idea is BERT's wager pushed to the extreme. The caveat I'd flag: NSP, which the paper sells as core, turned out to be mostly dead weight. RoBERTa just dropped it and got better. Worth remembering when you read the original's claims about sentence pairs.

## References

- Devlin et al. (2018). *BERT.* [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)
- Liu et al. (2019). *RoBERTa: A Robustly Optimized BERT Pretraining Approach.* [arXiv:1907.11692](https://arxiv.org/abs/1907.11692)

<!-- EXPANDED -->

## Why bidirectional changes everything

Earlier language models read text left-to-right, so a word's representation only saw the tokens before it. BERT's masked language model (MLM) randomly hides 15% of tokens and trains the model to reconstruct them from both directions at once. That means the representation of a word like "bank" can lean on "river" later in the sentence, not just "sat on the" before it.

The second objective, next-sentence prediction (NSP), taught the model whether two spans follow each other -- useful for question answering and entailment.

## Using BERT today

You rarely train BERT from scratch. You load a pretrained checkpoint and either:

- **Feature extraction:** take the hidden states as inputs to another model.
- **Fine-tuning:** add a task head (a classifier layer) and train end-to-end -- this is what dominates.

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer
tok = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
```

The takeaway: BERT shifted the field from task-specific architectures to a single pretrain-then-adapt recipe, and it stayed the backbone of NLP until decoder-only models took over inference.

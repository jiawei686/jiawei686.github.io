---
layout: post
title: "BERT: Bidirectional Pretraining from Transformers"
date: 2026-03-08
tags: [llm]
subcat: training
---

**Paper:** Devlin et al., *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*, NAACL 2019. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

## The problem BERT solved

The original Transformer was built for translation (encoder–decoder). GPT-style models are **left-to-right**: each token predicts the next, so a token can only attend to its left context. That is a real limitation for understanding tasks (classification, question answering, NER), where both directions matter. BERT asked: *what if we pretrain a deep Transformer encoder to "understand" text in both directions at once, then fine-tune it on any downstream task?*

## Two pretraining objectives

**Masked Language Modeling (MLM).** Randomly mask 15% of input tokens and train the model to reconstruct them.

- 80% replaced with `[MASK]`
- 10% replaced with a random token
- 10% left unchanged (to reduce train/serve mismatch)

This forces the model to build a bidirectional representation: predicting a masked word uses both left and right context.

**Next Sentence Prediction (NSP).** Given sentence A and B, predict whether B actually follows A. This teaches inter-sentence relationships useful for QA and inference.

## Architecture

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

## Key results

- GLUE benchmark: **80.5%** (vs 72.6% for prior SOTA) — an enormous jump.
- SQuAD v1.1: 86.9 F1 (vs 81.9 human-at-the-time SOTA).
- BERT-Base alone beat the previous best *ensemble* on several tasks.

## Why it matters

BERT established the dominant **pretrain → fine-tune** paradigm and proved that a single bidirectional pretrained model could be adapted to nearly any NLP task with a tiny task-specific head. It is the direct ancestor of every encoder model (RoBERTa, DeBERTa, ModernBERT) and of the "foundation model" idea that LLMs later pushed to its logical extreme.

## References

- Devlin et al. (2018). *BERT.* [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)
- Liu et al. (2019). *RoBERTa: A Robustly Optimized BERT Pretraining Approach.* [arXiv:1907.11692](https://arxiv.org/abs/1907.11692)

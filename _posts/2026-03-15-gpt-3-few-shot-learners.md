---
layout: post
title: "GPT-3 and Few-Shot Learning at Scale"
date: 2026-03-15
tags: [llm]
---

**Paper:** Brown et al., *Language Models are Few-Shot Learners*, NeurIPS 2020. [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)

## The big claim

What happens if you scale a language model to 175 billion parameters and train it on a huge web corpus — and then *never update its weights* for a new task? GPT-3's answer: it learns new tasks **in context**, just from the prompt. This is "few-shot" (or zero-shot) learning with no gradients.

## Three inference modes

Given a task, you can condition the model differently:

- **Zero-shot:** `Translate to French: <english>` → answer.
- **One/few-shot:** prepend 1–N exemplars `(input, output)` pairs, then the real input.
- **Fine-tuning (baseline):** update weights (not used by GPT-3 at inference).

The surprise: few-shot consistently beat zero-shot, and sometimes approached fine-tuned models — with *zero* parameter updates.

## Scale

| Model | Params | Train tokens |
|-------|--------|--------------|
| GPT-3 | 175B   | ~300B        |

Trained on CommonCrawl, WebText2, Books, Wikipedia. The architecture is a 96-layer decoder-only Transformer (`d_model = 12288`, 96 heads), essentially GPT-2 scaled ~100×.

## Why in-context learning works (intuition)

A model this large has effectively "seen" most task patterns during pretraining. The prompt is a retrieval key that activates the relevant behavior stored in its parameters. Modern views frame in-context learning as implicit Bayesian inference or a learned algorithm executed over the context.

## Key results

- On many NLP benchmarks, few-shot GPT-3 matched or exceeded task-specific fine-tuned models of the era.
- TriviaQA, closed-book QA: dramatically better than GPT-2.
- It could write code, summarize, translate, and do arithmetic — unevenly, but without any task training.

## A minimal call

```python
import openai  # or any OpenAI-compatible endpoint

resp = openai.chat.completions.create(
    model="gpt-3.5-turbo",  # spiritual successor
    messages=[
        {"role": "system", "content": "You are a terse translator."},
        {"role": "user", "content": "Translate to French: The model learned in context."},
    ],
)
print(resp.choices[0].message.content)
```

## Why it matters

GPT-3 shifted the field from "train a model per task" to "prompt one giant model." It made **in-context learning** a first-class capability and set the stage for instruction tuning (InstructGPT) and the ChatGPT moment. If you only read one paper about *scale*, read this one.

## References

- Brown et al. (2020). *Language Models are Few-Shot Learners.* [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)

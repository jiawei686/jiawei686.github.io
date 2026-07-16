---
layout: post
title: "GPT-3 and Few-Shot Learning at Scale"
date: 2026-03-15
tags: [llm]
subcat: training
---

**Paper:** Brown et al., *Language Models are Few-Shot Learners*, NeurIPS 2020. [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)

The experiment GPT-3 ran was simple to state and expensive to pull off. Take a 175 billion parameter model, train it on a giant web corpus, and then never touch its weights for a new task. What do you get? It learns new tasks **in context**, straight from the prompt. Few-shot or zero-shot, with no gradients anywhere.

## The three ways to query it

Given a task, you can condition the model differently:

- **Zero-shot:** `Translate to French: <english>` → answer.
- **One/few-shot:** prepend 1–N exemplars `(input, output)` pairs, then the real input.
- **Fine-tuning (baseline):** update weights (not used by GPT-3 at inference).

The part that surprised people: few-shot beat zero-shot every time, and occasionally came close to a fine-tuned model, all with *zero* parameter updates.

## How big, exactly

| Model | Params | Train tokens |
|-------|--------|--------------|
| GPT-3 | 175B   | ~300B        |

Trained on CommonCrawl, WebText2, Books, Wikipedia. The architecture is a 96-layer decoder-only Transformer (`d_model = 12288`, 96 heads), essentially GPT-2 scaled ~100×.

## What in-context learning actually is

A model this large has effectively "seen" most task patterns during pretraining. The prompt acts as a retrieval key that flips on the relevant behavior already sitting in its parameters. Modern takes frame in-context learning as implicit Bayesian inference, or as a little algorithm the model runs over the context.

## What it could do

- On many NLP benchmarks, few-shot GPT-3 matched or exceeded task-specific fine-tuned models of the era.
- TriviaQA, closed-book QA: dramatically better than GPT-2.
- It could write code, summarize, translate, and do arithmetic unevenly, but without any task training.

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

## The shift it caused

GPT-3 moved the field from "train a model per task" to "prompt one giant model." It made **in-context learning** a real capability and set up instruction tuning (InstructGPT) and the ChatGPT moment. If you read one paper about scale, make it this one. The thing I keep coming back to: the model was undertrained relative to its size, and it still worked. That undershoot is exactly why the scaling and Chinchilla posts matter.

## References

- Brown et al. (2020). *Language Models are Few-Shot Learners.* [arXiv:2005.14165](https://arxiv.org/abs/2005.14165)

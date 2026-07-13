---
layout: post
title: "Chinchilla: Training Compute-Optimal Large Language Models"
date: 2026-06-30
tags: [llm]
subcat: training
---

**Paper:** Hoffmann, J., et al. (DeepMind), *Training Compute-Optimal Large Language Models*, 2022. [arXiv:2203.15556](https://arxiv.org/abs/2203.15556)

## Why this paper matters

Kaplan's scaling laws (previous post) implied "make the model as big as possible and feed it whatever data you have." DeepMind re-ran the analysis with far more rigor — over 400 training runs — and found the field had been **wasting compute**. Under a fixed compute budget, parameters and training tokens should grow *in equal proportion*, not lopsidedly toward size. The 70B Chinchilla, trained on 1.4T tokens, beat Gopher (280B) and was competitive with models 4× its size. If you set a training budget today, this paper is the recipe you use.

## The core idea: equal scaling

Write the loss as a sum of power-law terms in parameters $N$ and data $D$:

$$
L(N, D) = \frac{A}{N^{\alpha}} + \frac{B}{D^{\beta}} + E
$$

Fitting to the 400+ runs gives $\alpha \approx 0.34$, $\beta \approx 0.28$ (much larger exponents than Kaplan's — scaling helps *more* than previously thought). Minimizing under a compute constraint $C \approx 6 N D$ yields:

$$
N_{\text{opt}} \propto C^{0.5}, \qquad D_{\text{opt}} \propto C^{0.5}
$$

The practical takeaway, often quoted as a rule of thumb: **train on roughly 20× as many tokens as parameters** ($D \approx 20 N$).

## What this corrected

At the time, the flagship models were off the optimum:

- **GPT-3** (175B, ~300B tokens) — undertrained.
- **Gopher** (280B, 300B tokens) — undertrained.
- **MT-NLG** (530B) — severely over-parameterized.

Chinchilla showed you could match or beat them with a fraction of the parameters if you simply fed them more data.

## Key results

- Chinchilla (70B, 1.4T tokens) outperformed Gopher (280B) on MMLU, reading comprehension, and closed-book QA.
- Massively cheaper inference (70B vs 280B) for equal or better quality.
- Established the "more data, smaller model" training paradigm now used across the industry.

## Why it matters today

Every serious training run since 2022 sizes its corpus from Chinchilla math, not Kaplan's. The lesson generalizes beyond text: the same 1:20 intuition shows up (with caveats) in vision and multimodal models. Pair this with the Scaling Laws post — together they are the "how big / how much data" chapter of any LLM course.

## References

- Hoffmann et al. (2022). *Training Compute-Optimal Large Language Models.* [arXiv:2203.15556](https://arxiv.org/abs/2203.15556)
- Kaplan et al. (2020). *Scaling Laws for Neural Language Models.* [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)

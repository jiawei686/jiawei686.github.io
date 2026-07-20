---

layout: post
title: "Chinchilla: Training Compute-Optimal Large Language Models"
date: 2026-06-30
tags: [llm]
subcat: training
description: "Chinchilla established the compute-optimal scaling law: model size and training tokens should scale together, favoring far more data than was common."
---


**Paper:** Hoffmann, J., et al. (DeepMind), *Training Compute-Optimal Large Language Models*, 2022. [arXiv:2203.15556](https://arxiv.org/abs/2203.15556)

## The field was oversizing models

Kaplan's earlier scaling laws (previous post) boiled down to "make the model as big as possible and feed it whatever data you have." DeepMind went back and did the analysis properly, with over 400 training runs, and concluded the field had been **wasting compute**. Under a fixed budget, parameters and training tokens should grow in equal proportion, not lopsidedly toward size. Their 70B Chinchilla, trained on 1.4T tokens, beat Gopher at 280B and held its own against models 4× bigger. If you have a training budget to spend today, this is the recipe.

## The math, briefly

Write the loss as a sum of power-law terms in parameters $N$ and data $D$:

$$
L(N, D) = \frac{A}{N^{\alpha}} + \frac{B}{D^{\beta}} + E
$$

Fit over the 400+ runs and you get $\alpha \approx 0.34$, $\beta \approx 0.28$. Both exponents are much larger than Kaplan's, which means scaling helps more than anyone had assumed. Minimize under the compute constraint $C \approx 6 N D$ and the optimum lands at:

$$
N_{\text{opt}} \propto C^{0.5}, \qquad D_{\text{opt}} \propto C^{0.5}
$$

The line everyone memorizes: **train on roughly 20× as many tokens as parameters** ($D \approx 20 N$).

## Who was off the mark

At the time, the big flagship models were all on the wrong side of the curve:

- **GPT-3** (175B, ~300B tokens), undertrained.
- **Gopher** (280B, 300B tokens), undertrained.
- **MT-NLG** (530B), severely over-parameterized.

Chinchilla's point was blunt: match or beat them with far fewer parameters, just give the model more data.

## What it delivered

- Chinchilla (70B, 1.4T tokens) outperformed Gopher (280B) on MMLU, reading comprehension, and closed-book QA.
- Massively cheaper inference (70B vs 280B) for equal or better quality.
- Established the "more data, smaller model" training paradigm now used across the industry.

## The part that actually persists

Every serious training run since 2022 sizes its corpus from Chinchilla's math, not Kaplan's. The 1:20 intuition carries over to vision and multimodal work too, with caveats. Read it alongside the Scaling Laws post and you have the "how big, how much data" chapter of any LLM course. The open question for me is whether the 20× rule still holds now that we are scraping the bottom of the high-quality-data barrel.

<!-- EXPANDED -->

## The scaling law that changed training

Before Chinchilla, large models were trained on fixed, relatively small datasets (GPT-3 used ~300B tokens for 175B params). Chinchilla showed the optimal rule: **parameters and training tokens should grow in proportion** -- roughly 20 tokens per parameter. So a 70B model should train on ~1.4T tokens, not the few hundred billion used previously.

## What they did

Hoffmann et al. fit a loss model `L = A/N^alpha + B/D^beta` over compute, params, and data, then solved for the compute-optimal split. Chinchilla (70B, ~1.4T tokens) matched or beat Gopher (280B) and GPT-3 (175B) while using a fraction of the parameters.

## The takeaway

Undertrained giants were a mistake of the era. Chinchilla is why modern models ship with trillion-token datasets and why "how many tokens did you train on?" matters as much as "how big is the model?"

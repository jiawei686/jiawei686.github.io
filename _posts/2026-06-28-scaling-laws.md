---
layout: post
title: "Scaling Laws for Neural Language Models"
date: 2026-06-28
tags: [llm]
---

**Paper:** Kaplan, J., et al., *Scaling Laws for Neural Language Models*, 2020. [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)

## Why this paper matters

Before this work, "how big should the model be?" was answered by intuition and budget. Kaplan et al. showed something almost suspicious: across **six orders of magnitude** of model size, the test loss of a Transformer language model falls on a clean straight line in log-log space. Performance isn't magic — it's a predictable function of compute, data, and parameters. That single observation turned scaling from folklore into an engineering discipline and directly justified the "just make it bigger" bet that produced GPT-3.

If you train or plan to train large models, this is the paper that tells you what to expect before you spend the cluster.

## The core idea: three power laws

The cross-entropy loss $L$ obeys a power law in each resource, when the others are not the bottleneck:

$$
L(N) \approx \left(\frac{N_c}{N}\right)^{\alpha_N}, \quad
L(D) \approx \left(\frac{D_c}{D}\right)^{\alpha_D}, \quad
L(C) \approx \left(\frac{C_c}{C}\right)^{\alpha_C}
$$

with fitted exponents roughly $\alpha_N \approx 0.076$, $\alpha_D \approx 0.095$, $\alpha_C \approx 0.050$ (parameters / data / compute, excluding embedding params for $N$).

Two properties matter:

- **Smoothness.** No sharp "phase transition" appears in the studied range. You can fit a small model and *extrapolate* to a 1000× larger one with reasonable confidence.
- **Cross-domain transfer.** The slope holds even when train and test distributions differ — only the intercept shifts. A model that generalizes on the training mix also tends to generalize out of distribution.

## Compute-optimal allocation (Kaplan's reading)

With a fixed compute budget $C$, the paper found optimal parameters and data scale as:

$$
N_{\text{opt}} \propto C^{0.73}, \qquad D_{\text{opt}} \propto C^{0.27}
$$

i.e. **parameters buy more than data** at fixed compute. This "params-first" guidance is what pushed GPT-3 to 175B parameters trained on "only" ~300B tokens.

## Key results

- Smooth power-law scaling holds from 768 params to 1.5B, and predicts larger runs.
- Bigger models are *sample-efficient*: a large model reaches a given loss with fewer optimization steps and less data than a small one.
- Drove the empirical strategy of training very large models and undertraining them relative to their capacity.

## Why it matters today

Scaling laws are the bedrock under everything that followed. They are also the reason Chinchilla (next post) was able to *disagree* and win — the allocation exponent, not the existence of the law, was the contested part. Read this and Chinchilla together: one establishes the empirical law, the other corrects the recipe.

## References

- Kaplan et al. (2020). *Scaling Laws for Neural Language Models.* [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)
- Henighan et al. (2020). *Scaling Laws for Autoregressive Generative Modeling.* [arXiv:2010.14701](https://arxiv.org/abs/2010.14701)

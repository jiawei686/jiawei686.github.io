---
layout: post
title: "Scaling Laws for Neural Language Models"
date: 2026-06-28
tags: [llm]
subcat: training
---

**Paper:** Kaplan, J., et al., *Scaling Laws for Neural Language Models*, 2020. [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)

Before this paper, "how big should the model be?" got answered by vibes and budget. Kaplan et al. found something almost too clean to trust. Across **six orders of magnitude** of model size, the test loss of a Transformer language model lands on a straight line in log-log space. Performance is not magic. It is a predictable function of compute, data, and parameters. That one plot turned scaling from folklore into an engineering discipline and gave the "just make it bigger" bet its receipts.

If you are about to spend a cluster, this is the paper that tells you what you get back.

## Three power laws

The cross-entropy loss $L$ obeys a power law in each resource, when the others are not the bottleneck:

$$
L(N) \approx \left(\frac{N_c}{N}\right)^{\alpha_N}, \quad
L(D) \approx \left(\frac{D_c}{D}\right)^{\alpha_D}, \quad
L(C) \approx \left(\frac{C_c}{C}\right)^{\alpha_C}
$$

with fitted exponents roughly $\alpha_N \approx 0.076$, $\alpha_D \approx 0.095$, $\alpha_C \approx 0.050$ (parameters / data / compute, excluding embedding params for $N$).

Two things about this are worth holding onto:

- **Smoothness.** No sharp "phase transition" appears in the studied range. You can fit a small model and *extrapolate* to a 1000× larger one with reasonable confidence.
- **Cross-domain transfer.** The slope holds even when train and test distributions differ. Only the intercept shifts. A model that generalizes on the training mix also tends to generalize out of distribution.

## How to spend a fixed compute budget

With a fixed compute budget $C$, the paper found optimal parameters and data scale as:

$$
N_{\text{opt}} \propto C^{0.73}, \qquad D_{\text{opt}} \propto C^{0.27}
$$

In plain terms, parameters buy more than data at fixed compute. That "params-first" reading is what pushed GPT-3 to 175B parameters trained on "only" ~300B tokens.

## The results that mattered

- Smooth power-law scaling holds from 768 params to 1.5B, and predicts larger runs.
- Bigger models are *sample-efficient*: a large model reaches a given loss with fewer optimization steps and less data than a small one.
- Drove the empirical strategy of training very large models and undertraining them relative to their capacity.

## The caveat that Chinchilla fixed

Scaling laws are the bedrock under everything since. The interesting part is not the law itself but the argument it started: Chinchilla (next post) *disagreed* and won. What was in dispute was the allocation exponent, not whether the law holds. Read the two together. One establishes the empirical law, the other corrects the recipe, and that correction is the part people actually misremember.

## References

- Kaplan et al. (2020). *Scaling Laws for Neural Language Models.* [arXiv:2001.08361](https://arxiv.org/abs/2001.08361)
- Henighan et al. (2020). *Scaling Laws for Autoregressive Generative Modeling.* [arXiv:2010.14701](https://arxiv.org/abs/2010.14701)

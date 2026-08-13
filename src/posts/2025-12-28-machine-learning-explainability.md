---
layout: post
title: "Machine Learning Explainability"
date: 2025-12-28
tags: [ai]
description: "Model explainability techniques: feature importance, LIME, SHAP, and the trade-off between accuracy and interpretability."
---

Machine learning explainability is the set of methods for answering "why did the model predict *that*?" As models moved from simple linear regressions to opaque neural nets and gradient-boosted trees, their predictions got better and their reasoning got invisible. Explainability pushes back against that opacity — for debugging, for trust, and often because regulation demands it. I'm writing this as a practical intro: which tools exist, what they actually tell you, and where they mislead.

## Why explainability matters

- **Debugging:** if a model performs oddly, you need to know *what* it's keying on. (I've caught models that "cheated" by reading a timestamp column that leaked the label.)
- **Trust & adoption:** a doctor or loan officer won't use a model they can't sanity-check.
- **Fairness & compliance:** many domains legally require a rationale for decisions affecting people.
- **Edge-case discovery:** explanations reveal brittle behavior you'd miss from aggregate accuracy alone.

## The spectrum: intrinsic vs. post-hoc

- **Intrinsic interpretability:** use a simple, inherently explainable model (linear regression, small decision tree). You trade some accuracy for transparency you get for free.
- **Post-hoc explainability:** train any model, then explain its behavior *after* with separate methods. This is where LIME and SHAP live.

The accuracy/interpretability trade-off is real but overstated — often a well-tuned simple model is "explainable enough" and nearly as good.

## Key techniques

**Feature importance (global):** ranking which inputs most affect predictions overall. For tree models this is built-in; for others, permutation importance (shuffle a column, measure accuracy drop) is a model-agnostic baseline.

**LIME (Local Interpretable Model-agnostic Explanations):** explain a *single prediction* by perturbing the input, seeing how the prediction changes, and fitting a simple local model around that point. Answer: "for *this* instance, these features pushed the prediction up/down." Cheap and intuitive, but local and sometimes unstable.

**SHAP (SHapley Additive exPlanations):** grounded in cooperative game theory — it assigns each feature a "fair share" of the prediction by averaging its marginal contribution across all feature subsets. More principled and consistent than LIME, but more computationally expensive. SHAP values have nice properties (they sum to the prediction), which makes them the go-to for serious work.

**Partial dependence / ICE plots:** show how the prediction changes as one feature varies, holding others fixed — great for spotting non-linear effects.

## Where explainability misleads

- **Correlation ≠ causation.** "Feature X is important" doesn't mean X *causes* the outcome; it means the model uses it.
- **LIME instability:** tiny input changes can flip the explanation; don't over-trust a single local explanation.
- **SHAP under feature dependence:** default SHAP assumes features are independent; with correlated features the "subset" counterfactuals can be unrealistic. Use the right estimator.
- **Explanations can be gamed or superficial**, especially on adversarially-tuned models.

## Practical guidance

- Start with **global feature importance** to sanity-check the whole model.
- Use **SHAP** for reliable per-prediction explanations; **LIME** for quick local intuition.
- Always cross-check an explanation against domain knowledge — if it says something absurd, suspect data leakage or a bug.
- Pick interpretable models when the stakes are high and accuracy headroom is small; reserve black boxes for when they clearly earn their opacity.

## My take

Explainability is less about "opening the black box" (you rarely can, fully) and more about *building justified trust and catching errors*. The single most valuable habit: before trusting any model, look at which features drive it — nine times out of ten you'll find something revealing, good or bad. SHAP is my default for serious explanations; LIME for fast checks. But never confuse an explanation with causality, and never skip the domain sanity-check. A model that's explainable-but-wrong is still wrong; explainability is a debugging and trust tool, not a correctness guarantee.

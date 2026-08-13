---
layout: post
title: "Deep Learning"
date: 2025-10-22
tags: [ai]
description: "A practical intro to deep learning: from perceptrons to backprop, CNNs, RNNs, and Transformers."
---

Deep learning is the subfield of machine learning built around **neural networks with many layers** — "deep" because of the stack of transformations between input and output. If you've used speech recognition, a photo app that tags faces, or any modern chatbot, you've used deep learning. I'm writing this as a grounded intro: not the math for its own sake, but the intuition and the moving parts you actually need to understand the rest of this blog (most of which assumes you know what a neural net is).

## The basic unit: the neuron

A single artificial neuron takes several numbers, weights them, sums them, adds a bias, and passes the result through a non-linear **activation function**:

```
output = activation( w1·x1 + w2·x2 + ... + b )
```

The "weights" `w` and bias `b` are the *learned* parameters. A neural network is just many of these arranged in layers: layer 1 reads the input, the last layer produces the output, and the layers in between ("hidden layers") learn progressively richer representations.

## Why the non-linearity matters

Without an activation function, stacking layers would collapse into a single linear transformation — you could never learn "X-shaped" or "circular" boundaries. The non-linearity (ReLU, tanh, sigmoid, GELU…) is what lets networks approximate complicated functions. This is the single most common thing beginners omit and then wonder why their network can't learn anything non-trivial.

## Learning: backpropagation

Training means finding weights that make the network's outputs match the data. The loop:

1. **Forward pass:** run an input through the network to get a prediction.
2. **Loss:** measure the error (e.g. how far the prediction is from the true answer).
3. **Backward pass (backprop):** use the chain rule to compute how much each weight contributed to the error.
4. **Update:** nudge every weight slightly in the direction that reduces the error (gradient descent / its variants).

Repeat over the dataset many times. Backprop is just "compute gradients efficiently through the whole graph" — the chain rule applied mechanically. Modern frameworks (PyTorch, JAX) do it automatically; you rarely write it by hand, but understanding *that* it's happening explains why a bad learning rate or a vanishing gradient breaks training.

## The architectures you'll meet

- **MLPs (multilayer perceptrons):** the vanilla stack. Good for tabular/structured data; bad at spatial or sequential structure.
- **CNNs (convolutional nets):** use local filters that slide over an image, exploiting translation invariance. The backbone of classic computer vision (covered in the CV post).
- **RNNs / LSTMs:** process sequences step by step, carrying a hidden state. Formerly the default for text; now mostly supplanted by Transformers (covered in depth separately).
- **Transformers:** attention-based, parallel-friendly, the architecture behind every LLM. The most important one to understand today.

## Practical realities

- **Data is the bottleneck**, not algorithms. A simple model on lots of clean data usually beats a fancy model on little data.
- **Overfitting is the default failure.** Your network will memorize training data if you let it; regularization, validation splits, and early stopping are how you fight back.
- **GPUs matter.** Matrix multiplies at scale need them; this is why deep learning exploded after GPUs became accessible.
- **Start simple.** For a new problem I reach for a baseline (logistic regression or a small MLP) before anything deep, to know what "easy" looks like.

## My take

Deep learning isn't magic — it's differentiable functions + gradient descent + lots of data and compute. The conceptual spine (neuron → layer → forward/backward → update) is learnable in an afternoon; the *engineering* (data pipelines, regularization, debugging training) is where real skill lives. If you're here to understand LLMs, treat this post as the foundation: every Transformer and attention mechanism later in this blog is just a specific, very successful arrangement of these same building blocks. Get comfortable with backprop intuition and you'll never be lost.

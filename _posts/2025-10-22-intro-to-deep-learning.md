---
layout: post
title: "Deep Learning"
date: 2025-10-22
categories: [Learning]
---

**Core Idea**: Deep learning, a subfield of machine learning, utilizes neural networks with many layers (hence "deep") to model and understand complex patterns in data. This course introduces the fundamentals of building and training neural networks for structured data using TensorFlow and Keras.

## 1. The Neuron and the Layer

A neural network is composed of layers, and each layer is composed of neurons. A neuron receives inputs, applies a transformation (a linear combination followed by an activation function), and produces an output.

*   **Linear Unit**: `y = w[0] * x[0] + w[1] * x[1] + ... + b`
*   **Activation Function**: Introduces non-linearity, allowing the network to learn complex patterns. The Rectified Linear Unit (ReLU) is a common choice: `relu(x) = max(0, x)`.

## 2. Building a Sequential Model in Keras

Keras is a high-level API for building and training deep learning models. The `Sequential` model is a simple stack of layers.

```python
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    # the hidden ReLU layers
    layers.Dense(units=4, activation='relu', input_shape=[2]),
    layers.Dense(units=3, activation='relu'),
    # the linear output layer 
    layers.Dense(units=1),
])
```

## 3. Stochastic Gradient Descent (SGD)

SGD is the optimization algorithm used to train neural networks. It iteratively adjusts the network's weights to minimize the loss function (the error between the model's predictions and the true values).

*   **Loss Function**: Measures the model's error. Common choices include Mean Absolute Error (MAE) and Mean Squared Error (MSE).
*   **Optimizer**: Implements the SGD algorithm. 'Adam' is a popular and effective optimizer.

```python
model.compile(
    optimizer='adam',
    loss='mae',
)
```

## 4. Overfitting and Underfitting

*   **Underfitting**: The model has not learned the patterns in the training data well enough. The training loss remains high.
*   **Overfitting**: The model has learned the training data too well, including the noise. It performs poorly on new, unseen data. The validation loss is much higher than the training loss.

## 5. Preventing Overfitting

### 5.1 Early Stopping

Monitor the validation loss and stop training when it stops improving.

```python
early_stopping = keras.callbacks.EarlyStopping(
    patience=10, # how many epochs to wait before stopping
    min_delta=0.001, # minimum change to count as an improvement
    restore_best_weights=True,
)
```

### 5.2 Dropout

Randomly sets a fraction of neuron outputs to zero during training. This forces the network to learn more robust features.

```python
layers.Dropout(rate=0.3) # apply 30% dropout
```

### 5.3 Batch Normalization

Normalizes the inputs to a layer. This helps to stabilize the learning process and can significantly reduce training time.

```python
layers.BatchNormalization()
```

**Key Takeaways**:

*   Deep learning models are built from layers of neurons.
*   Keras provides a user-friendly API for building and training models.
*   SGD is the core training algorithm, guided by a loss function and an optimizer.
*   Overfitting is a major challenge in deep learning.
*   Techniques like early stopping, dropout, and batch normalization can help to prevent overfitting.

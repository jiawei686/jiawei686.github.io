---
layout: post
title: "Computer Vision"
date: 2026-01-15
categories: [Learning]
---

**Core Idea**: Computer vision is a field of AI that trains computers to interpret and understand the visual world. This course focuses on using Convolutional Neural Networks (CNNs) with TensorFlow and Keras to build powerful image classification models.

## 1. The Convolutional Classifier

A CNN is a specialized type of neural network designed for image data. It uses two key types of layers:

*   **Convolutional Layers**: Apply a set of learnable filters to the image, which act as feature detectors (e.g., detecting edges, corners, textures).
*   **Pooling Layers**: Downsample the feature maps, reducing their dimensionality and making the model more robust to variations in the position of features.

## 2. Building a CNN in Keras

A typical CNN architecture consists of a stack of convolutional and pooling layers, followed by one or more fully-connected (Dense) layers for classification.

```python
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Conv2D(filters=32, kernel_size=3, activation='relu', input_shape=[128, 128, 3]),
    layers.MaxPool2D(),

    layers.Conv2D(filters=64, kernel_size=3, activation='relu'),
    layers.MaxPool2D(),

    layers.Flatten(),
    layers.Dense(units=6, activation='softmax'),
])
```

## 3. Data Augmentation

Data augmentation is a technique used to artificially expand the training dataset by creating modified versions of the training images. This helps to prevent overfitting and improve the model's ability to generalize.

Common augmentation techniques include:
*   Random rotations, zooms, and shifts
*   Horizontal and vertical flips
*   Changes in brightness and contrast

```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(
    rotation_range=40,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest')
```

## 4. Transfer Learning

Transfer learning is a powerful technique where a model pre-trained on a large dataset (like ImageNet) is used as the starting point for a new task. This can significantly improve performance, especially when you have a limited amount of training data.

```python
from tensorflow.keras.applications import VGG16

# Load the pre-trained VGG16 model
conv_base = VGG16(weights='imagenet',
                  include_top=False, # Don't include the classifier
                  input_shape=(150, 150, 3))

# Freeze the convolutional base
conv_base.trainable = False
```

You can then add your own classifier on top of the frozen base and train it on your specific dataset.

**Key Takeaways**:

*   CNNs are the go-to models for computer vision tasks.
*   Convolutional and pooling layers are the core building blocks of a CNN.
*   Data augmentation is a crucial technique for preventing overfitting in image models.
*   Transfer learning allows you to leverage the knowledge from pre-trained models to achieve high performance with less data.

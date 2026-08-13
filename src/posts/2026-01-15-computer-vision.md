---
layout: post
title: "Computer Vision"
date: 2026-01-15
tags: [ai]
description: "Foundations of computer vision: from convolutional nets and ImageNet to transfer learning and vision transformers."
---

Computer vision (CV) is the field of getting computers to *understand images* — classify them, find objects, segment regions, describe scenes. For a long time it was hand-engineered features and fragile heuristics; then deep learning rewrote the field almost overnight. I'm writing this as a foundation because CV also underpins multimodal models (CLIP, covered separately) and a lot of applied AI, and the arc from CNNs to Vision Transformers is a clean story worth knowing.

## Before deep learning: features by hand

Early CV extracted engineered features (SIFT, HOG) and fed them to classifiers. It worked for narrow cases but broke on real-world variety — lighting, pose, background. The breakthrough was letting the model *learn* the features from data.

## Convolutional Neural Networks (CNNs)

CNNs are the architecture that made image understanding work at scale. Instead of feeding raw pixels to a flat network, they use **convolutions** — small filters that slide over the image, detecting local patterns (edges → textures → shapes → objects). Key ideas:

- **Local connectivity & weight sharing:** a filter is reused across the image, so the model needs far fewer parameters and naturally handles translation (a cat in the corner vs. center).
- **Hierarchy:** early layers detect edges; deeper layers compose them into eyes, faces, objects. This emergent feature hierarchy is why CNNs generalize.
- **Pooling:** downsamples spatially, giving some translation invariance and reducing compute.

The 2012 AlexNet win on ImageNet — crushing previous methods — is the moment CV went deep. After that, better architectures (VGG, ResNet with skip connections, EfficientNet) kept pushing accuracy.

## ImageNet and transfer learning

ImageNet (millions of labeled images, 1000 classes) became the training ground that made pretrained models possible. The practical revolution was **transfer learning**: take a CNN pretrained on ImageNet, chop off its final classification layer, and fine-tune the rest on *your* small dataset. Suddenly you could build a competent custom image classifier with a few hundred labeled images instead of a million. This pattern — pretrain on a huge generic dataset, adapt to your task — is the same idea that later powered LLMs.

## The Transformer arrives: ViT

Vision Transformer (ViT) showed you can split an image into patches, treat each patch like a "token," and feed them to a standard Transformer (the kind used in LLMs). With enough data, ViT matched or beat CNNs. This was a big conceptual unification: **vision and language became the same architecture**. It also set up CLIP and the whole multimodal era, where a shared Transformer handles both.

## Common CV tasks

- **Classification:** what's in the image (ImageNet-style).
- **Object detection:** find and box multiple objects (YOLO, Faster R-CNN).
- **Semantic / instance segmentation:** label every pixel (what vs. which instance).
- **Pose / depth / generation:** keypoints, 3D, and now diffusion-based image creation.

## Practical realities

- **Data and augmentation** matter as much as architecture. Random crops, flips, color jitter stretch a small dataset.
- **Pretrained models are the default** — almost nobody trains from scratch anymore; use a backbone (ResNet, ViT) and adapt.
- **CNNs are still great** for many production tasks: simpler, faster to train, less data-hungry than ViT. Don't assume Transformer = automatically better for your case.
- **Be aware of bias:** models trained on web images inherit the quirks and biases of that data.

## My take

Computer vision's arc — hand features → CNNs → pretrain/transfer → Transformers → multimodal — is a template the whole field has followed, and it directly feeds the LLM story (pretrain on lots of data, adapt to your task; unify architectures). For practitioners, the takeaway is pragmatic: stand on pretrained backbones, use transfer learning, and pick CNN vs. ViT based on your data size and latency budget rather than fashion. And if you go further into multimodal AI, CLIP and friends are built on exactly these foundations — understanding convolutions and ImageNet transfer is the on-ramp.

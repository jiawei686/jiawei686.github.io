---
layout: post
title: Connection-Oriented Transport - TCP
date: 2017-05-18
tags: [engineering]
---

These are my notes on the TCP chapters from *Computer Networking: A Top-Down Approach* (Kurose & Ross). TCP is the protocol that makes the unreliable IP layer feel reliable, and the mechanisms it uses — connection setup, sequence numbers, adaptive timeouts, flow and congestion control — are worth understanding concretely rather than as vague buzzwords.

## 3.5 TCP Connection

A TCP connection is **connection-oriented**: before application process A can send data to process B, the two must first "handshake" — exchange a few preliminary segments to establish the parameters that guarantee reliable delivery.

- **Full-duplex service**: once a TCP connection exists between A and B, application data can flow from A to B *and* from B to A at the same time.
- **Point-to-point**: a single sender has exactly one receiver.
- **MSS (Maximum Segment Size)**: the largest chunk of application data TCP will put in one segment.

### 3.5.1 Connection setup

The three-way handshake (`SYN`, `SYN-ACK`, `ACK`) establishes the connection and synchronizes both sides' initial sequence numbers. Only after that can data flow.

### 3.5.2 Segment structure

Each segment carries a **sequence number** and an **acknowledgment number**. The sequence number of a segment is the byte-stream number of the first data byte it carries; the acknowledgment number is the next byte the sender expects to receive. This is the foundation of reliable, in-order delivery.

### 3.5.3 RTT estimation and timeout

TCP continuously estimates the round-trip time so it knows how long to wait before assuming a segment was lost.

- **EstimatedRTT**: every time a new `SampleRTT` arrives, TCP updates its estimate exponentially:

$$ EstimatedRTT = (1-\alpha) \cdot EstimatedRTT + \alpha \cdot SampleRTT $$

- **DevRTT** measures how much `SampleRTT` typically deviates from `EstimatedRTT`:

$$ DevRTT = (1-\beta) \cdot DevRTT + \beta \cdot | SampleRTT - EstimatedRTT | $$

- **TimeoutInterval** must be at least `EstimatedRTT` (otherwise you'd retransmit unnecessarily) but not so large that you stall on loss:

$$ TimeoutInterval = EstimatedRTT + 4 \cdot DevRTT $$

### 3.5.4 Reliable data transfer

When a timeout expires, TCP **doubles** the timeout interval after each retransmission. This is a deliberate back-off: if the network is congested, slamming it with immediate retransmits only makes things worse.

### 3.5.5 Flow control and congestion control

- **Flow control** keeps the sender from overwhelming the receiver's buffer. It's a speed-matching service: the sender's rate is matched to how fast the receiver's application reads.
- **Congestion control** throttles the sender because the IP network itself is congested.

Two windows bound how much can be in flight:

- **rwnd (receive window)**: how much buffer space the receiver has left, advertised to the sender.
- **cwnd (congestion window)**: the sender's own estimate of how much the network can take.

The sender may have at most `min(cwnd, rwnd)` unacknowledged bytes outstanding.

## 3.6 Principles of congestion control

### 3.6.1 Causes and cost of congestion

When too many sources send too fast, routers drop packets, senders retransmit, and the useful throughput collapses. The cost isn't just dropped packets — it's wasted bandwidth from redundant retransmissions.

### 3.6.2 Approaches to congestion control

- **End-to-end congestion control**: the network layer gives no explicit feedback; the end systems infer congestion from loss and delay (this is what TCP does).
- **Network-assisted congestion control**: routers signal congestion to end hosts. Hard to do in the IP layer, which provides no such explicit feedback.
- **Slow start**: `cwnd` starts small (often one MSS) and grows exponentially until it hits a threshold, then switches to additive-increase / multiplicative-decrease.

## My take

The thing that finally made TCP "click" for me was realizing it solves *two different* problems with two different windows. Flow control protects the **receiver**; congestion control protects the **network**. Beginners conflate them because both end up limiting how fast you send, but they're measured against completely different resources. If you only remember one equation, remember `TimeoutInterval = EstimatedRTT + 4·DevRTT` — it captures the whole philosophy: be patient enough to avoid spurious retransmits, but not so patient that a lost packet stalls the connection for seconds.

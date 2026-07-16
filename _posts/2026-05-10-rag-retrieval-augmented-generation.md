---
layout: post
title: "RAG: Retrieval-Augmented Generation"
date: 2026-05-10
tags: [llm]
subcat: agents
---

**Paper:** Lewis, Perez, Piktus, Petroni, Karpukhin, Goyal, Küttler, Lewis, Yih, Rocktäschel, Riedel, Kiela, *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, NeurIPS 2020. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)

Before RAG, an LLM kept all its knowledge in its weights, that is the parametric memory. To add a fact you had to retrain or fine-tune. To answer "what changed yesterday" you were stuck. RAG marries a **parametric** generative model with a **non-parametric** external knowledge index. The model can look things up. That one idea is the seed of nearly every production LLM app that "knows your data": enterprise search, support bots, coding assistants over private repos. If you build agents, you will almost certainly use RAG.

## Two kinds of memory

- **Retriever**: Dense Passage Retrieval (DPR). A query encoder `E_Q` and a passage encoder `E_P` embed into the same space; the top-k passages are pulled from a FAISS index.
- **Generator**: a BART-large seq2seq model that conditions on the retrieved passages to produce the answer.

The model marginalizes over the retrieved documents instead of committing to one:

$$
p_{\theta,\eta}(y \mid x) = \sum_{z \in \text{top-k } \mathcal{Z}} p_\eta(z \mid x)\; p_\theta(y \mid x, z)
$$

where `p_η(z|x)` is the retriever's distribution over documents and `p_θ` is the generator.

## RAG-Sequence vs RAG-Token

Two inference schemes differ in how "global" the retrieval is:

- **RAG-Sequence** uses a *single* retrieved document to generate the whole output.
- **RAG-Token** picks a (possibly different) document for *every* output token. It's a mixture-of-experts over the top-k, where each expert is one passage:

$$
p_\theta(y_i \mid x, y_{<i}) = \sum_{z} p_\eta(z \mid x, y_{<i})\; p_\theta(y_i \mid x, z, y_{<i})
$$

RAG-Token shines when the answer needs facts drawn from several sources at once.

## Training and a minimal retriever sketch

Retriever and generator are optimized **end-to-end** by maximizing the marginal likelihood above; the DPR encoder is fine-tuned alongside BART. A minimal retrieve step looks like this:

```python
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("facebook/dpr-question_encoder-single-nq-base")
index = load_faiss_index("wiki_passages")   # pre-encoded corpus

def retrieve(query, k=5):
    q = model.encode(query)
    scores, ids = index.search(q, k)        # nearest neighbours
    return [passages[i] for i in ids]
```

The modern stack (embeddings + vector DB + reranker + generator) is a direct descendant of this.

## Results, briefly

- State of the art on Natural Questions (open-domain), WebQuestions, TriviaQA, MS-MARCO NLG, and Jeopardy at the time.
- Beat both purely parametric seq2seq models and task-specific retrievers.
- Less hallucination, and the practical kicker: knowledge can be **updated by swapping the index. No retraining**.

## Where this actually lands

RAG is the default pattern for grounding LLMs in private or up-to-date data. The Sequence/Token distinction maps to a real production choice: cite per-document (Sequence) versus cite per-sentence (Token). Pair this with the ReAct and Toolformer posts and you have the three pillars of a grounded agent, which are retrieve, reason, act. The thing I'd flag: most production RAG today barely resembles this 2020 setup, and chunking plus reranking matters far more than the BART generator ever did.

## References

- Lewis et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.* [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)
- Karpukhin et al. (2020). *Dense Passage Retrieval for Open-Domain QA.* [arXiv:2004.04906](https://arxiv.org/abs/2004.04906)

---
layout: post
title: "Toolformer: Language Models That Teach Themselves to Use Tools"
description: "Toolformer explained: a 6B model teaches itself to use tools from unlabeled text. The ancestor of GPT-4 function calling, with code. arXiv:2302.04761"
date: 2026-05-24
tags: [llm]
subcat: agents
---

Toolformer (Schick et al., 2023, arXiv:2302.04761) asked a deceptively simple question: *can a model learn to use tools on its own, without humans demonstrating how?* The answer — yes, by generating its own supervised training data — was a key step toward the tool-use we now take for granted in chat models. I'm writing this because Toolformer's "self-supervised tool learning" idea is the ancestor of function-calling in modern LLMs, and the method is clever and reusable.

## The problem: tool use usually needs human demos

To make a model call a calculator, a search API, or a translator, the standard approach was to *collect demonstrations* — humans writing "here's how you invoke the tool." That's expensive and doesn't scale to many tools. Toolformer removed that bottleneck.

## The core method: let the model write its own training data

Toolformer's pipeline for each tool:

1. **Sample candidate tool calls.** Take unlabeled text; have the model propose where a tool *could* be useful and what arguments to pass.
2. **Execute the calls** on the real tool (e.g. actually run the calculator, actually query the API).
3. **Keep only helpful ones.** Feed the tool's result back and check: did adding this call-and-result *improve the model's ability to predict the rest of the text*? If yes, keep it; if no, discard.
4. **Fine-tune** on the filtered examples.

So the model **teaches itself** which tools help and how to use them, using the tool's real output as the quality signal. No human-labeled "how to call a calculator" needed.

## Why this was a big deal

- **Self-supervised tool learning.** Scaling to new tools is just "let the model propose calls + execute + filter." Far cheaper than hand-labeling.
- **It actually worked** on a 6B model across calculators, Q&A APIs, search, translation, and calendars — matching or beating much larger models that were explicitly trained with demonstrations.
- **It prefigured function calling.** Today's models "call functions" via a similar philosophy: the model decides to invoke a tool, we execute it, the result returns to context. Toolformer showed the *learning* could be automated.

## A minimal sketch

```python
# Conceptual: the model proposes a call; we execute; we keep if it helps.
text = "What is 245 * 372?"
proposal = model.suggest_call(text)        # -> <call>calc(245*372)</call>
result   = execute(proposal)               # -> 91140
augmented = f"{text} <call>calc(245*372)</call> => {result}"
if helps_predict_continuation(augmented):
    training_data.append(augmented)
```

The "helps predict continuation" check is the elegant filter — it uses the model's own next-token objective as the teacher.

## Limitations and honest caveats

- Toolformer fine-tunes a model per tool set; modern systems instead bake function-calling into pretraining/instruction-tuning, which is more robust.
- The "does it help" filter can be noisy; poorly-executed tools produce garbage signals.
- It was demonstrated on a 6B model; the *capability* scaled up dramatically in later instruction-tuned models.
- Generating and executing many candidate calls is computationally heavy at training time.

## My take

Toolformer's lasting contribution isn't the specific model — it's the *concept*: a model can learn to use tools by self-generating and self-filtering training examples against real tool outputs. That idea underpins how modern LLMs acquired function calling without millions of hand-written demos. If you're designing tool-using agents today, the practical lesson is: **let the model decide when to call, execute for real, and return the result into context** — and make the observation clean and trustworthy, because the model's behavior hinges on what it sees there. Toolformer proved that loop can be learned, not just programmed.

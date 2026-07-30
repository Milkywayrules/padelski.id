---
name: dio-stop-exploring-pick-one
description: Force a single choice when option exploration keeps looping.
disable-model-invocation: true
---

The user wants one pick — not more options or background re-explaining.

From this conversation (and artifacts already in context), reply with **only**:

## pick
<single recommended choice — one line>

## why
<one or two sentences max>

## rejected
- option — one-line reason each (only options actually discussed)

## next action
<one concrete verb-first step>

Rules:
- Exactly one pick in `## pick`.
- Do not introduce new options not already in the conversation.
- Do not ask for confirmation — state the pick and next action.

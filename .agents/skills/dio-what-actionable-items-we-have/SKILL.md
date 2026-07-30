---
name: dio-what-actionable-items-we-have
description: List open actionable items from the conversation, grouped by priority.
disable-model-invocation: true
---

From this conversation (and artifacts already in context), reply with **only**:

## P0 — do now
- [ ] action — one-line context

## P1 — soon
- [ ] action — one-line context

## P2 — later
- [ ] action — one-line context

Rules:
- One concrete next action per bullet (verb-first).
- Omit empty priority sections entirely.
- If nothing is actionable, use a single heading `## none` and one sentence.
- Do not invent work that was not discussed.

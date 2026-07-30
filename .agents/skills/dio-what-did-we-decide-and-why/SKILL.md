---
name: dio-what-did-we-decide-and-why
description: Extract decisions from the conversation — settled, rejected, and rationale.
disable-model-invocation: true
---

From this conversation (and artifacts already in context), reply with **only**:

## decisions
- decision — status (settled | provisional) — one-line rationale

## rejected
- option — why not (one line)

## rationale
- key reason that drove the main decisions (bullets, one line each)

Rules:
- Decisions only — not a task list (use a separate actionable-items macro for next steps).
- Omit empty sections.
- Do not invent decisions that were not discussed.

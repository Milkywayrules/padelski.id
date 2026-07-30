---
name: dio-summarize-only-the-deltas-since-last-checkpoint
description: Incremental recap of what changed since the last status or decision checkpoint.
disable-model-invocation: true
---

From this conversation (and artifacts already in context), reply with **only**:

## changed
- item — what changed (one line)

## unchanged
- item still true (one line each — keep brief)

## new risks
- risk or concern introduced since the last checkpoint (one line)

Rules:
- Deltas only — not a full thread recap.
- If no clear checkpoint exists, treat the start of the current topic as the baseline and say so in one line under `## changed`.
- Omit empty sections.

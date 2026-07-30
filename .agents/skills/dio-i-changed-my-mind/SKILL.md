---
name: dio-i-changed-my-mind
description: Supersede a prior decision cleanly so conversation state stays coherent.
disable-model-invocation: true
---

The user is reversing or updating a prior decision from this conversation.

From this conversation (and artifacts already in context), reply with **only**:

## was
<prior decision — one line>

## now
<new decision — one line>

## why
<one or two sentences>

## invalidate
- downstream item or plan that no longer applies (one line each)

Rules:
- Use the most recent relevant decision if the user did not specify which one.
- Do not re-pitch alternatives — record the supersession and adjusted plan.
- Omit `## invalidate` if nothing downstream needs updating.

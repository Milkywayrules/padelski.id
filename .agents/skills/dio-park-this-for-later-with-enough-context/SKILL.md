---
name: dio-park-this-for-later-with-enough-context
description: Defer a side topic with enough context to resume without re-discovery.
disable-model-invocation: true
---

The user wants to park a topic without derailing the current thread.

From this conversation (and artifacts already in context), reply with **only**:

## parked
<topic — one line>

## why later
<one sentence>

## resume with
- minimum context needed to pick this up again (bullets, one line each)

## do not redo
- work already done that should not be repeated (one line each)

Rules:
- If the user named a topic in the slash invocation, park that; otherwise park the most recent tangent.
- Do not re-pitch the parked topic — capture and return to the main thread.
- Omit empty sections.

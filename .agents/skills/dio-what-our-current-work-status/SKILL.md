---
name: dio-what-our-current-work-status
description: Snapshot current work status from the conversation and active task context.
disable-model-invocation: true
---

From this conversation (and artifacts already in context), reply with **only**:

## in progress
- item — current state (one line)

## blocked
- item — blocker — what unblocks it

## done (this thread)
- item — outcome (one line)

## next
- item — suggested first step

Rules:
- One line per bullet.
- Omit empty sections.
- "Done" means this conversation/thread only.
- Do not start new repo exploration unless a section would be misleadingly empty.

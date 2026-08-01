# Relay contract

Every subagent returns this shape to its parent (L2 → L1 → L0):

```markdown
## summary
2–4 sentences — outcome only

## changes
files touched, or "none"

## verification
commands run + pass/fail, or "not run" + why

## evidence
key output that proves claims

## blockers
questions needing human/parent decision — empty if none

## resume-id
agent id if work continues — empty if done
```

L0 relays a **compressed** version to the human — no raw tool logs unless asked.

Background subagents may write verbose output under `~/.cursor/subagents/`; summary only in relay.

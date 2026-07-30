---
name: dio-ok-i-go-with-your-recommendations
description: Proceed with the agent's prior recommendations without re-asking.
disable-model-invocation: true
---

Treat this invocation as: the user accepts your latest recommendations and wants you to proceed.

- Do not re-pitch options or ask for confirmation again.
- Execute the recommendations you already made in this conversation.
- If multiple recommendations exist, use the most recent and name which one you are executing.
- If recommendations were ambiguous, pick the clearest prior plan, state the one assumption, then proceed.
- Respect workspace orchestrator rules when project rules (e.g. AGENTS.md) require delegating implementation to subagents.

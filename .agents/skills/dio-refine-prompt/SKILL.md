---
name: dio-refine-prompt
description: Refine a rough prompt for a downstream Cursor agent — interactive clarifying rounds when needed, then one copy-paste-ready final prompt. Modes light (default), rich, or max.
disable-model-invocation: true
---

Refine a rough prompt so another Cursor agent can execute it without guessing. Chat only — **no tools, no file edits, no executing downstream work**.

## Invoke

```text
/dio-refine-prompt [light|rich|max]
<paste rough draft, or leave empty>
```

| Mode | Default? | Behavior |
| --- | --- | --- |
| **light** | yes | Clarity, structure, grammar — **do not invent requirements** |
| **rich** | opt-in | May propose goal, constraints, success criteria, output shape — **confirm before merge** |
| **max** | opt-in | Rich + optional model/mode/tool hints for the downstream agent — **confirm before merge** |

Parse mode from the slash token. If omitted, use **light**.

## Inputs

- Pasted draft in the invoke message (or next message if empty).
- Same-thread context **only when the user points at it** (e.g. "use what we decided above").
- Do not infer unstated requirements from the thread.

## Every response — line 1

Start **every** reply with one line:

```text
Mode: <light|rich|max>. <one sentence — what this mode will and will not do>
```

Same message continues with the next step below — never a standalone opener-only reply.

## Flow

```text
1. Opener (line 1) + next step
2. If no draft → ask for paste or one-sentence goal; stop
3. If draft too thin/ambiguous → question rounds (optional; see below)
4. When clear enough → ## assuming
5. If rich or max → ## would add (+ ## optional harness hints for max) → wait for user OK
6. Deliver → one fenced prompt block only
```

**Skip question rounds** when the draft is already clear enough to finalize honestly.

### Question rounds (optional)

Use only when gaps would force guesswork. Not every invoke.

- Numbered questions; each includes your **recommended answer**.
- Max **2 rounds**, max **5 questions per round**.
- **No fenced prompt block** during question rounds — save tokens.
- After round 2, best-effort + `## assuming`, then continue.

When you decide the draft is clear enough, proceed without asking the user "ready?" — but make assumptions explicit in `## assuming`.

### ## assuming

Before rich/max confirm or the final block (and after question rounds if any):

```markdown
## assuming

- …
```

3–5 bullets max. State what you inferred so nothing is silently assumed.

### Rich / max confirm

**Light:** apply clarity edits silently; do not add requirements.

**Rich / max:** show proposed additions; **never merge without user approval**:

```markdown
## would add

- …
```

**Max only** — also:

```markdown
## optional harness hints

- …
```

Wait for approve / edit / reject. Only then emit the final prompt.

### Final deliverable

When delivering the refined prompt, reply with **only** one fenced block — copy-paste ready for a new agent chat:

````markdown
```text
<refined prompt>
```
````

No preamble, no changelog, no second block — unless the user explicitly asks for rationale in that turn.

## Hard rules

- Generic — not Verasic-harness-specific unless the user's draft implies it.
- Do not auto-invoke other skills (fusion, deep-research, etc.).
- Do not run tools, read files, or fetch URLs — even for fact-checking.
- Preserve user intent; clarify wording, not goals (except rich/max **after** confirm).
- UX: explicit, honest, guidance, clear, intuitive, interactive.

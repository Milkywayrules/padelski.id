# AGENTS

<!-- verasic-governance:start -->

## GitHub agent harness

- Load `GH_TOKEN` before any `gh` mutation: `source .agents/skills/verasic-github-cli-init/scripts/load-gh-env.sh` (or `.cursor/skills/` equivalent).
- Verify with `bash .agents/skills/verasic-github-cli-init/scripts/check-gh.sh` — never bare `gh auth status` in chat.
- Agents push **feature branches only** and open a PR; **never push to `main`** (including `git push https://x-access-token:...@github.com/owner/repo.git main` or `feature:main` refspecs).
- HTTPS + PAT is for auth to push feature branches when SSH is unavailable — not a license to update the default branch.
- `VERASIC_GOVERNANCE_BYPASS=1` bypasses the **local** pre-push hook only; GitHub branch protection still applies when configured.
- Never use `git push --no-verify` to skip hooks — the local gate is fast feedback only; GitHub branch protection is the hard backstop.
- Prefer agent PATs with **Contents** + **Pull requests** write — not **Administration** write (admin tokens can disable protection).

## Governance routing

Mutating GitHub operations (repo create, settings, branch protection, CI bootstrap, transfer prep) require the **verasic-github-governance** skill — read `references/governance-protocol.md` and follow `references/factory-protocol.md`.

Soft enforcement (hooks + CI culture + doctor) is the default on private Free plans. OpenTofu hard protection applies only when plan allows and `enable_hard_protection=true`.

Required CI status check name: **`ci`**.

Full spec: install **verasic-github-governance** from [verasic-skills](https://github.com/Milkywayrules/verasic-skills) (`skills/verasic-github-governance/SKILL.md`).

<!-- verasic-governance:end -->

## Verasic Fusion (default config)

fusion. composer, grok, claude opus-5, gpt sol, gemini 3.* flash.

# Deep research brief — Padel domain official sources

**Question:** Official and authoritative padel rules, scoring formats, match structure, federation specs (FIP etc.), ranking systems. What must padelski.id respect vs what is optional for a recreational unofficial app? Sources for scoring (+1/decrement/type), games/sets structure.

**Pre-flight:** depth `adversarial-deep` · output `files-only` · path `./docs/research/padel-domain-official-sources/` · source-boundary `public-extended` · languages English · domain `general`

**Execution note:** degraded T1 sequential single-context (subagent constraint); verify-before-cite applied to all cited rows.

---

## answer

The **International Padel Federation (FIP) Rules of Padel (effective 01.01.2026)** is the primary authority for match scoring and structure [1]. Padel uses **tennis-style game points** (15 → 30 → 40 → game), not +1 increment within a standard game [1]. At deuce, FIP defines **three official resolution types**: Classic Advantage, Star Point, and Golden Point [1][2]. **Sets** default to first to **6 games** with a **2-game margin**, tie-break at **6–6**; **matches** default to **best of 3 sets** [1]. **Tie-breaks** switch to **numeric +1 scoring** (0, 1, 2, 3…) to 7 with win-by-2 [1].

For **padelski.id Phase 0 MVP**, treat FIP match logic as the **reference model**, not a hard compliance mandate, unless the product targets sanctioned tournaments:

| Must respect (MVP “standard match” mode) | Optional / configurable (recreational unofficial app) |
| --- | --- |
| 15-30-40-game progression inside games [1] | Deuce type: Advantage vs Star Point vs Golden Point [1][5] |
| Set win at 6 games, 2-game margin, 7–5 cap path, 6–6 tie-break [1] | One-set matches, 4-game mini-sets, match TB (7), super TB (10) [1] |
| Tie-break numeric +1 to 7, win by 2; set score 7–6 [1] | Third set without tie-break (long set) if pre-agreed [1] |
| Best-of-3 as default match shell [1] | Americano/Mexicano +1 rally formats (not FIP) [8][9] |
| Mixed deciding-point receiver same sex as server [1] | FIP ranking integration, draw sizes, conduct/time rules [3][12] |
| Star Point as 2026 default on Premier Padel / CUPRA FIP Tour [5] | Court/ball/racket homologation specs (out of scoring MVP scope) [1] |

**Ranking systems** (FIP Ranking: 22 best results from Premier Padel + CUPRA FIP Tour; 52-week defence) apply only to **sanctioned professional circuits** [3][4] — not required for a recreational scorekeeper.

**+1 / decrement / type summary:**

| Scoring type | Where used | Point model | Authority |
| --- | --- | --- | --- |
| **Named (15-30-40)** | Standard games | Increment by named steps; deuce at 3–3 points | FIP Rule 1 [1] |
| **Numeric +1** | Set tie-break, match TB, super TB | +1 per rally; win by 2 at target | FIP Rule 1 tie-break / alt methods [1] |
| **+1 rally (no decrement)** | Americano, Mexicano | +1 per rally to target (16/24/32) or time box | Club convention [8][9] |
| **“Decrement”** | Advantage / Star Point deuce | Not a separate score type — losing advantage **returns** to deuce (state rollback), not minus-one arithmetic [1] | FIP Rule 1 Options 1–2 [1] |

No verified FIP or PBPI source defines **decrement scoring** (subtract points on loss) for standard padel. Treat decrement as **unsupported** unless a future national/club rulebook is verified.

---

## reasoning

### 1. Authority stack

1. **FIP Rules of Padel (2026 PDF)** — governing-body primary (T0) [1].
2. **FIP documents index** — confirms core rules plus circuit-specific rulebooks (Premier Padel, CUPRA FIP Tour) [2].
3. **Circuit announcements** — Star Point adoption on Premier Padel and CUPRA FIP Tour from 2026 (T1) [5].
4. **Ranking pages/PDFs** — professional ranking only (T0) [3][4].
5. **Recreational formats** — Americano/Mexicano documented by club/education sites (T2), **not** FIP rulebook entries [8][9].

PBPI (Indonesia national federation) was identified [10] but **no scoring rulebook** was verifiably fetched; Indonesia-specific defaults remain a gap.

### 2. Game scoring (type = named, not +1)

FIP Option 1 (Advantage) states the canonical progression: first point **15**, second **30**, third **40**, fourth **game**; at 3–3 points **deuce**, then **advantage** until two consecutive points win the game [1]. Options 2 (Star Point) and 3 (Golden Point) preserve the same 15-30-40 lead-in but change **only deuce resolution** [1].

**Conflict flagged:** Golden Point Option 3 text says the pair that wins the deciding point “wins the **match**” [1] — context and parallel Star Point wording imply **game**; treat as **PDF typo** for implementation.

### 3. Deuce resolution types (2026)

| Option | FIP label | Behaviour at 40–40 |
| --- | --- | --- |
| 1 | Advantage | Unlimited deuce/advantage cycles; need 2 consecutive points [1] |
| 2 | Star Point | deuce 1 → adv 1 → deuce 2 → adv 2 → deuce 3 → **Star Point**; receiver picks side, no position swap [1] |
| 3 | Golden Point | Single deciding point at first deuce; receiver picks side, no position swap [1] |

Premier Padel and CUPRA FIP Tour **default to Star Point from 2026** [5]. Club/recreational play often still uses Golden Point or Advantage regionally [6][7] — organizer choice, not automatic FIP circuit default [6].

### 4. Sets and match structure

- **Set:** first to **6 games**, min **2-game** lead; at **5–5**, continue to **7–5**; at **6–6**, **tie-break** [1].
- **Match:** **best of 3 sets**; win **2 sets** [1].
- **Third set variant:** may omit set tie-break if **previously established**; then 6–6 requires **2-game margin** [1].
- **Alternative methods (pre-established):** 4-game mini-set; **match tie-break to 7** replacing third set; **super tie-break to 10** replacing third set — all win-by-2 [1].

### 5. Tie-break = numeric +1 type

Inside tie-break, points are called **“zero”, “1”, “2”, “3”…** First to **7** with **2-point margin** wins tie-break and set (7–6) [1]. Service rotation follows FIP tie-break schedule [1]. Match-level and super tie-breaks use the same **+1 numeric** model with targets 7 or 10 [1].

### 6. Ranking (federation spec — out of recreational MVP)

FIP Ranking 2026: **22 best results** from **Premier Padel + CUPRA FIP Tour** [3]. Point tables vary by tournament tier (e.g. FIP Platinum winner **300** pts, Gold **150**, Finals **225** per 2025 criteria doc) [4]. Defence uses a **52-week** corresponding-week cycle [3]. Separate **FIP Promises** youth ranking uses **9 best results** [2]. None of this governs casual club match scoring.

### 7. Recreational unofficial app boundary

A scorekeeper that is **not** submitting results to FIP/PBPI should:

- Implement **FIP-accurate standard match engine** as the default reference.
- Expose **format presets** (deuce type, set length, match TB/super TB, single-set) as **user-selected match config**, mirroring FIP “alternative score methods” and club practice [1][6].
- Treat **Americano/Mexicano** as a **separate scoring mode** (+1 rally, individual totals) — popular but **not FIP-standard** [8][9].
- **Defer** ranking points, eligibility, conduct penalties, ball-change policy, and equipment homologation unless product scope expands [1][3].

---

## confidence

**Overall headline: 84/100** (general pack; material claims weighted 2×)

Scores are structured estimates, not statistical certainty.

### Axis legend

| Code | Axis | What it measures |
| ---- | ---- | ---------------- |
| SQ | Source Quality | Authority and tier of sources (T0–T3) |
| EC | Evidence Convergence | Independent sources agreeing |
| CG | Claim Grounding | How well excerpts support the claim |
| CO | Coverage | Scope, geography, time, alternatives explored |
| VR | Verification Rigor | Fetch success, ledger quality, recency |

### Per-claim breakdown (material)

#### Claim: Standard 15-30-40 game scoring and 6-game sets (C1, C5, C6)

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 98 | FIP 2026 PDF T0 [1] |
| EC | 90 | Corroborated by FIP docs index [2] |
| CG | 98 | Verbatim Rule 1 text |
| CO | 92 | Global FIP scope |
| VR | 95 | Full PDF fetch 2026-07-31 |
| **Headline** | **95** | |

Weakest axis: **EC** (single primary dominates).

#### Claim: Three FIP deuce options including Star Point (C2, C3, C4)

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 95 | FIP PDF Options 1–3 [1] |
| EC | 88 | Premier Padel 2026 announcement [5] |
| CG | 95 | Verbatim option blocks |
| CO | 88 | Pro vs club defaults differ |
| VR | 92 | 2026 rulebook + Dec 2025 announcement |
| **Headline** | **92** | |

Weakest axis: **CO** (regional club defaults unevenly documented).

#### Claim: Tie-break numeric +1 to 7, win by 2 (C7)

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 98 | FIP Rule 1 tie-break [1] |
| EC | 90 | Consistent across FIP PDF versions |
| CG | 98 | Direct excerpt |
| CO | 90 | Applies all standard set TB |
| VR | 95 | Verified fetch |
| **Headline** | **95** | |

Weakest axis: **EC**.

#### Claim: Americano/Mexicano +1 rally scoring (C17)

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 55 | T2 club/education sources only [8][9] |
| EC | 70 | Two independent T2 sites agree |
| CG | 75 | Clear format descriptions |
| CO | 65 | Common globally; not Indonesia-verified |
| VR | 70 | Full page fetch; not FIP primary |
| **Headline** | **68** | |

Weakest axis: **SQ** (no T0/T1 authority).

#### Claim: Organizer chooses among FIP-validated deuce formats (C15)

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 70 | T2 magazine + T0 option structure [6][1] |
| EC | 75 | Aligns with circuit-specific defaults [5] |
| CG | 72 | Interpretive; FIP PDF lacks explicit “pick one” sentence in Option headers |
| CO | 70 | Reasonable inference for product design |
| VR | 75 | Contested wording |
| **Headline** | **55** | contested cap applied |

Weakest axis: **CG** (inference from structure, not explicit statute sentence).

---

## conflicts

1. **Golden Point PDF typo vs game logic [1]:** Option 3 says winning the golden point wins the “match”; Option 2 Star Point and tennis convention imply **game**. **Recommendation:** implement as **game won**; document FIP typo in product notes.

2. **Default deuce format by context [5][6][7]:** Premier Padel / CUPRA FIP Tour → **Star Point** from 2026 [5]. Many clubs/leagues → **Golden Point** or **Advantage** [6][7]. **Recommendation:** padelski.id default preset = **Golden Point** or user locale survey for Indonesia; offer all three.

3. **“Agreed in advance” wording [7] vs 2026 PDF structure [1]:** Commentary site states alternate scoring must be agreed beforehand [7]; 2026 PDF embeds three Options under Rule 1 without a single global “agreement” sentence. Alternative set formats explicitly require being **“previously established”** [1]. **Recommendation:** product requires **explicit match-format selection before start** — aligns with FIP spirit and reduces disputes.

4. **Padel Magazine vs Premier Padel announcement on which format Premier used pre-2026 [5][6]:** Magazine article timing may predate 2026 switch. **Resolved:** 2026+ Star Point on Premier Padel per FIP/Premier announcement [5].

---

## unverified

| Gap | Why unverified | Suggested follow-up |
| --- | --- | --- |
| PBPI published scoring/regulations | Site error on `/en/about-us`; no rule PDF linked from landing [10] | Request PBPI rulebook or tournament reg pack |
| Premier Padel / CUPRA FIP Tour rulebook PDFs (full text) | Listed on FIP documents [2] but not fetched/verified in this pass | Fetch circuit PDFs; confirm Star Point + draw defaults |
| Indonesia club default deuce format | No T0/T1 Indonesia source | User research / club survey for padelski.id market |
| Decrement scoring | No source in FIP or recreational docs | Omit unless user supplies club rule |
| WPT legacy formats | Out of FIP 2026 core scope | Only if historical import needed |
| Exact FIP 2026 ranking point table rows | PDF table partially garbled on fetch [4] | Re-fetch PDF or use FIP HTML tables |

If `verasic-fusion` is installed, paste `## unverified` into a manual `brief-research` follow-up — opinions only, not ledger verification.

---

## references

[1] International Padel Federation, "Rules of Padel," Review of application 01.01.2026, https://www.padelfip.com/wp-content/uploads/2025/12/FIP_Rules-of-Padel.pdf (accessed 2026-07-31).

[2] International Padel Federation, "Documents," Padel FIP, https://www.padelfip.com/documents/ (accessed 2026-07-31).

[3] International Padel Federation, "Ranking System & Points Breakdown," Padel FIP, https://www.padelfip.com/ranking-system-points-breakdown/ (accessed 2026-07-31).

[4] International Padel Federation and Premier Padel, "FIP and Premier Padel Announce New 2025 FIP Ranking Points and Tournament Criteria," PDF, https://www.padelfip.com/wp-content/uploads/2025/01/FIP_Premier_Padel_announce_new_2025_FIP_ranking_points-and-tournament_criteria_FINAL_EN.pdf (accessed 2026-07-31).

[5] InterPadel Media, "Premier Padel and FIP present the 2026 calendar, featuring new cities and a new scoring system," https://www.interpadelmedia.com/en/premier-padel-and-the-fip-present-the-2026-calendar-featuring-new-cities-and-a-new-scoring-system/ (accessed 2026-07-31).

[6] Padel Magazine, "The three scoring formats recognized by the International Federation of Padel," https://www.padel-magazine.co.uk/the-three-scoring-formats-recognized-by-the-International-Padel-Federation/ (accessed 2026-07-31).

[7] padel.how, "Official Padel Rules (FIP) — Full Text with Practical Commentary," https://padel.how/rules/official-fip-padel-rules/ (accessed 2026-07-31) — snippet-only interpretive support.

[8] Padel Fast, "Padel Americano: Rules, Scoring & Format," https://www.padelfast.com/formats/americano (accessed 2026-07-31).

[9] Padel Fast, "Padel Mexicano: Rules, Scoring & How to Play," https://www.padelfast.com/formats/mexicano (accessed 2026-07-31).

[10] Perkumpulan Besar Padel Indonesia, "PBPI," https://www.pbpi.or.id/id (accessed 2026-07-31) — snippet-only; no rulebook verified.

---

## recommendation

### MVP scoring spec (Phase 0)

Implement **two scoring engines**:

1. **Standard Match (FIP-aligned)**
   - Game points: `0 → 15 → 30 → 40 → game` with deuce flag.
   - Deuce handler strategy: `advantage | star_point | golden_point` (config per match).
   - Set: games to 6, win by 2, tie-break at 6–6.
   - Tie-break: integer points +1, target 7, win by 2.
   - Match: best of 3 sets; optional presets for 1 set, 4-game set, match TB(7), super TB(10).
   - Mixed doubles: enforce same-sex receiver on deciding points [1].

2. **Rotation Social (+1 rally)**
   - Separate mode for Americano/Mexicano: +1 per rally, target score or timer, individual cumulative totals [8][9].
   - Pairing/rotation logic is **organizer config**, not FIP.

**Default preset for padelski.id:** use **Golden Point + best of 1 set** or **Golden Point + best of 3** until Indonesia club research confirms local norm; expose Star Point for users mirroring 2026 pro tours [5].

**Explicitly out of MVP:** FIP ranking calculation, point defence, equipment certification, conduct/time enforcement [3][4].

### Blockers

| Blocker | Impact | Mitigation |
| --- | --- | --- |
| No verified PBPI scoring rulebook [10] | Cannot claim Indonesia national default | Stakeholder interview or PBPI document request |
| FIP Golden Point “wins the match” typo [1] | Ambiguous spec text | Implement as game; note in docs |
| Deuce default varies by venue [5][6] | Wrong out-of-box preset for target users | Match-format picker at session start |
| Americano/Mexicano not FIP-standard [8][9] | Legal/compliance framing | Label as “Social format (club convention)” |
| Circuit rulebook PDFs not verified [2] | Tournament-grade compliance gap | Phase 1 fetch if sanctioned events targeted |

### Drill

Not triggered — core T0 claims ≥80 headline; gaps are coverage (Indonesia, circuit PDFs), not core scoring mechanics.

---

## source ledger

| Sn | URL | Title | Tier | Verified | Snippet (≤40w) | Notes |
| -- | --- | ----- | ---- | -------- | -------------- | ----- |
| S1 | https://www.padelfip.com/wp-content/uploads/2025/12/FIP_Rules-of-Padel.pdf | Rules of Padel (FIP 2026) | T0 | yes | 15-30-40-game; 6-game sets; 3 deuce options; tie-break numeric to 7. | Primary authority |
| S2 | https://www.padelfip.com/documents/ | Documents — Padel FIP | T0 | yes | Lists Rules of Padel, Premier Padel rulebooks, CUPRA FIP Tour rulebook. | Index |
| S3 | https://www.padelfip.com/ranking-system-points-breakdown/ | Ranking System & Points Breakdown | T0 | yes | 22 best results from Premier Padel and CUPRA FIP Tour form FIP Ranking 2026. | Pro ranking only |
| S4 | https://www.padelfip.com/wp-content/uploads/2025/01/FIP_Premier_Padel_announce_new_2025_FIP_ranking_points-and-tournament_criteria_FINAL_EN.pdf | FIP/Premier Padel 2025 ranking criteria | T0 | yes | FIP Platinum winner 300 pts; Gold 150; Finals 225. | Partial table garble |
| S5 | https://www.interpadelmedia.com/en/premier-padel-and-the-fip-present-the-2026-calendar-featuring-new-cities-and-a-new-scoring-system/ | Premier Padel 2026 Star Point announcement | T1 | yes | Star Point implemented 2026 on Premier Padel and CUPRA FIP Tour. | Circuit default |
| S6 | https://www.padel-magazine.co.uk/the-three-scoring-formats-recognized-by-the-International-Padel-Federation/ | Three FIP scoring formats (Padel Magazine) | T2 | yes | Organizers free to choose among FIP-validated formats. | Interpretive |
| S7 | https://padel.how/rules/official-fip-padel-rules/ | Official FIP rules commentary (padel.how) | T2 | snippet-only | Alternate scoring agreed in advance unless specified. | Not verbatim FIP |
| S8 | https://www.padelfast.com/formats/americano | Padel Americano format | T2 | yes | +1 per rally; targets 16/24/32; individual cumulative totals. | Non-FIP social |
| S9 | https://www.padelfast.com/formats/mexicano | Padel Mexicano format | T2 | yes | Same +1 rally scoring; leaderboard-based re-pairing. | Non-FIP social |
| S10 | https://www.pbpi.or.id/id | PBPI Indonesia | T2 | snippet-only | National federation; ranking mentioned; no rules PDF verified. | Indonesia gap |

Machine-readable companion: `source-ledger.yaml`

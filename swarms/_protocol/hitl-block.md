# HITL Block — Canonical Format

Every human-in-the-loop escalation in every swarm uses this exact block. Do not paraphrase. Do not add fields. The format is intentionally rigid: operators read these blocks under load, and consistency is what makes them fast to act on.

---

## The Block

```
HUMAN STEP REQUIRED
Action: [one-line description of the outcome the operator is producing]
Tool path: [exact navigation surface — prefix with tool name, e.g. "App: Settings → Integrations", "Drive: Shared folder → Project docs", "Manual: email to vendor"]
Steps:
  1. [exact imperative step]
  2. [exact imperative step]
  3. [exact imperative step — add or remove as needed]
Targets: [concrete names, IDs, or URLs the operator will act on — copy-paste ready]
Confirm back: [the string or signal the agent expects on completion — this is what unblocks the build]
```

---

## Field Rules

- **Action** — one line. Describe the outcome, not the steps. Not "click button X in the settings screen" — write "Enable feature Y for workspace Z."
- **Tool path** — the navigation surface the operator will use. Prefix with the system name (`App:`, `Drive:`, `Sheets:`, `Browser:`, `Manual:`, `CLI:`). Use exact UI labels or command names, not descriptions.
- **Steps** — numbered, imperative, no ambiguity. If a step contains a sub-decision, split it into two steps. The operator should not need to interpret.
- **Targets** — names, IDs, URLs. The operator must be able to copy-paste from this line with no additional lookup.
- **Confirm back** — what string, state, or signal the agent expects after the human completes the action. This is the unblock signal; without it the agent cannot know when to resume.

---

## When to Escalate

**Mandatory HITL** — escalate immediately, never attempt automation. Each swarm's `CLAUDE.md` declares its mandatory HITL list (actions the operator has pre-classified as requiring human approval). Common examples:
- Irreversible deletions or publishes with no rollback path
- Actions requiring two-factor or out-of-band credential entry
- Legal or financial sign-offs

**Conditional HITL** — escalate after two failed automation attempts on the same target:
1. First attempt: confirm the element, endpoint, or resource is correct.
2. Second attempt: perform the action.
3. If both fail: write the HITL block. No third attempt.

---

## After Writing the Block

1. Set the control-plane status for this build to `MANUAL STEP`.
2. Note the pending action in the Handoff column of the control-plane row.
3. **Continue any non-blocked work in parallel.** Do not sit idle. Identify work that does not depend on the pending human action and execute it.
4. Document in the per-build state file: what is deferred behind the HITL, and what continued in parallel.

---

## Example

```
HUMAN STEP REQUIRED
Action: Publish the draft landing page for Acme Launch v1 so the validator can run live-URL checks.
Tool path: App: Pages → Drafts → acme-launch-v1
Steps:
  1. Open the draft "acme-launch-v1" in the Pages editor.
  2. Click "Publish" in the top-right toolbar.
  3. Confirm the status badge changes from "Draft" to "Published."
Targets: Page slug "acme-launch-v1" (ID: page-0042)
Confirm back: "Published — URL is live at https://example.com/acme-launch-v1"
```

---

## Per-Swarm Extensions

Each swarm may declare additional HITL trigger conditions in its `CLAUDE.md`. Extensions add trigger scenarios — they never modify the block format. Any build tool or integration with known HITL triggers should document them in the swarm startup file, not inline in agent prompts.

---

## Anti-Patterns

- **Paraphrasing the block** — "You'll need to manually do X" is not a HITL block; use the exact format
- **Omitting "Confirm back"** — without it, the agent cannot know when to resume
- **Escalating before a first attempt** — conditional HITL fires on the second failure, not the first
- **Going idle after escalating** — there is almost always non-blocked work to continue
- **Combining multiple HITL steps into one block** — write separate blocks for each independent human action; the operator can act on them in any order

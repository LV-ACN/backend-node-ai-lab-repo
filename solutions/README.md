# Solutions — self-check and fallback only

Reference artifacts for every AI-generated file this lab asks you to build.
None of this is loaded by Cursor or required by the running app — it exists
only for you to compare against, or fall back to if you're short on time.

## How to use this folder

1. Build your own version first, following the lab steps. Don't open the
   matching file here before that.
2. Once yours is done, diff it against the matching reference:
   - `rules/lab-guardrails.mdc` — section 1
   - `specs/001-overbooking-allowance/spec.md` — section 2
   - `specs/001-overbooking-allowance/plan.md` — section 3
   - `specs/001-overbooking-allowance/tasks.md` — section 4
   - `skills/backend-test-generator/SKILL.md` — section 5
   - `agent/agent-scope.md` — section 7
3. Look for gaps, not exact wording. A missing constraint (a hard rule your
   version only hints at in prose) is the thing worth fixing — different
   phrasing is fine.
4. Iterate on your own file, then re-run whatever it drives (a Spec Kit
   command, the test Skill, the agent) and confirm the fix actually changes
   behavior.

## Fallback: the project rule

`rules/lab-guardrails.mdc` can be dropped straight into `.cursor/rules/` as a
working fallback, not just a comparison reference — same as the agent module
below. If you use it as a fallback rather than writing your own, still run
the refusal test ("add a small fix in inventory-service") so you've seen the
guardrail actually work.

## Fallback code: the agent module

`agent/mcpTools.js` (Section 7, MCP) and `agent/a2aRouter.js` (Extended
activity E4) are complete, tested reference implementations of the
Reservation Domain Agent's two interfaces — not just planning docs. If you're
genuinely out of time, drop either file into `reservation-service/src/agent/`
and mount it from `app.js` to rejoin the lab at that point, rather than
skipping the exercise entirely. Each file's own header comment has the exact
dependency and wiring steps it needs.

The overbooking feature's own application code (the thing sections 2–6 build)
intentionally has **no** reference implementation here — writing a precise
prompt for it is the skill this lab practises, and handing out the business
logic itself would defeat that. `plan.md`'s "Core logic" section gives you the
shape to compare your own implementation against, not a diff to copy.

# From lab to production: agentic layer and governance architecture

Not part of the build. This is a plain-text version of the Lab Guide's
section P, read after the core lab — it shows where the Reservation Domain
Agent you built in section 7 sits in an enterprise agentic architecture, and
the governance it needs before production.

## 1. The agentic layer: where your agent fits

In the lab, Cursor talked directly to your local MCP endpoint, and (in the
extended activity) a second script talked to the same agent over A2A, with no
gateway between either caller and the service. In production, several
consumers reach many domain agents through a governed gateway, and every
business rule still lives in the domain services.

```
CONSUMERS          Guest app/chat · Contact-centre copilot · Revenue Mgmt
                    agent · Developer IDE (Cursor, the lab)
                            |
ORCHESTRATION       Orchestrator/planner agent -- routes intent, plans
                    multi-step work, agent-to-agent (A2A) delegation with
                    task state
                            |
DOMAIN AGENTS       Reservation agent (built in section 7) · Loyalty agent ·
                    Payment agent · Property ops agent
                            |
AGENT/MCP GATEWAY   The policy enforcement point: identity (OAuth 2.1),
                    tool registry & allow-lists, read vs write scopes, rate
                    limits, human-approval hooks for state changes,
                    input/output guardrails, central audit
                            |
DOMAIN SERVICES     reservation-service (overbooking rules, the lab) ·
                    inventory-service · loyalty/payments/CRM
                            |
SYSTEMS OF RECORD   Databases, ledgers, event streams -- own consistency
                    (the E1 lesson: the guard belongs with the system of
                    record)
```

Cross-cutting controls, applied at every layer: identity & secrets
(per-agent identity, short-lived scoped tokens), guardrails (prompt-injection
defence, PII redaction, output checks), observability (traces from agent to
tool to service), evaluation (offline eval sets, red-team, online quality
monitoring), human oversight (approval for state changes, escalation, kill
switch), audit & lineage (who, what, why, evidence).

## 2. What changes from the lab to production

| Concern | In this lab | In production |
|---|---|---|
| Transport and reach | Local MCP + A2A endpoints, unauthenticated, reachable only from your own machine | Remote MCP and A2A behind the gateway; many consumers, many domain agents |
| Identity | None (local process) | Per-agent and per-user identity; OAuth 2.1 as defined in the MCP authorization specification; scoped, short-lived tokens |
| Tool access | Three tools, all visible | Registry and allow-lists per consumer; read and write scopes separated; write tools need approval |
| Business rules | In reservation-service (enforced in section 7) | Same principle, now policed by the gateway and project rules across every team |
| Consistency | In-process guard, single instance | Guard moved to the system of record (your E1 ADR) |
| Retries | Not handled (E2 adds keys) | Idempotency keys end to end, including from agents |
| Evidence | Audit log lines, tests, experiment notes, the E3 validation table | Traces, metrics, eval reports and audit records retained per policy |
| Safety testing | One injection probe + one A2A delegation probe (E3/E4) | Continuous red-teaming and regression eval suites in CI |

## 3. The governance framework: gates across the lifecycle

**Govern:** accountable owner, risk appetite, policies, roles (product,
engineering, security, risk, legal) — aligned to the NIST AI RMF functions
(Govern, Map, Measure, Manage) and an AI management system such as ISO/IEC
42001.

1. **Design** — use-case & risk classification, agent scope & autonomy
   level, data & privacy assessment.
2. **Build** — spec-driven development, project rules, Skills, reviews,
   dependency & secret scanning.
3. **Evaluate** — functional tests, agent evals (accuracy, refusal),
   red-team & injection tests.
4. **Approve & deploy** — release gate, gateway registry, scoped
   credentials, staged rollout.
5. **Operate** — monitoring & drift alerts, incident runbooks, access
   reviews.
6. **Retire** — deregister tools, revoke credentials, retain/delete data per
   policy.

A feedback loop carries incidents, eval failures and new risks back into
Design. An evidence trail (spec & ADRs, review records, test and eval
reports, approvals, audit logs and traces) spans every gate — what an auditor
or regulator asks to see.

## 4. Your lab evidence mapped to the governance gates

| Gate | What you already produced in this lab | What production adds |
|---|---|---|
| Design | `spec.md`, `plan.md`, agent scope and out-of-scope list (section 7) | Risk and autonomy classification, privacy assessment, named accountable owner |
| Build | Project rules, the test Skill, review gates, small reviewed commits | Branch protection, CI policy checks, dependency and secret scanning, SBOM |
| Evaluate | Three test layers, mutation check, Experiments A-D, refusal and injection probes, the E3 validation table | Agent evaluation suites with pass thresholds, scheduled red-team exercises |
| Approve & deploy | Local, unauthenticated MCP and A2A endpoints only, by design | Release approval, gateway registration, scoped credentials, staged rollout and rollback plan |
| Operate | Audit log lines with the numbers behind each decision | Traces and metrics, alerting on refusal or error spikes, incident runbooks, periodic access review |
| Retire | Not covered | Tool deregistration, credential revocation, data retention or deletion |

## 5. Think it through

- If your Reservation agent were registered in the gateway tomorrow with no
  other changes, which two controls in the diagram above would it fail
  first?
- Which of your section 1 project rules would become a gateway or CI policy
  in production, and who would own it?
- The orchestrator could call the Reservation and Payment agents in one
  plan. Where must the human-approval step sit so that a payment is never
  taken for a booking that was refused?
- Which single piece of lab evidence would an auditor find most useful, and
  what is missing from it today?

Governance doesn't replace the engineering controls you practised. The
gateway can block a tool, but only the domain service can keep a booking
within capacity. Keep rules in the service, and use governance to prove they
are there and stay there.

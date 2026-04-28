# Zirva — Ministry of Science and Education Submission
## Response to Letter № VM26005443 (24.04.2026)

**Submitted by:** Kaan Guluzada, Founder & CEO, Zirva  
**Contact:** hello@tryzirva.com · +994 50 241 14 42 · +994 90 110 66 00  
**Platform:** [tryzirva.com](https://tryzirva.com)  
**Date prepared:** April 2026

---

## Folder structure

```
ministry-submission/
├── en/                                  English versions
│   ├── 01-technical-documentation.md
│   ├── 02-security-architecture.md
│   ├── 03-data-protection.md
│   └── 04-pilot-proposal.md
├── az/                                  Azerbaijani versions (formal ministry register)
│   ├── 01-texniki-senedlesdirme.md
│   ├── 02-tehlukesizlik-arxitekturasi.md
│   ├── 03-melumatlarin-qorunmasi.md
│   └── 04-pilot-teklifi.md
└── README.md                            This file
```

---

## Document summaries

| # | Document | English | Azerbaijani | Key content |
|---|----------|---------|-------------|-------------|
| 1 | Technical Documentation | `en/01-technical-documentation.md` | `az/01-texniki-senedlesdirme.md` | System architecture, tech stack, DB schema, role model, AI tutor, dual-curriculum support, deployment topology, scalability |
| 2 | Security Architecture | `en/02-security-architecture.md` | `az/02-tehlukesizlik-arxitekturasi.md` | Auth, RBAC, RLS policies, session management, encryption, audit logging, threat model, incident response |
| 3 | Data Protection | `en/03-data-protection.md` | `az/03-melumatlarin-qorunmasi.md` | AZ Law №461-IQ compliance, data residency disclosure (Seoul → EU migration plan), parental consent, third-party data handling, child AI safety |
| 4 | Pilot Proposal | `en/04-pilot-proposal.md` | `az/04-pilot-teklifi.md` | 5–10 school pilot across Bakı/regional/rural, 4-month plan, success metrics, risk register, scale-up roadmap |

---

## Recommended submission order

Submit in this sequence — each document builds on the previous one:

1. **Document 3 first (Data Protection)** — The Ministry flagged data residency as a concern. Lead with this to show you have read their concerns seriously and have a remediation plan. Do not bury this.

2. **Document 1 (Technical Documentation)** — Establishes what the platform actually is. Ministry IT evaluators will read this carefully.

3. **Document 2 (Security Architecture)** — Directly addresses their ability to trust the platform with student data. References Document 1.

4. **Document 4 (Pilot Proposal)** — The "ask" — what you need from them. Place this last so it comes after you've established trust through the first three.

---

## Before you submit — action items

The following `[FILL IN: ...]` placeholders appear in the documents and must be completed before submission:

| Placeholder | Where | What to provide |
|---|---|---|
| Legal entity name | All docs | Register a company (Zirva MMC) before submission if possible — submitting as an individual is unusual for ministry contracts |
| Supabase EU migration date | Doc 3 | Commit to a specific date (suggest: 30 June 2026) |
| Azerbaijan-local hosting date | Doc 3 | Suggest "subject to Ministry guidance on approved providers, Q4 2026" |
| MoE systems to integrate | Doc 4 | Fill in known systems: e-təhsil, TQDK, etc. |
| Pilot school names | Doc 4 | Leave blank until Ministry assigns — or suggest specific schools if you have contacts |
| Indicative pricing | Doc 4 | Optional — you can leave this for negotiation post-pilot |
| Pen test date | Doc 2 | Commit to a date (suggest: before Month 2 of pilot) |

---

## Critical issue to address before full adoption

**Data residency — Supabase on AWS ap-northeast-2 (Seoul, South Korea)**

This is the single most important compliance gap. Azerbaijan's Law on Personal Data (№461-IQ) requires that personal data on Azerbaijani citizens be stored within Azerbaijan or in a country with adequate protection. South Korea does not qualify.

Document 3 discloses this honestly and presents a migration plan. The Ministry will respect transparency more than discovering it later. The migration steps are:
1. Migrate Supabase project to `eu-west-1` (Ireland) or `eu-central-1` (Frankfurt) — possible within 1–2 weeks
2. Evaluate Azerbaijani-local hosting providers during the pilot phase
3. Commit to AZ-local hosting as a condition of full national adoption

**Recommended action:** Complete the Supabase region migration to EU *before* submitting these documents, so Document 3 can report it as a resolved rather than pending issue.

---

*All documents are formatted in Markdown and can be converted to PDF or Word for formal submission.*

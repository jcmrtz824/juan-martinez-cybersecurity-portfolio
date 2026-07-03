# Master Cybersecurity Portfolio Style Guide

## Purpose

This style guide defines the required format for every future cybersecurity portfolio project. Each project must present work as a professional portfolio demonstration or case study unless there is documented authorization to describe it otherwise.

## Required Disclaimer Wording

Use this wording in every project README and report:

> This project is a Portfolio Demonstration. It is a synthetic case study created for a cybersecurity consulting portfolio. It does not represent paid client work, employment history, or testing performed for a real organization unless explicitly stated.

Use this wording when no live systems were tested:

> No live third-party systems were tested. No real client names, production IP addresses, credentials, proprietary data, or sensitive information are included.

## Portfolio Project Wording

Use precise, honest language:

- Use: "portfolio demonstration"
- Use: "case study"
- Use: "synthetic lab environment"
- Use: "example finding"
- Use: "modeled scenario"
- Do not use: "client engagement" unless it was real and approved for public use
- Do not use: "employment project" unless it was real and approved for public use
- Do not imply production access, paid work, or professional authorization without proof

## Heading Hierarchy

Use a consistent Markdown hierarchy:

- `#` Project or report title
- `##` Major report sections
- `###` Findings, procedures, or major subsections
- `####` Evidence, impact, remediation, validation, or notes

Do not skip heading levels. Keep headings short and descriptive.

## Fonts for PDF Generation

Recommended PDF fonts:

- Body text: Arial, Helvetica, or Calibri
- Headings: Arial Bold, Helvetica Bold, or Calibri Bold
- Monospace text: Consolas, Menlo, or Courier New

Recommended PDF sizing:

- Title: 22-26 pt
- H1: 20-22 pt
- H2: 16-18 pt
- H3: 13-15 pt
- Body: 10.5-11.5 pt
- Table text: 9-10 pt
- Footer: 8-9 pt

## Table Styles

Use clean Markdown tables with clear column names.

Required table standards:

- Use sentence case for column headings
- Keep cells short and scannable
- Align numeric fields consistently
- Use one finding per row in summary tables
- Avoid oversized tables in executive summaries

Preferred risk summary format:

| ID | Finding | Severity | CVSS v3.1 | Priority |
| --- | --- | --- | --- | --- |
| F-01 | Example finding title | High | 7.5 | 1 |

## Figure Numbering

Use figures for screenshots, evidence images, and report visuals.

Format:

- `Figure 1: Short descriptive title`
- `Figure 2: Short descriptive title`

Rules:

- Number figures in the order they appear
- Reference figures in the report text before or immediately after they appear
- Do not include screenshots that reveal real secrets, client data, names, private IP ranges tied to a real organization, usernames, tokens, or production details

## Diagram Numbering

Use diagrams for Mermaid files, network flows, assessment workflows, and process visuals.

Format:

- `Diagram 1: Assessment workflow`
- `Diagram 2: Risk prioritization process`

Rules:

- Store diagram files in a `diagrams/` folder
- Use `.mmd` for Mermaid source files
- Use lowercase filenames with underscores
- Keep diagrams simple enough to read in GitHub and PDF exports

## Risk Rating Colors

Use these colors for PDF, HTML, or styled output:

| Severity | Color | Hex |
| --- | --- | --- |
| Critical | Dark red | `#8B0000` |
| High | Red | `#D92D20` |
| Medium | Orange | `#F79009` |
| Low | Blue | `#2E90FA` |
| Informational | Gray | `#667085` |

Markdown text should still include the written severity because colors may not render in every viewer.

## CVSS Formatting

Use CVSS v3.1 unless a project specifically requires another version.

Required format:

- `CVSS v3.1: 7.5`
- `Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`

Rules:

- Scores must match the described access, complexity, privileges, user interaction, scope, and impact
- Do not inflate scores to make a project look more severe
- Explain business priority separately from CVSS severity when needed

## MITRE ATT&CK Formatting

Use MITRE ATT&CK mappings only when they are relevant.

Required format:

| Technique | Name | Reason |
| --- | --- | --- |
| T1210 | Exploitation of Remote Services | The exposed service could support remote exploitation attempts. |

Rules:

- Use technique IDs and official technique names
- Explain why the mapping applies
- Do not force a MITRE mapping when the finding is only a hardening issue
- State when no precise direct mapping exists

## NIST References

Use NIST references to support process, controls, and risk language.

Preferred references:

- NIST SP 800-30 for risk assessment concepts
- NIST SP 800-40 for patch and vulnerability management
- NIST SP 800-53 for security controls
- NIST SP 800-61 for incident response
- NIST SP 800-115 for technical security testing

Reference format:

- `NIST SP 800-115: Technical Guide to Information Security Testing and Assessment`

## Citation Style

Use a simple professional citation style:

- In Markdown: cite sources in a `References` section
- In reports: mention the source by name when it supports a scoring, control, or methodology decision
- For web references: include the organization, document title, and access date if needed

Example:

- `FIRST: Common Vulnerability Scoring System v3.1 Specification`

Do not cite private, sensitive, or unauthorized materials.

## Executive Summary Format

Every report executive summary must include:

1. Assessment purpose
2. Scope summary
3. Highest-risk issues
4. Business impact
5. Recommended next steps

Keep the executive summary between 2 and 5 short paragraphs. Avoid technical overload.

## Report Header

Use this header block near the top of each report:

| Field | Value |
| --- | --- |
| Project | `[Project Name]` |
| Report type | Portfolio Demonstration |
| Version | `v1.0` |
| Date | `YYYY-MM-DD` |
| Author | `[Your Name]` |

## Report Footer

Use this footer wording in PDF exports when possible:

`Portfolio Demonstration | No real client data or credentials included | Version [x.x] | Page [n]`

If the PDF generator does not support footers, include the wording in the report disclaimer section.

## Version Numbering

Use semantic-style document versioning:

- `v0.1` Draft created
- `v0.2` Content revised
- `v0.9` Final review candidate
- `v1.0` Published portfolio version
- `v1.1` Minor correction or formatting update
- `v2.0` Major rewrite or new project scope

## Revision History Format

Use this table in reports and major templates:

| Version | Date | Changes |
| --- | --- | --- |
| v1.0 | YYYY-MM-DD | Initial published portfolio version |

## Required Project Files

Each portfolio project must include:

- `README.md`
- `REPORT.md`
- `REPORT.pdf`
- `REFERENCES.md`
- `CHECKLIST.md`
- `PROJECT_SUMMARY.md`
- `diagrams/` folder with Mermaid files when diagrams are used

## Final Quality Standard

Before publishing, every project must confirm:

- Clear Portfolio Demonstration disclaimer
- No fake client claims
- No fake employment claims
- No sensitive information
- No credentials, API keys, passwords, tokens, or real secrets
- Realistic findings
- Practical remediation steps
- Clean Markdown formatting
- Professional tone suitable for GitHub and Upwork


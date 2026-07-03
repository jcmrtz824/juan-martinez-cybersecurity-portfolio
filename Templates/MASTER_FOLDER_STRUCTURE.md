# Master Folder Structure

## Template Folder

```text
Cybersecurity Portfolio/
└── Templates/
    ├── MASTER_STYLE_GUIDE.md
    ├── MASTER_REPORT_TEMPLATE.md
    ├── MASTER_README_TEMPLATE.md
    ├── MASTER_REFERENCES_TEMPLATE.md
    ├── MASTER_PROJECT_SUMMARY_TEMPLATE.md
    ├── MASTER_CHECKLIST_TEMPLATE.md
    └── MASTER_FOLDER_STRUCTURE.md
```

## Required Project Layout

Every future portfolio project must follow this structure:

```text
Cybersecurity Portfolio/
└── Project XX - [Project Name]/
    ├── README.md
    ├── REPORT.md
    ├── REPORT.pdf
    ├── REFERENCES.md
    ├── CHECKLIST.md
    ├── PROJECT_SUMMARY.md
    ├── diagrams/
    │   ├── assessment_workflow.mmd
    │   └── risk_or_process_diagram.mmd
    └── evidence/
        └── sanitized_evidence_notes.md
```

## Example Project Layout

```text
Cybersecurity Portfolio/
└── Project 02 - Security Operations Case Study/
    ├── README.md
    ├── REPORT.md
    ├── REPORT.pdf
    ├── REFERENCES.md
    ├── CHECKLIST.md
    ├── PROJECT_SUMMARY.md
    ├── diagrams/
    │   ├── alert_triage_workflow.mmd
    │   └── escalation_decision_tree.mmd
    └── evidence/
        └── sanitized_alert_review_notes.md
```

## Naming Rules

- Project folders must use: `Project XX - Project Name`
- Markdown files must use uppercase descriptive names where already standardized
- Mermaid diagram files must use lowercase names with underscores
- Evidence files must be sanitized before publication
- PDF reports must be generated from the final `REPORT.md`

## Required Publication Flow

1. Copy the master templates into the new project folder.
2. Replace bracketed fields with project-specific content.
3. Write findings and remediation steps.
4. Add references and diagrams.
5. Complete the checklist.
6. Scan for secrets and unsupported claims.
7. Generate `REPORT.pdf`.
8. Update the portfolio index.


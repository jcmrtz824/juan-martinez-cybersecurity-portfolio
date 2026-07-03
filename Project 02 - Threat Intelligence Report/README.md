# Project 02 - Threat Intelligence Report

## Portfolio Demonstration

This project is a Portfolio Demonstration based on public information. It is a synthetic case study created for a cybersecurity consulting portfolio. It does not represent paid client work, employment history, or testing performed for a real organization unless explicitly stated.

No live third-party systems were tested. No real client names, production IP addresses, credentials, proprietary data, or sensitive information are included.

## Objective

This project demonstrates a threat intelligence report for one real vulnerability: CVE-2025-53770, a critical Microsoft SharePoint Server remote code execution vulnerability. The goal is to show public-source research, source validation, executive risk communication, CVSS analysis, MITRE ATT&CK mapping, detection opportunities, and defensive recommendations.

## Scope

- One real CVE published within the last 12 months as of 2026-07-02
- Public vendor, government, vulnerability database, and security research sources
- On-premises Microsoft SharePoint Server risk analysis
- No exploit reproduction
- No live scanning
- No invented affected products, exploitation details, or IOCs

## Deliverables

- [REPORT.md](./REPORT.md)
- [REPORT.pdf](./REPORT.pdf)
- [REFERENCES.md](./REFERENCES.md)
- [CHECKLIST.md](./CHECKLIST.md)
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- [Attack flow diagram](./diagrams/attack_flow.mmd)
- [Kill chain diagram](./diagrams/kill_chain.mmd)
- [MITRE ATT&CK mapping diagram](./diagrams/mitre_attack_mapping.mmd)

## CVE Selected

**CVE-2025-53770** was selected because it meets the project requirements:

- Enterprise impact involving on-premises Microsoft SharePoint Server
- CVSS v3.1 score of 9.8 Critical
- Published on 2025-07-19 according to NVD
- Vendor-confirmed exploitation in the wild
- Public documentation from Microsoft, NVD, CISA, government advisories, and security researchers
- Significant vendor and security community attention

## Skills Demonstrated

- Threat intelligence research
- Public source validation
- CVSS v3.1 analysis
- MITRE ATT&CK mapping
- Detection planning
- IOC handling
- Patch and remediation guidance
- Executive risk communication

## Tools and References Used

- NIST NVD
- Microsoft Security Response Center
- Microsoft Security Blog
- CISA Known Exploited Vulnerabilities catalog
- Canadian Centre for Cyber Security advisory
- Palo Alto Networks Unit 42 research
- MITRE ATT&CK Enterprise Matrix
- FIRST CVSS v3.1 Specification
- NIST patch management guidance

## Project Structure

```text
Project 02 - Threat Intelligence Report/
├── README.md
├── REPORT.md
├── REPORT.pdf
├── REFERENCES.md
├── CHECKLIST.md
├── PROJECT_SUMMARY.md
└── diagrams/
    ├── attack_flow.mmd
    ├── kill_chain.mmd
    └── mitre_attack_mapping.mmd
```

## Project Status

Complete portfolio case study.

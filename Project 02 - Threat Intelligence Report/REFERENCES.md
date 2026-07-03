# References

This project is a Portfolio Demonstration based on public information. References are included to show the standards, frameworks, advisories, and public guidance that support the threat intelligence report.

## Standards and Guidance

- NIST SP 800-30: Guide for Conducting Risk Assessments
- NIST SP 800-40 Rev. 4: Guide to Enterprise Patch Management Planning
- NIST SP 800-53: Security and Privacy Controls for Information Systems and Organizations
- NIST SP 800-61: Computer Security Incident Handling Guide
- NIST SP 800-115: Technical Guide to Information Security Testing and Assessment
- FIRST: Common Vulnerability Scoring System v3.1 Specification
- MITRE ATT&CK Enterprise Matrix

## Project-Specific References

| Source | URL | Accessed |
| --- | --- | --- |
| NIST NVD, CVE-2025-53770 Detail | https://nvd.nist.gov/vuln/detail/CVE-2025-53770 | 2026-07-02 |
| Microsoft MSRC, Security Update Guide: CVE-2025-53770 | https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-53770 | 2026-07-02 |
| Microsoft MSRC Blog, Customer guidance for SharePoint vulnerability CVE-2025-53770 | https://www.microsoft.com/en-us/msrc/blog/2025/07/customer-guidance-for-sharepoint-vulnerability-cve-2025-53770 | 2026-07-02 |
| Microsoft Security Blog, Disrupting active exploitation of on-premises SharePoint vulnerabilities | https://www.microsoft.com/en-us/security/blog/2025/07/22/disrupting-active-exploitation-of-on-premises-sharepoint-vulnerabilities/ | 2026-07-02 |
| CISA, CVE-2025-53770 added to Known Exploited Vulnerabilities catalog | https://www.cisa.gov/news-events/alerts/2025/07/20/cisa-adds-one-known-exploited-vulnerability-cve-2025-53770-toolshell-catalog | 2026-07-02 |
| CISA, Update: Microsoft releases guidance on exploitation of SharePoint vulnerabilities | https://www.cisa.gov/news-events/alerts/2025/07/20/update-microsoft-releases-guidance-exploitation-sharepoint-vulnerabilities | 2026-07-02 |
| Canadian Centre for Cyber Security, AL25-009 SharePoint Server vulnerability alert | https://www.cyber.gc.ca/en/alerts-advisories/al25-009-vulnerability-impacting-microsoft-sharepoint-server-cve-2025-53770 | 2026-07-02 |
| Palo Alto Networks Unit 42, Active exploitation of Microsoft SharePoint vulnerabilities | https://unit42.paloaltonetworks.com/microsoft-sharepoint-cve-2025-49704-cve-2025-49706-cve-2025-53770/ | 2026-07-02 |

## MITRE ATT&CK Techniques Referenced

- T1190: Exploit Public-Facing Application
- T1059.001: Command and Scripting Interpreter: PowerShell
- T1047: Windows Management Instrumentation
- T1505.003: Server Software Component: Web Shell
- T1003.001: OS Credential Dumping: LSASS Memory
- T1570: Lateral Tool Transfer
- T1486: Data Encrypted for Impact

## Notes

- CVSS scores support prioritization but do not replace business context.
- MITRE ATT&CK mappings describe attacker behavior reported in public sources. They do not mean the behavior was observed in every environment.
- IOCs in this project are only included where publicly documented.
- No real client data, production evidence, secrets, or proprietary information are included.

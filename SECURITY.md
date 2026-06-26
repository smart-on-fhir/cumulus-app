# Security Policy

## Supported Versions

We provide security fixes for the latest released version of cumulus-app.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To report a vulnerability, please use [GitHub's private vulnerability reporting](https://github.com/smart-on-fhir/cumulus-app/security/advisories/new). This allows you to submit a report directly to the maintainers without public disclosure.

If you are unable to use GitHub's private reporting, you may contact the maintainers via the [SMART on FHIR organization page](https://github.com/smart-on-fhir).

### What to Include

Please include as much of the following information as possible to help us understand and reproduce the issue:

- Type of vulnerability (e.g. SQL injection, XSS, authentication bypass)
- Full path of the source file(s) related to the issue
- Steps to reproduce the vulnerability
- Proof-of-concept or exploit code (if available)
- Impact assessment — what an attacker could achieve by exploiting it

### What Constitutes a Vulnerability

In scope:
- Authentication or authorization bypasses
- SQL injection, XSS, CSRF, or other injection attacks
- Sensitive data exposure (PHI, credentials, tokens)
- Privilege escalation
- Insecure direct object references

Out of scope:
- Vulnerabilities in dependencies that have not been shown to affect this application
- Issues requiring physical access to a user's device
- Social engineering or phishing attacks

## Coordinated Disclosure

We follow [coordinated vulnerability disclosure](https://github.com/ossf/oss-vulnerability-guide/blob/main/maintainer-guide.md). Once a report is received:

1. We will acknowledge receipt within **5 business days**.
2. We will investigate and aim to provide an initial assessment within **10 business days**.
3. We will work with you to understand and validate the issue.
4. We will release a fix and publicly disclose the vulnerability after a patch is available, typically within **90 days** of the initial report.

We ask that you give us a reasonable amount of time to address the issue before any public disclosure.

## Recognition

We appreciate responsible disclosure and are happy to acknowledge reporters in release notes, unless you prefer to remain anonymous.

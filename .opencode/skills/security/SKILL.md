---
name: security
description: Use when handling authentication, authorization, secrets, user data, or when reviewing code for security vulnerabilities.
---

# Skill: Security

This skill enforces security best practices for both mobile and backend code.

## Rules
1. **Never Hardcode Secrets**: API keys, tokens, database URLs, or any form of credentials must never be hardcoded. Use `.env` files (gitignored), environment variables, or platform keychains.
2. **Use Secure Storage for Tokens**: On mobile, use `expo-secure-store` (iOS Keychain / Android EncryptedSharedPreferences) for auth tokens. Never store tokens in plain `AsyncStorage`.
3. **TLS-Only for Network Calls**: All HTTP communication must use HTTPS. Certificates should be validated, not bypassed.
4. **Sanitize User Inputs**: Always validate and sanitize user-provided data on the backend to prevent SQL injection, NoSQL injection, and XSS attacks.
5. **OWASP Top 10 Awareness**: Be aware of the OWASP Top 10 (broken authentication, injection, XSS, insecure deserialization, etc.) when designing or reviewing features.

## Workflow
1. **Identify Security Boundaries**: Auth flows, payment data, user PII, and external data ingestion points.
2. **Implement Secure Patterns**: Apply proper password hashing (bcrypt/argon2), JWT/refresh token rotation, and rate limiting.
3. **Review Dependencies**: Scan for known CVEs using `npm audit` or `dart pub outdated`.
4. **Penetration Checklist**: Test at a minimum for insecure direct object references (IDOR) and privilege escalation.

## Checklists
- [ ] No secrets, tokens, or credentials visible in code or version control.
- [ ] All network calls enforce HTTPS with certificate validation.
- [ ] Auth tokens are stored in OS-level secure storage.
- [ ] Input validation exists on all public API endpoints.
- [ ] Password hashing uses a proper slow hash (bcrypt/argon2).
- [ ] CORS configuration is restrictive and production-protected.

## Common Mistakes
- **Storing Tokens in AsyncStorage**: Plain text storage in AsyncStorage is insecure and can be accessed by other apps/malware on rooted devices.
- **Trusting Client-Side Auth**: Relying solely on client-side checks for authorization rather than verifying on the backend.
- **Insufficient Rate Limiting**: Exposing public endpoints without rate limiting, enabling brute-force attacks.

## Validation Steps
1. Run `npm audit` or equivalent to scan dependency CVEs.
2. Review `.env` files are correctly listed in `.gitignore`.
3. Ensure secure storage APIs are used for all token management.

# Node.js & Express Technology Pack Credits

This technology pack was generated to integrate seamlessly with the OpenCode Engineering Framework.

## Based On
The guidelines, rules, and workflows in this pack are derived from:
- Official [Node.js Documentation](https://nodejs.org/en/docs/)
- Official [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- Node.js Best Practices repository (Goldbergyoni/nodebestpractices)
- OWASP Top 10 API Security Risks
- Modern production standards from the backend TypeScript community (2024+)

## Key Architectures Referenced
- **Layered Architecture:** Strict separation between Controllers (HTTP), Services (Business Logic), and Repositories (Database).
- **Validation:** Schema-driven validation and typing via Zod.
- **Error Handling:** Centralized async wrappers and global error middleware.
- **Database:** Prisma ORM for end-to-end type safety, or standard Repository patterns.
- **Security:** Helmet, Rate Limiting, JWT stateless authentication, and Bcrypt hashing.
- **Testing:** Jest for unit tests (isolated) and Supertest for integration APIs.

## Purpose
Designed by the OpenCode AI Agent system to provide a unified, enforceable, and modern knowledge base for building secure and scalable Node.js/Express backend APIs, avoiding outdated patterns (like CommonJS, callback hell, and fat routes).

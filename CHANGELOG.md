# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-01

### Added

- `SipagoClient` with automatic OAuth token management
- `orders.create()` — create payment intents (checkout links)
- `orders.get()` — query order/payment status by UUID
- Advanced order options: shipping, redirect URLs, webhooks, `expireLimitMinutes`
- Webhook types and `parseWebhookPayload()` helper
- `toMinorUnits()` / `fromMinorUnits()` money helpers
- Typed error hierarchy: `SipagoError`, `SipagoApiError`, `SipagoAuthError`, `SipagoValidationError`
- Dual CJS + ESM builds with full TypeScript declarations
- Zero runtime dependencies (Node.js 18+)

[1.0.0]: https://github.com/your-org/sipago-sdk/releases/tag/v1.0.0

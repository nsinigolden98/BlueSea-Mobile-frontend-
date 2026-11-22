# MrG Links — BlueSea Mobile frontend module

## Integration

- Feature directory: `src/screens/mrg-links/`
- Main entry: `src/screens/mrg-links/index.ts`
- App route: `/mrg-links/*`
- Existing authenticated route is registered in `src/App.tsx`.
- The main BlueSea sidebar entry is registered in `src/data/index.ts`.
- Shared identity comes from the existing `AuthContext`.
- Vendor verification reads the existing `ENDPOINTS.vendor_status` endpoint and follows the existing `{ vendor: { is_verified, verification_status } }` response shape used elsewhere in the app.

## Frontend functionality currently implemented

- Product-specific responsive layout and navigation.
- Overview dashboard and account-scoped browser persistence.
- Link creation, random codes, custom alias validation, destination editing, pause/resume, delete, search, folder labels/filters, CSV export and UTM parameters.
- Expiry and password settings captured on links.
- QR generation with colour selection, uploaded centre logo, PNG/SVG export and saved QR previews.
- Campaign creation, filtering, link assignment and removal.
- Landing-page drafts, preview, copy and publish-state control.
- Device/country/city routing-rule editor.
- A/B destination testing is reserved as a Coming Soon feature.
- Security preferences and locally recorded abuse reports.
- One-off link-credit package presentation and wallet hand-off.
- NGN/USD/EUR/GBP display currency preference with reference-rate refresh.
- Coming Soon pages for domain/DNS marketplace, Developer API, team collaboration, WhatsApp smart links, AI assistant and A/B destination testing.

## Important production boundary

This module is a frontend implementation and interactive preview. User-created MrG data is currently stored in account-scoped `localStorage`; it is not yet stored on the server. The app does not claim that MrG.com redirects, analytics, visitor password/expiry enforcement, malware scanning, wallet debit or credit-package fulfilment are live.

The supplied repository did not contain MrG backend endpoints or a payment contract. No guessed MrG API routes have been added. Before production, the backend team must provide:

1. Short-link CRUD and redirect endpoints on the purchased `MrG.com` domain.
2. Click/scan event collection and analytics aggregation.
3. Server-side enforcement for expiry, passwords, routing and abuse controls.
4. Package purchase, wallet debit, idempotency and credit-entitlement endpoints.
5. Authoritative pricing and exchange-rate configuration.
6. A confirmed Mono product/use case and server-side integration contract, if Mono is required.
7. Server-side vendor alias entitlement rules. The three complimentary aliases currently shown are a frontend preview of the proposed vendor benefit and must be enforced by the backend.

The public exchange-rate lookup is for display only. It must not determine the amount debited from the BlueSea wallet. Wallet settlement remains NGN unless the backend/payment provider explicitly supports another settlement currency.

## Pricing proposal in this preview

One-off, non-monthly bundles are configured in `services/pricing.ts`. They are proposed launch prices for discussion, not final billing settings. A link credit is consumed when a new link is created; custom aliases have a separate allowance. The package checkout deliberately hands the user to the existing BlueSea wallet without claiming to debit funds or grant credits until the backend purchase endpoint exists.

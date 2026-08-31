# NewPort Portal — Codex handover

Use this file to continue the project on another laptop.

## Start here

- Repository: `https://github.com/pablo-alfonso/NP-Portal.git`
- Live demo: `https://pablo-alfonso.github.io/NP-Portal/`
- This is an interactive **front-end demo**. It has no real NILS connection, authentication service or production database yet.

On the other laptop, clone the repository, open the `newport-portal` folder in Codex, and start a new chat with this prompt:

> Read `CODEX_HANDOVER.md`. Continue developing the NewPort Customer Portal demo. Preserve the existing calm NewPort design and do not introduce real credentials or a direct browser-to-NILS API connection. Ask me what to work on next.

## Product decisions made so far

- One NewPort customer portal. Version 1 contains only **Bill of Lading**; later modules are Quote Requests, Quotes, Bookings and Shipments.
- English interface. Desktop first; tablet/mobile supported.
- The BL overview is part of the new portal and shows: BL number, status, customer reference, product, place of receipt, port of loading, port of discharge, place of delivery and created date. Newest BL is shown first.
- A BL becomes visible only from NILS status **Awaiting Approval**. Existing historic BLs do not need migration.
- The portal will maintain its own overview database. NILS remains the source for detailed BL data and PDF.
- NILS needs only the new BL field **PortalAccessParty** for version 1. It contains relation IDs that may access a BL.
- In the portal, users belong to organisations (customers or forwarders). A forwarder may access multiple customer BLs when its relation ID is included in `PortalAccessParty`.
- A direct link sent by NILS opens login first, then the specific BL draft. Normal login opens the portal/BL overview.
- The new portal must use a server-side backend for NILS calls. Never expose NILS secrets in the customer browser.

## BL detail page — accepted UX

- Fixed left navigation stays visible on overview, Settings and BL detail pages; it can be collapsed.
- Detail page has the NILS PDF on the left and the correction editor on the right.
- Correction steps: Parties, Routing, Cargo details, Container & weights, References.
- Changed fields remain visible during the session, including when switching steps. A user can undo a change before submitting.
- The review screen shows each requested change with its old and new value.
- Approval is available only when there are no pending changes.
- Demo status flow:
  - Submit corrections → `Awaiting Corrected Draft`
  - Approve → `Awaiting Final`
  - In the real portal NILS remains authoritative for statuses.
- Routing is vertical: Place of Receipt → Port of Loading → Port of Discharge → Place of Delivery.
  - It uses the truck/ship icons from the approved design image.
  - A dashed line is continuous between stops and ends at the Place of Delivery stop.

## Settings / permissions direction

- Settings is visible to admin users.
- Admin has access to everything without separately assigning every module permission.
- Normal user access should eventually be managed per module and per permission level (for example: no access, view, edit/manage).
- Customer and Forwarder organisations have the same technical access model; their type is mainly administrative/contextual.
- A later business decision is needed for situations where both a customer and a forwarder can work on the same BL at once.

## NILS and workflow notes

- NILS sends the BL draft email and calls the secure-link process. The current draft event is enough to create/update the portal overview entry; a separate BL webhook is not required for version 1.
- A corrected draft will again be sent from NILS with a new secure link.
- Existing NILS API payloads showed that `update-bol-detail` permits a status value. The portal backend must only send permitted customer changes and keep protected fields (including weights and seal numbers) at their current NILS values.
- Customers may select allowed addresses/locations or request a new one. A requested address/location is shown in the draft as proposed, but must not directly create uncontrolled master data in NILS. Newport reviews it as part of one consolidated correction request.
- Customers should eventually be able to see a consolidated correction confirmation in the portal and/or email. Comments on BLs are a later phase and do not change status.

## Important documents outside this Git repository

These documents exist on the original laptop under the parent workspace and contain more detailed decisions and IT requests:

- `ACTIONS.md`
- `IT_REQUESTS/01_NILS_PORTAL_ACCESS_PARTY.md`
- `IT_REQUESTS/03_NILS_SAFE_CUSTOMER_UPDATE.md`
- `IT_REQUESTS/04_NILS_TEST_ACCESS_AND_CONTRACT.md`

Copy the complete `NP - PORTAL` workspace to a secure location if these documents must also be available on the other laptop, or add them to an approved company repository later.

## Do not store

- Do not store NILS API keys, customer passwords or GitHub passwords in this repository, source code or handover document.
- Do not connect the demo directly to NILS from the browser.


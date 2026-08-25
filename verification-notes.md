# Verification notes

## 2026-08-25

- `GET /api/qr/access?mode=buyer&token=...` redirected to `/buyer` and rendered the buyer intake page with the store title 「谷口の背負い投げポテト」.
- `GET /api/qr/access?mode=admin&token=...` redirected to `/admin` and rendered the admin board with the pending/completed columns and ticket search.
- Desktop screenshots showed the peach Memphis layout, pastel mint/lilac/yellow shapes, red/cream potato palette, bold display headings, and dense but legible ticket controls.
- Mobile screenshots at 390px width showed the buyer, admin, and combined layouts stacking vertically without horizontal overflow in the captured pages.
- `pnpm check`, `pnpm test`, and `pnpm build` passed before the QR HttpOnly session migration; the session migration was followed by a second `pnpm check` and session-aware tests, which passed.
- Realtime design: order mutations call `publishOrderChange()`, `/api/realtime` serves authenticated SSE events, and the frontend invalidates the tRPC order query on `orders` events while retaining a short polling fallback.

## Attached QR code decoding

- `918.png` encodes `https://potatoshop-azemg89x.manus.space/buyer-only-x5k9m2a7q8r3`; this is mapped to the buyer-only entry.
- `919.png` encodes `https://potatoshop-azemg89x.manus.space/buyer-a7k9m2x5q8r3`; this is mapped to the combined buyer/management entry.
- `920.png` encodes `https://potatoshop-azemg89x.manus.space/admin-b4n6p1j9w2e8`; this is mapped to the admin entry.

- The attached buyer QR path `/buyer-only-x5k9m2a7q8r3` was opened on the current preview and redirected to `/buyer`; the page rendered after the server-issued QR session check.

- The attached combined QR path `/buyer-a7k9m2x5q8r3` redirected to `/combined` and rendered intake, search, pending, completed, and reset controls.
- Clicking the reset control opened a real modal confirmation dialog with accessible cancel and destructive-action buttons.

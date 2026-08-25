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

## Visual redesign verification

The attached advertising image is loaded from `/manus-storage/376_d1ff0108.png` in the shared functional-page hero and in the QR gate. The combined page was opened through the attached QR path and visually confirmed with the new coal-black background, red/gold/cream cards, high-contrast typography, and management controls. The buyer page includes the requested timing notice: `ご来店の10～15分前に注文してください。揚げる時間により多少前後する場合があります。ご了承ください。`

The input and action controls now explicitly use dark text on cream fields, larger semibold labels and help text, cream text on red action buttons, visible focus rings, and pressed-state shadows. The combined-page reset trigger and modal actions have matching explicit typography, contrast, and focus styles. After these changes, `pnpm check`, all 8 Vitest tests, and `pnpm build` passed; the buyer and combined pages were visually checked at desktop and mobile widths.

## Post-redesign browser flow

A Playwright run opened the buyer and combined QR entries in two browser pages. It successfully registered `Z999` from the buyer page, observed the ticket in the combined page, filtered it with `Z9`, moved it to completed, and cleared the single test row. The final empty-state checks passed. The script deliberately refuses to mutate the database when unrelated existing rows are detected; the only test row created during this verification was cleaned up afterward.

The same run also served as the live cross-page synchronization check because the buyer and combined pages stayed open simultaneously while the register mutation was reflected in the management page.

The expanded live browser verification kept one buyer page and two combined management pages open simultaneously. It passed all three cross-page checks: registration appeared in both management pages, completion removed the ticket from pending and placed it in completed on both, and clear-all removed it from both pages. The single test row was cleared at the end.

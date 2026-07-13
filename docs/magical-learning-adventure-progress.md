# Magical Learning Adventure — Progress Log

## Phase 0 — Audit and Safety Baseline

วันที่: 10 กรกฎาคม 2569 (2026-07-10)
Branch: `feat/magical-learning-adventure`
Baseline: `9912dc4bc4b87608d100b9d79196f8df09b420fd`

### สิ่งที่พบ

- แอปเป็น static React PWA ใช้ React/Firebase/Babel จาก CDN และแปลง JSX ใน browser
- ไม่มี package manifest, build, formatter, lint, test หรือ CI command เดิม
- `main` มีงานที่เรียก Phase 1 และ Phase 2 อยู่แล้ว จึงต้องทำ gap analysis ก่อนแก้ Phase ถัดไปแทนการเขียนทับ
- state/business logic รวมอยู่ใน `AppProvider`; Firebase schema/upload/outbox อยู่ใน `fw-firebase.jsx`
- child mission state machine, reward guards, level/streak, portfolio, curriculum, Parent Mode, backup และ PWA ทำงานเชื่อมกันหลายไฟล์และเป็น regression surface สำคัญ
- asset source อยู่ภายนอก repository ที่ `F:\Codex\freya-world\public\assets\freya-world`; พบ PNG 8 ไฟล์ซึ่งยังเป็น reference/asset sheets ต้องแยกชิ้นและ optimize ก่อนใช้จริง
- production ปัจจุบันยังพึ่ง OS emoji เป็น visual identity หลักและ CSS มี legacy/new token layers พร้อม inline styles จำนวนมาก
- พบ known risks ที่ยังไม่แก้ใน Phase 0: empty mission snapshot ไม่ clear local list, reviewed history ไม่ sync, multi-device last-write-wins, family-code length mismatch, PIN ไม่ใช่ security boundary และ app data ไม่ persist อัตโนมัติหากไม่เชื่อม Firebase

### ไฟล์ที่เพิ่ม/แก้

- `docs/magical-learning-adventure-plan.md` — repository/UX/asset audit, IA, design system, phases, tests และ rollback plan
- `docs/magical-learning-adventure-progress.md` — ผล Phase 0 และ validation record
- `tests/smoke.mjs` — dependency-free source smoke test

ไม่มี production JSX/CSS, Firebase schema, service worker, PWA metadata หรือ business logic ถูกแก้ใน Phase 0

### Component ที่สร้าง

ไม่มี UI component ใหม่ตามข้อกำหนดที่ห้ามเริ่ม visual redesign ก่อน Audit เสร็จ

### Logic ที่แตะ

ไม่มี runtime/business logic ถูกแตะ Smoke test อ่าน source แบบ read-only เพื่อตรวจ contract ที่สำคัญเท่านั้น

### Logic ที่ตั้งใจไม่แตะ

- mission create/accept/submit/approve/reject/repeat/parent override
- star credit/deduction, level, streak และ loot box
- reward/room/mascot transactions
- portfolio media และ SAR
- curriculum IDs, keys, indicators และ plan edits
- Parent PIN/profile flow
- Firebase serializer, auth, listeners, upload/outbox และ backup/restore
- service-worker cache/network boundary

### การเปลี่ยนแปลง UX

ไม่มีการเปลี่ยน UX production เอกสารเสนอ IA และ design direction สำหรับการตรวจอนุมัติก่อนเริ่ม Phase 1 เท่านั้น

Frontend Design guidance ทำให้แผนยึดภาพจำเฉพาะของ “สมุดแผนที่นักสำรวจ” และ world map ที่เป็น navigation จริง แทนการเพิ่ม fantasy decoration แบบ generic โดยยังคง palette ที่ brief กำหนด

### Validation

| รายการ | ผล |
|---|---|
| Working tree ก่อนเริ่ม | สะอาดบน `main` |
| Branch | สร้าง `feat/magical-learning-adventure` สำเร็จ |
| Formatter | ไม่มี command ใน repository |
| Lint | ไม่มี command ใน repository |
| Tests | `node tests/smoke.mjs` ผ่าน: 16 required files, 17 local scripts |
| Production build | ไม่มี build command; Netlify publish static root |
| Browser load | ผ่านบน local HTTP; app mount สำเร็จ |
| Console | ไม่มี app error; พบ Babel Standalone production warning |
| 360×800 | ผ่าน; ไม่มี horizontal overflow |
| 390×844 | ผ่าน; ไม่มี horizontal overflow |
| 768×1024 | ผ่าน; app width 700 px, ไม่มี horizontal overflow |
| 1024×768 | ผ่าน; desktop sidebar, ไม่มี horizontal overflow |
| 1440×900 | ผ่าน; app width 1100 px, ไม่มี horizontal overflow |
| Firebase interaction | ไม่ทดสอบ live เพราะไม่มี family/config test fixture และ Phase 0 ห้ามสร้าง/แก้ external data |
| Critical workflow end-to-end | ไม่รัน mutation กับข้อมูลจริง; บันทึก contract และเพิ่ม source smoke checks แล้ว |

### รายละเอียดหน้า baseline

Kid Home เปิดด้วย compact header, time-aware sky hero, empty quest state, 7-node adventure map, mascot และ navigation 3 รายการใน child mode ส่วน desktop เปลี่ยน navigation เป็น sidebar แบบยืดจาก mobile navigation ปัจจุบันยังไม่มี asset จริงจาก external source และยังใช้ emoji/CSS shapes

### ปัญหาที่ยังเหลือ

1. ต้องให้ผู้ใช้ตรวจ/อนุมัติแผนก่อนเริ่ม Phase 1
2. ควรเปิด issue แยกสำหรับ Firebase/sync risks เพื่อไม่ปะปนกับ visual phases
3. ต้องเตรียม asset pipeline: crop/export/rename/optimize/mapping ก่อนนำ sheet มาใช้
4. ควรตัดสินใจเรื่อง production precompile/tooling เป็นงานแยก เพราะกระทบ runtime/deploy/service worker
5. Phase ถัดไปต้องเพิ่ม interaction regression tests มากกว่า source smoke test

### Commit

Subject: `docs: audit magical learning adventure redesign`
Hash: ดูจาก Git history ของ branch หลัง commit (ไม่บันทึก self-referential hash ในเนื้อหา commit)

### Phase gate

Phase 0 ผ่าน validation ตามขอบเขตที่ทำได้โดยไม่ใช้ Firebase test account และไม่มี build/lint command แต่ **ยังไม่เริ่ม Phase 1** ตามคำสั่ง ต้องรอการตรวจเอกสารและอนุมัติจากผู้ใช้ก่อน

---

## Phase 1 — Design System and App Shell

วันที่: 12 กรกฎาคม 2569 (2026-07-12)

### สิ่งที่พบก่อนแก้

- HEAD มี token, compact header, responsive sidebar และ hero จากงานก่อนหน้าอยู่แล้ว จึงใช้ gap-based implementation ไม่สร้าง design system ซ้ำ
- child mode เดิมมี navigation เพียง 3 รายการ ส่วน Quest และ World อยู่รวมใน Home
- desktop sidebar เป็น mobile navigation ที่ยืดแนวตั้ง ยังไม่มี group labels หรือ settings destination
- overlays ใช้ wrapper เฉพาะหน้า ไม่มี dialog semantics, Escape close, focus trap หรือ focus restoration
- shell ยังใช้ OS emoji เป็น navigation identity และมี ambient doodles/shine/pulse/idle motion
- ไม่มี central asset registry แม้มี external asset sheets พร้อมเป็น reference

### ไฟล์ที่เพิ่ม

- `fw-assets.js` — presentation-only asset registry สำหรับ worlds, characters, shop และ memory book; source ยัง disabled จนกว่าจะเตรียม individual assets
- `fw-ui.jsx` — SVG icon system, StarCounter, LevelProgress, StatusBadge, Surface, IconButton, EmptyState, LoadingSkeleton, AccessibleOverlay และ ConfirmationDialog

### ไฟล์ที่แก้

- `index.html`, `sw.js` — load/precache shared foundation และ bump cache เป็น `freya-world-v8`
- `fw-theme.css`, `fw-responsive.css` — token reconciliation, shared component styles, mobile navigation และ grouped desktop sidebar
- `fw-app.jsx` — compact header primitives, 5-destination child navigation, grouped settings entry และ semantic nav
- `fw-dashboard.jsx` — presentation-only Quest/World destinations ที่ reuse MissionCard/AdventureMap/state เดิม
- `fw-activity.jsx`, `fw-avatar.jsx`, `fw-parent.jsx`, `fw-parenthub.jsx`, `fw-rewards.jsx`, `fw-sar.jsx` — migrate overlays/accessibility โดยไม่เปลี่ยน action logic
- `fw-cheer.jsx` — live feedback semantics
- `tests/smoke.mjs` — assertions สำหรับ asset/UI load order, 5 destinations, accessible dialogs, focus restore และ service-worker precache

### Component ที่สร้าง

- `AppIcon` — inline SVG icon vocabulary สำหรับ app shell
- `StarCounter`, `LevelProgress`, `StatusBadge`
- `Surface`, `IconButton`
- `EmptyState`, `LoadingSkeleton`
- `AccessibleOverlay` — backdrop close, Escape, focus trap และ focus restore
- `ConfirmationDialog`
- `QuestsPage`, `WorldPage` — direct navigation destinations ที่ reuse components และ context เดิม

### Logic ที่แตะ

- เฉพาะ presentation state ใน `Shell`: tab destinations และการกลับ Home เมื่อสลับเข้า/ออก Parent Mode
- overlay focus lifecycle และ keyboard events
- service-worker cache version/list สำหรับไฟล์ UI ใหม่

### Logic ที่ตั้งใจไม่แตะ

- `fw-data.jsx` ทั้งไฟล์ รวม mission state machine, stars, level, streak, rewards และ backup
- `fw-firebase.jsx` ทั้งไฟล์ รวม schema, auth, listeners, Storage และ IndexedDB outbox
- curriculum IDs/keys/indicators
- reward transaction actions และ affordability guards
- Parent PIN validation
- portfolio/SAR data mapping
- music/SFX state และ WebAudio implementation

### การเปลี่ยนแปลง UX

- child mobile navigation มี 5 ปลายทาง: หน้าหลัก, ภารกิจ, โลกของฉัน, ผลงาน, รางวัล
- Parent Mode ยังจำกัด 5 รายการ: หน้าหลัก, สร้างภารกิจ, ผลงาน, รางวัล, ผู้ปกครอง
- desktop sidebar จัดกลุ่มการเรียนรู้/การสะสม/ผู้ปกครองตาม mode และมีการตั้งค่าที่ footer
- navigation ใช้ SVG icons เดียวกันทุกระบบปฏิบัติการแทน OS emoji
- Header ใช้ shared level/star/status presentation และ sticky compact layout
- Quest/World มี page heading และ direct destination โดยไม่ duplicate workflow logic
- overlays ที่ migrate แล้วมี dialog semantics, Escape close, focus trap และคืน focus ไปยังตัวเปิด
- avatar trigger เปลี่ยนเป็น semantic button
- Toast/Cheer มี live-region feedback
- ตัด ambient doodles, progress shine, accept pulse และ mascot infinite idle; เก็บ motion สำหรับ navigation/feedback/celebration

Frontend Design guidance ทำให้ shell ใช้โครง “สมุดแผนที่นักสำรวจ”: navigation/ledger เป็นโครงข้อมูลจริง และใช้ความเด่นกับ world map เพียงจุดเดียว แทนการเพิ่ม decoration ทั่วหน้า

### Validation

| รายการ | ผล |
|---|---|
| Formatter | ไม่มี command ใน repository |
| Lint | ไม่มี command ใน repository |
| Production build | ไม่มี build command; runtime เป็น static JSX + Babel Standalone |
| Smoke test | ผ่าน: 18 required files, 19 local scripts |
| Browser mount | ผ่านจาก uncached local origin |
| Console | ไม่มี app error; มี Babel Standalone production warning เดิม |
| 360×800 | ผ่าน; child nav 5, settings sidebar item ซ่อน, ไม่มี horizontal overflow |
| 390×844 | ผ่าน; child nav 5, ไม่มี horizontal overflow |
| 768×1024 | ผ่าน; app width 700 px, child nav 5, ไม่มี horizontal overflow |
| 1024×768 | ผ่าน; grouped sidebar/settings แสดง, ไม่มี horizontal overflow |
| 1440×900 | ผ่าน; app width 1100 px, sidebar width 210 px, ไม่มี horizontal overflow |
| Quest destination | ผ่าน; active nav และ heading ถูกต้อง |
| World destination | ผ่าน; active nav, 7 ledger rows และ map แสดง |
| Settings dialog | ผ่าน; `role=dialog`, Escape close และ focus คืนปุ่มตั้งค่า |
| Reward preview | ผ่าน; locked preview เป็น dialog, Escape close และ focus คืน item |
| Parent Mode | ผ่าน PIN 1234; mobile parent nav มี 5 รายการและ active state ถูกต้อง |
| Firebase interaction | ไม่แตะและไม่รัน live mutation ใน Phase 1 |

### คำอธิบายหน้าหลังปรับ

- Mobile: compact header อยู่ด้านบน, Home content อยู่บนพื้น cream, bottom navigation เป็น SVG 5 รายการและรองรับ safe-area
- Desktop: sidebar สีขาวด้านซ้ายแบ่ง group labels ชัดเจน, settings อยู่ footer, content scroll แยกทางขวา และ header คงข้อมูลเด็ก/ระดับ/ดาวแบบกะทัดรัด
- Asset sheets จาก `F:\Codex` ยังไม่ถูกนำมาแสดงใน production; registry ใช้ neutral CSS/SVG presentation จนกว่าไฟล์จะแยกชิ้นและ optimize

### ปัญหาที่ยังเหลือ

1. Runtime ยังใช้ Babel Standalone/React development CDN; ควรแยก tooling migration จาก UI phases
2. Feature content ภายใน Rewards/Portfolio/Parent ยังใช้ emoji จำนวนมาก งาน asset replacement อยู่ Phase ที่เกี่ยวข้อง
3. Quest detail/filter/submission restructuring เป็น Phase 3; Phase 1 เพิ่มเพียง shell destination
4. World artwork และ node CTA เต็มรูปแบบเป็น Phase 2 หลังเตรียม individual assets
5. ยังไม่มี automated interaction runner ใน repository; browser validation ทำแบบ manual automation และ source smoke test

### Commit

Subject: `feat(ui): add magical learning design system and app shell`
Hash: ดูจาก Git history ของ branch หลัง commit

### Phase gate

Phase 1 ต้องผ่าน final diff/smoke/browser check และ commit แยกก่อนเริ่ม Phase 2

---

## Phase 2 — Kid Home and My World

วันที่: 12 กรกฎาคม 2569 (2026-07-12)

### สิ่งที่ทำ

- รักษา time-aware Hero, CTA เดียว, level progress, ภารกิจวันนี้ และ achievement preview ที่มีอยู่แล้ว
- เปลี่ยนแผนที่จากภาพสถานะเป็น navigation 7 โลกที่กดดูรายละเอียดได้
- เพิ่มชื่อ presentation ภาษาอังกฤษตามทิศทางใหม่โดยไม่เปลี่ยน group ID หรือข้อมูลหลัก
- เพิ่ม world detail sheet พร้อมคำอธิบาย, progress, จำนวนภารกิจทั้งหมด/สำเร็จ และ focus lifecycle จาก `AccessibleOverlay`
- ใช้ SVG line icons และ CSS island shapes เป็น production-safe fallback เพราะไฟล์ต้นฉบับใน `F:\Codex` ยังเป็น asset sheets ซึ่งห้ามนำมาใช้ทั้งแผ่น
- เพิ่ม cache busting สำหรับไฟล์ UI ที่แก้และ bump Service Worker เป็น `freya-world-v9`

### Logic ที่ตั้งใจไม่แตะ

- mission state machine, star/level/reward transactions และ Firebase schema/sync
- group IDs, progress calculation และ curriculum mapping
- Hero recommendation logic, evidence upload และ Parent Mode actions

### Validation

| รายการ | ผล |
|---|---|
| Smoke test | ผ่าน: 18 required files, 19 local scripts |
| World destinations | 7 ปุ่ม พร้อมชื่อไทย/อังกฤษและ accessible label |
| Detail sheet | เปิดได้, `role=dialog`, Escape close และ focus lifecycle ใช้ shared overlay |
| 360×800 | ผ่าน; ไม่มี horizontal overflow |
| 768×1024 | ผ่าน; ไม่มี horizontal overflow |
| 1024×768 | ผ่าน; ไม่มี horizontal overflow |
| 1440×900 | ผ่าน; ไม่มี horizontal overflow |
| Console | ไม่มี app error; มี Babel Standalone warning เดิม |

Frontend Design guidance ทำให้โลกทั้ง 7 เป็นจุดหมายที่มีข้อมูลและการโต้ตอบจริงในสมุดแผนที่ แทนการเพิ่มของตกแต่งแฟนตาซีที่ไม่ช่วยการใช้งาน

### Commit

Subject: `feat(home): redesign kid home as a magical learning adventure`

### Phase gate

Phase 2 ผ่าน smoke/browser/responsive validation และพร้อม commit แยกก่อนเริ่ม Phase 3

---

## Phase 3 — Quest Experience

วันที่: 12 กรกฎาคม 2569 (2026-07-12)

- เพิ่ม status taxonomy กลางสำหรับ Ready, In progress, Waiting for review และ Complete
- เพิ่มตัวกรอง กำลังทำ/พร้อมเริ่ม/รอตรวจ/สำเร็จ/ทั้งหมด
- เปลี่ยนหน้า Quests เป็น ledger cards แบบกะทัดรัด และย้าย action/evidence ไป detail sheet
- detail sheet ใช้ `AccessibleOverlay`; action ทั้งหมดเรียก `acceptMission`, `submitMission`, `toggleMission`, `repeatMission` เดิม
- ไม่แก้ upload, IndexedDB outbox, Firebase serializer หรือ mission state machine
- เพิ่ม responsive compact layout, keyboard focus และ empty filtered state

Validation: smoke test ผ่าน 18 required files/19 local scripts, diff check ผ่าน และ cache bump เป็น `freya-world-v10`

Commit subject: `feat(quests): separate quest list detail and evidence flow`

---

## Phase 4 — Reward Shop

วันที่: 12 กรกฎาคม 2569 (2026-07-12)

- เพิ่ม `RewardGlyph` เป็น code-native SVG/CSS fallback สำหรับสินค้า ห้อง ชุด และรางวัลจริง
- เชื่อม item fallback กับ `FW_ASSETS.shop.item(id)` เพื่อพร้อมสลับเป็น individual production assets ภายหลัง
- เปลี่ยนภาพหลักบน shelf, preview, celebration และ reward card ออกจาก OS emoji
- เพิ่ม accessible label ให้ปุ่มลบรางวัล
- รักษา `buyRoomItem`, `buyMascotItem`, `redeem`, owned state และ affordability guards เดิม
- ไม่แตะราคา, wallet, reward IDs, room placement หรือ Firebase schema

Validation: smoke assertions ตรวจ action contracts และ asset fallback ผ่าน; cache bump เป็น `freya-world-v11`

Commit subject: `feat(rewards): refine the star shop and asset fallbacks`

---

## Phase 5 — Magical Memory Book

วันที่: 12 กรกฎาคม 2569 (2026-07-12)

- เปลี่ยน kid portfolio จาก tilted polaroid grid เป็น chronological memory-book journal
- mobile ใช้ timeline แนวตั้ง; desktop ใช้สมุดสองคอลัมน์
- แสดงภาพ/วิดีโอ/เสียง, ชื่อภารกิจ, วันที่, ดาว, หมวด, reflection/description, parent text/audio feedback และ indicators เมื่อมีข้อมูล
- ใช้ shared EmptyState และเพิ่ม alt/aria-label ให้ media
- รักษา portfolio fields, year filter, admin curriculum summary และ SAR consumer เดิม

Validation: source smoke ผ่านและตรวจ field consumers สำคัญ; cache bump เป็น `freya-world-v12`

Commit subject: `feat(portfolio): turn achievements into a magical memory book`

---

## Phase 6 — Parent Experience

วันที่: 12 กรกฎาคม 2569 (2026-07-12)

- เพิ่ม Parent Overview เป็นหน้าแรกของ hub
- สรุป pending reviews, needs revision, not started และ completed จาก state เดิม
- เพิ่ม learning progress, portfolio/review counts และ quick actions ไป Reviews/Curriculum/SAR
- เปลี่ยน hub tabs/header เป็น shared SVG icon language และใช้ shared EmptyState ใน review queue
- รองรับ 2×2 บนมือถือ, 4 metrics และสองคอลัมน์บน tablet/desktop
- ไม่แตะ PIN, anonymous auth, Firebase schema, approval/rejection actions หรือ curriculum IDs

Validation: source smoke ตรวจ overview/status contracts ผ่าน; cache bump เป็น `freya-world-v13`

Commit subject: `feat(parent): add a focused learning overview and review hub`

---

## Phase 7 — Polish and Validation

วันที่: 12 กรกฎาคม 2569 (2026-07-12)

- เพิ่ม shared `ErrorState`, ปรับ quest filter เป็น touch target 44 px และหยุด ambient room-walker/map-marker motion
- ยืนยัน EmptyState, LoadingSkeleton, ErrorState, dialog focus/Escape และ native reduced-motion coverage
- ทดสอบ app mount, Quest destination, Memory Book empty state, Parent PIN 1234/Overview และ Star Shop จริงใน browser
- Service Worker cache รุ่นสุดท้าย `freya-world-v14`; Firestore/Auth/Storage bypass rules ไม่เปลี่ยน

### Final validation

| รายการ | ผล |
|---|---|
| Smoke test | ผ่าน: 18 required files, 19 local scripts |
| Diff check | ผ่าน |
| App console | ไม่มี app error; มี Babel Standalone production warning เดิม |
| Quest destination | mount และ heading ผ่าน; empty state ถูกต้องเมื่อไม่มี mission fixture |
| Memory Book | empty state และ year range ผ่าน; field contracts ตรวจด้วย smoke |
| Parent Mode | PIN 1234 ผ่าน; Overview 4 metrics และ 4 sub-tabs แสดงครบ |
| Star Shop | storefront แสดง; code-native glyph 16 รายการใน default room catalog |
| 360×800 | ไม่มี horizontal overflow |
| 390×844 | ไม่มี horizontal overflow |
| 768×1024 | ไม่มี horizontal overflow |
| 1024×768 | ไม่มี horizontal overflow |
| 1440×900 | ไม่มี horizontal overflow |
| Firebase live/two-client | ไม่รัน เพราะไม่มี isolated family/config fixture; schema/sync files ไม่ถูกแก้ |
| Evidence camera/mic/upload | ไม่อนุญาต browser permission และไม่มี test Firebase; action/outbox contracts คงเดิม |

### ข้อจำกัดที่ยังทราบ

- Runtime ยังเป็น React/Babel Standalone ผ่าน CDN; production precompile ควรเป็น migration แยก
- external artwork ยังเป็น asset sheets จึงใช้ central registry + SVG/CSS fallback ตามข้อห้ามไม่ใช้ sheet ทั้งแผ่น
- Firebase concurrency/reviewed-history/empty-snapshot risks จาก Phase 0 ยังเป็นงานระบบแยกและไม่ได้แอบแก้ใน redesign

Commit subject: `chore(ui): polish accessibility motion and release validation`

สถานะ: Phase 0–7 เสร็จใน branch local และยังไม่ push GitHub ตามคำสั่งผู้ใช้

---

## Asset Integration — Production Artwork

วันที่: 13 กรกฎาคม 2569 (2026-07-13)

- ตรวจ individual artwork ชุดใหม่จาก `F:\Codex\freya-world\public\assets\freya-world`
- เก็บ source PNG เดิมแบบ read-only และสร้าง WebP ภายใน repository 59 ไฟล์
- ลดขนาดรวมจากประมาณ 84 MB เหลือประมาณ 1.3 MB
- World 768 px, character 512–640 px, mission 512 px, reward/decorations 384 px; WebP quality 82
- เปิด `FW_ASSETS.ready` และเพิ่ม mapping สำหรับ worlds, mission fallback by group, Freya/Lumi และ shop items
- แผนที่และ territory detail ใช้ภาพโลกจริง, quest ledger ใช้ภาพภารกิจจริง และร้านดาวใช้ reward art เมื่อ ID ตรง
- ทุกจุดยังมี SVG/CSS fallback หาก asset ไม่มีหรือ ID ไม่ตรง
- ไม่ตัดพื้นหลังตัวละครแบบอัตโนมัติ เพราะ source ไม่มี alpha และขอบผม/วัสดุซับซ้อน; ใช้เฉพาะในกรอบภาพพื้นครีมจนกว่าจะมี transparent master
- Service Worker bump เป็น `freya-world-v15`
- Character visibility follow-up: เพิ่ม Freya เป็น portrait หลักใน Hero และใช้ Lumi expression artwork เป็นเพื่อนคู่ใจตามหน้า โดยคง custom avatar/wardrobe state และ fallback เดิม
- Service Worker bump หลัง character integration เป็น `freya-world-v16`
- ปรับ Hero text column หลัง visual review เพื่อไม่ให้ level/CTA ซ้อนกับ Freya portrait; final character cache `freya-world-v17`

### Room and Companion Presentation Follow-up

- เปลี่ยน room placement จาก 4×3 inventory grid เป็นฉากห้องที่มีผนัง หน้าต่าง ชั้นวาง พรม และตำแหน่งวางของ 12 จุด โดยคง slot IDs/placement actions เดิม
- เพิ่มชื่อ zone และ accessible label ต่อจุดวางของ; ของที่วางแล้วแสดงภาพ/ชื่อชัดขึ้น
- เปลี่ยน Mascot Wardrobe เป็น Lumi dressing stage ขนาดใหญ่ พร้อม equipped slots แยกเครื่องประดับ/ของคู่กาย
- ของที่กำลังใส่แสดงภาพ ชื่อ และ action ถอดชัดเจน; owned items แสดงเป็น visual cards แทน emoji chip
- ตัด unsupported emoji overlay บน Lumi artwork แต่คง wardrobe state และ fallback สำหรับ custom avatar
- Service Worker cache `freya-world-v18`

### Homeschool Identity Follow-up

- Header แสดง `Homeschool` เป็นบริบทหลัก และแสดงชื่อบ้านเรียนจาก `profile.homeschoolName` เป็นบรรทัดรอง
- เพิ่มช่องแก้ชื่อ Homeschool ใน Parent Settings; field อยู่ใน profile เดิมจึงใช้ sync/backup serializer เดิมโดยไม่เพิ่ม schema ระดับบน
- profile เก่า fallback เป็น `Freya Homeschool`; จำกัดชื่อ 50 ตัวอักษรและตัดด้วย ellipsis บนจอแคบ
- Service Worker cache `freya-world-v19`

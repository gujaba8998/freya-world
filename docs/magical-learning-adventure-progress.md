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

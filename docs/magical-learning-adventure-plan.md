# Magical Learning Adventure — Repository Audit and Implementation Plan

วันที่ตรวจสอบ: 10 กรกฎาคม 2569 (2026-07-10)
Baseline commit: `9912dc4bc4b87608d100b9d79196f8df09b420fd`
Working branch: `feat/magical-learning-adventure`

## 1. ขอบเขตและหลักความปลอดภัย

เอกสารนี้เป็นผลของ Phase 0 เท่านั้น ยังไม่เปลี่ยน visual production, Firebase schema, authentication, synchronization, offline behavior หรือ business logic ใด ๆ งานใน Phase ถัดไปต้องรักษา workflow ต่อไปนี้ไว้ครบ: สร้าง/เริ่ม/ส่ง/ตรวจ/อนุมัติ/ส่งกลับภารกิจ, การให้ดาวแบบไม่ซ้ำ, level, streak, achievements, reward transactions, portfolio media, curriculum, Parent Mode, music/SFX, backup/restore, Firebase sync และ evidence upload retry.

สถานะ repository ไม่ตรงกับลำดับ Phase ใน brief ทั้งหมด: `main` มี commit ที่ระบุว่าเป็น Phase 1 และ Phase 2 อยู่แล้ว แต่ยังไม่มีเอกสาร Phase 0 ตามรูปแบบที่กำหนด เอกสารนี้จึง audit สภาพจริง ณ HEAD และวาง Phase ถัดไปแบบ incremental ห้ามย้อนหรือลบงานเดิมโดยอัตโนมัติ

## 2. Repository audit

### Framework และวิธีเริ่มโปรเจกต์

- Static single-page PWA ไม่มี bundler และไม่มี package manager manifest เดิม
- React 18.3.1, ReactDOM และ Babel Standalone ถูกโหลดจาก CDN ใน `index.html`
- JSX ทุกไฟล์ถูกแปลงใน browser ด้วย `<script type="text/babel">`
- Firebase compat SDK 10.12.0 ถูกโหลดจาก Google CDN
- เปิด local ได้ด้วย static HTTP server เช่น `python -m http.server 4173`
- Netlify deploy repository root โดยไม่มี build command
- Service worker ใช้ stale-while-revalidate สำหรับ app shell และ CDN runtime

ข้อสังเกต: browser แสดง production warning จาก Babel Standalone ทุกครั้งที่โหลด การย้ายไป precompiled production bundle เป็นงานลดความเสี่ยงในอนาคต แต่ไม่ควรทำพร้อม redesign เพราะมี blast radius สูง

### โครงสร้างไฟล์

| กลุ่ม | ไฟล์หลัก | หน้าที่ |
|---|---|---|
| Entry/PWA | `index.html`, `manifest.webmanifest`, `sw.js`, `netlify.toml` | โหลด dependency/JSX, mount React, PWA metadata, cache และ deploy |
| App shell | `fw-app.jsx`, `fw-responsive.css`, `fw-theme.css`, `fw-styles.css`, `fw-fun.css` | header, navigation, overlays, responsive shell, tokens, legacy styles และ effects |
| State/business logic | `fw-data.jsx` | React Context, state, mission state machine, stars/level/streak, rewards, backup และ sync orchestration |
| Firebase/offline upload | `fw-firebase.jsx` | config/auth, Firestore serializer, Storage upload, setup wizard และ IndexedDB outbox |
| Kid experience | `fw-dashboard.jsx`, `fw-activity.jsx`, `fw-cheer.jsx`, `fw-mascot.jsx` | hero/map, mission flow, evidence capture, activity builder, celebration/mascot |
| Rewards | `fw-rewards.jsx` | room, loot box, sticker album, mascot wardrobe, Star Shop และ wallet |
| Portfolio/report | `fw-portfolio.jsx`, `fw-sar.jsx` | portfolio media, parent curriculum summary และ printable SAR |
| Parent | `fw-parent.jsx`, `fw-parenthub.jsx` | PIN/settings, review queue, yearly tracker, weekly summary และ reports |
| Curriculum | `fw-curriculum.jsx` | grade mapping, indicators, competencies, yearly plans และ group guide |
| Avatar/media tooling | `fw-avatar.jsx`, `image-slot.js` | preset/custom avatar และ persistent editable image slot |
| Utility/editor | `fw-music.jsx`, `tweaks-panel.jsx` | WebAudio tracks และ edit-mode tweak panel |

ไม่มี `src/`, router, `public/assets/freya-world/`, `references/`, CI workflow, package manifest หรือ test suite ใน baseline

### Entry point และลำดับโหลด

`index.html` เป็น entry point เดียว โหลด CSS สี่ชั้นตามลำดับ `fw-styles.css` → `fw-responsive.css` → `fw-fun.css` → `fw-theme.css` และโหลด JSX แบบ global scripts โดยให้ curriculum/Firebase มาก่อน state, feature components มาก่อน `fw-app.jsx`, จากนั้น `Page` mount `FreyaApp` ผ่าน `ErrorBoundary`.

ไม่มี URL routing; `Shell` เก็บ tab ปัจจุบันใน local React state จึงกลับหน้า Home เมื่อ reload/deep link และ browser back/forward ไม่ได้แทนการเปลี่ยนหน้า

### Components หลัก

- `FreyaApp` / `Shell`: app root, tab switching, modal state และ global feedback
- `AppProvider`: state/actions ทั้งระบบผ่าน React Context
- `Header`, `KidSettingsSheet`, `BottomNav`: shell สำหรับเด็กและทางเข้า Parent Mode
- `HeroAdventure`, `MissionCard`, `EvidencePicker`, `AdventureMap`: kid home และ mission workflow
- `ActivityBuilder`, `PlanPicker`, `IndicatorSelector`: สร้างภารกิจจากแผนหรือแบบ custom
- `StarShop`, `RewardCard`, `FreyaRoom`, `MascotWardrobe`, `LootBox`: reward economy
- `Portfolio`, `Polaroid`, `SARModal`: ผลงานและรายงาน
- `ParentGate`, `ParentSheet`, `ParentHub`, `ApprovalQueue`, `YearlyTracker`: parent workflow

Shared primitives ยังไม่เป็นระบบเดียวอย่างสมบูรณ์ มี `.btn`, `.card`, chips, sheet และ atoms บางส่วน แต่ modal/status/empty/loading/confirmation หลายแบบยังประกอบเฉพาะหน้าและใช้ inline style ซ้ำจำนวนมาก

### State management

- React Context + `useState`/`useCallback` ใน `AppProvider`; ไม่มี reducer หรือ external store
- State หลัก: missions, progress, stars, wallet, portfolio, rewards, room, streak, lootbox, stickers, mascotFit, profile, submissions, reviewed, planDone, planEdits และ Firebase status
- Level คำนวณจาก lifetime positive wallet income ทุก 100 ดาว
- `planEdits` เก็บเฉพาะ diff จาก built-in curriculum เพื่อให้ default plan อยู่รอดข้าม app updates
- Local persistence มีเฉพาะ music settings, Firebase config/family code, custom image-slot และ IndexedDB upload outbox; app data อื่นพึ่ง Firebase หรือ manual backup/restore

### Mission workflow และ logic ที่ต้องรักษา

State machine ที่ระบุใน source:

`available` → `inprogress` → `pending` → `done`

- `acceptMission`: เปลี่ยนเป็น in-progress และแสดง cheer
- `submitMission`: รับ image/video/audio, upload ไป Storage เมื่อพร้อม, เขียน outbox เมื่ออัปโหลดล้มเหลว, เพิ่ม submission และเปลี่ยน mission เป็น pending
- `approveSubmission`: เพิ่มดาว/progress/wallet/portfolio, ทำ mission เป็น done, เพิ่ม reviewed history แล้วลบ submission
- `rejectSubmission`: ส่ง mission กลับเป็น in-progress พร้อม `returned`, เพิ่ม reviewed history แล้วลบ submission
- `toggleMission`: parent override โดยตรง
- `repeatMission`: clone mission ด้วย ID ใหม่โดยไม่แตะเครดิตเดิม

จุดห้าม regression: อย่าให้ approval หรือ parent override ให้ดาวซ้ำ, อย่าเขียน blob URL ลง Firestore, และ retry ต้อง patch ได้ทั้ง submission และ portfolio หลัง approval

### Reward, level, streak และ collection logic

- `redeem`, `buyRoomItem`, `buyMascotItem` ตรวจ `stars < cost` ซ้ำใน action ก่อนหักดาว
- รายการซื้อเขียน wallet เป็นค่าลบ; room/mascot ownership sync เป็น ID เท่านั้น
- streak เพิ่มวันละครั้งตอนเด็กส่งงานและให้ milestone bonus
- weekly loot box นับงานที่อนุมัติและเปิดได้ครั้งเดียวต่อสัปดาห์เมื่อครบเป้า
- level มาจากรายรับดาวบวกตลอดกาล จึงไม่ลดเมื่อใช้ดาว
- UI Star Shop มี preview, affordability/locked/owned state และ purchase celebration อยู่แล้ว

### Firebase integration และ offline behavior

- Anonymous Auth; หนึ่ง document ต่อ family ที่ `families/{familyCode}` และ membership subcollection ตาม rules ที่แสดงใน setup wizard
- Debounced full-document write 1,200 ms พร้อม `fbSource` guard กัน snapshot echo
- Firestore schema serializer อยู่ใน `stateToFs`; ไม่ควรเปลี่ยนชื่อ/ชนิด field ใน UI phases
- Storage path: `families/{familyCode}/evidence/...`
- IndexedDB `fw_outbox/pending` เก็บไฟล์ที่ upload ไม่สำเร็จและ retry เมื่อ sync/online
- Service worker ไม่ intercept Firestore, Storage, Auth หรือ evidence download URLs

ความเสี่ยงที่ต้องติดตามโดยยังไม่แก้ใน Phase 0:

1. `applySnapshot` ใช้ `if (s.missions.length)` ทำให้ cloud snapshot ที่ลบ missions จนว่างไม่สามารถ clear local missions ได้
2. `reviewed` history ไม่อยู่ใน `stateToFs/fsToState` จึงไม่ sync และหายเมื่อ reload เว้นแต่ผู้ใช้ export/import backup ภายใน session ที่ยังมีข้อมูล
3. Full-document last-write-wins อาจทับ concurrent edits จากหลายเครื่อง
4. Family code generator ระบุ 12 ตัวอักษร แต่ wizard ตัดเหลือ 10 และ input จำกัด 10 ทำให้ implementation/comment ไม่ตรงกัน
5. PIN อยู่ใน synced profile แบบ plain value; เป็น UI gate ไม่ใช่ security boundary ห้ามอ้างว่าเป็น authorization ที่แข็งแรง
6. หากไม่เชื่อม Firebase app state ส่วนใหญ่ไม่มี automatic local persistence แม้ app shell จะเปิด offline ได้

### CSS architecture, responsive และ motion

- `fw-styles.css`: legacy tokens, shared atoms, component CSS และ animation จำนวนมาก
- `fw-responsive.css`: tablet 640+, desktop 1024+, large desktop 1280+
- `fw-fun.css`: playful features เพิ่มเติม
- `fw-theme.css`: design tokens ใหม่และ override legacy variables โดยโหลดท้ายสุด
- inline styles กระจายทั่ว JSX ทำให้ state/spacing/type บางส่วนไม่ได้อิง token กลาง
- Desktop เปลี่ยน bottom navigation เป็น sidebar แต่ยังไม่ได้จัดกลุ่ม Learning/Collection/Parent/Settings ตาม brief
- Mobile child mode มี 3 tabs; parent mode มี 5 tabs การเพิ่ม IA ใหม่ต้องรักษา maximum 5 และ safe-area
- มี `:focus-visible` และ reduced-motion rules แต่ overlays ส่วนใหญ่ยังไม่มี dialog semantics, Escape handling หรือ focus trap
- motion เดิมยังมี ambient doodle drift, mascot idle, progress shine และ attention pulse ซึ่งขัดกับ art direction ใหม่ที่ให้ motion เฉพาะ feedback

ผล baseline responsive ผ่านการเปิดจริง:

| Viewport | Horizontal overflow | App shell |
|---|---:|---|
| 360×800 | ไม่มี | 360×800, mobile nav absolute |
| 390×844 | ไม่มี | 390×844, mobile nav 3 รายการ |
| 768×1024 | ไม่มี | app กว้าง 700 px, mobile/tablet nav |
| 1024×768 | ไม่มี | app กว้าง 960 px, sidebar |
| 1440×900 | ไม่มี | app กว้าง 1100 px, sidebar |

Console ไม่มี app error ใน baseline แต่มี warning ว่าใช้ Babel transformer ใน browser

### Accessibility baseline

สิ่งที่มีแล้ว:

- `<html lang="th">`, semantic header/sections บางส่วน, labels ใน forms บางจุด
- focus-visible ring กลาง, touch target 44 px สำหรับ settings และ control บางส่วน
- `role="switch"`, `aria-checked`, tablist/tab, decorative `aria-hidden`, alt text บาง media
- reduced-motion media queries และ confetti guard

ช่องว่างสำคัญ:

- overlays/sheets ไม่มีมาตรฐาน `role="dialog"`, `aria-modal`, labelled title, Escape close หรือ focus trap
- icon-only close buttons หลายจุดไม่มี accessible label
- avatar clickable wrapper เป็น `div` ไม่รองรับ keyboard โดยธรรมชาติ
- evidence/review thumbnails หลายภาพใช้ `alt=""` แม้บางภาพมีความหมาย
- heading hierarchy เริ่มที่ `h2` ในหน้าหลักและมี component headings ที่อิงรูปลักษณ์มากกว่าลำดับเอกสาร
- status บางส่วนพึ่ง emoji/color และข้อความผสม ไม่ได้ประกาศ live region
- touch target หลาย mini-controls ต่ำกว่า 44×44 px

### Asset audit

- ไม่มี directory `public/assets/freya-world/` หรือ `references/` อยู่ใน Git repository ณ baseline
- ผู้ใช้ระบุ external asset source ที่ `F:\Codex\freya-world\public\assets\freya-world`; Phase 0 ตรวจแบบ read-only และยังไม่คัดลอกเข้า repository
- external source แบ่ง folder เป็น `characters/freya`, `characters/lumi`, `decorations`, `missions`, `references`, `rewards`, `worlds` แต่ `characters/freya` และ `missions` ยังว่าง
- พบ PNG 8 ไฟล์ รวมประมาณ 16.5 MB; ทั้งหมดเป็นภาพรวมหลายชิ้นหรือ reference composition ยังไม่ใช่ production-ready individual assets

| กลุ่ม | จำนวน | ขนาด | ผลตรวจ |
|---|---:|---|---|
| `references` | 3 | 1536×1024 หนึ่งไฟล์, 1672×941 สองไฟล์ | ใช้เป็น art direction/UI reference เท่านั้น ห้ามลง production ทั้งแผ่น |
| `characters/lumi` | 1 | 1448×1086 | expression sheet 5 ท่า ต้อง crop/export แยกและตรวจ transparency |
| `decorations` | 1 | 1672×941 | decorative asset sheet หลายสิบชิ้น ต้องแยกชิ้นและตั้งชื่อ semantic |
| `rewards` | 1 | 1448×1086 | reward/item sheet 12 ชิ้น ต้องแยกชิ้นและ map กับ catalog IDs |
| `worlds` | 2 | 1672×941 | sheet 7 territories และ activity scene sheet 6 ฉาก ต้องแยกชิ้นก่อนใช้ |

- visual identity ใน production ปัจจุบันยังใช้ emoji, CSS shapes และ inline SVG เป็นหลัก ซึ่งขัดกับ art direction ที่ห้ามใช้ OS emoji เป็น identity หลัก
- `image-slot.js` ใช้ custom element สำหรับ user-supplied avatar; ไม่ใช่ production art library
- ยังไม่มี central asset path config และชื่อไฟล์ external ยังเป็นชื่อ export อัตโนมัติที่มีช่องว่าง/วงเล็บ
- ไม่มี large Base64 image ใน source; มี data-URI SVG ขนาดเล็กสำหรับ control เท่านั้น

Phase ที่เพิ่ม asset ต้องทำ asset preparation แยกจาก UI logic: crop/export รายชิ้น, ตั้งชื่อเช่น `world-life.webp`/`lumi-happy.png`, ลดขนาดตาม usage, ใช้ WebP สำหรับฉากและ PNG/SVG โปร่งใสสำหรับตัวละคร/ของตกแต่ง, ตรวจ edge/transparency, แล้วสร้าง central mapping พร้อม intrinsic dimensions/aspect/alt/loading/fallback ห้ามนำ asset sheet หรือ reference sheet ทั้งแผ่นมาแสดงใน production

### Build, lint และ test baseline

- Build command: ไม่มี; deploy static files ตรงจาก root
- Formatter command: ไม่มี
- Lint command: ไม่มี
- Test command เดิม: ไม่มี
- CI: ไม่มี
- Phase 0 เพิ่ม `tests/smoke.mjs` ซึ่งใช้ Node built-ins เท่านั้นเพื่อตรวจ app shell, script ordering, critical handlers/guards, Firebase/outbox, theme accessibility และ PWA assets

### ไฟล์ความเสี่ยงสูง

1. `fw-data.jsx` — business state/actions และ sync orchestration รวมศูนย์
2. `fw-firebase.jsx` — schema/auth/upload/outbox
3. `index.html` — global load order และ runtime CDN
4. `sw.js` — cache invalidation และ network boundary
5. `fw-curriculum.jsx` — data จำนวนมากและ keys ที่ plan progress อ้างอิง
6. `fw-rewards.jsx` — transaction UI เชื่อมหลาย collection
7. `fw-parenthub.jsx` — approval moves data ระหว่าง queue/portfolio
8. `image-slot.js` — custom persisted media behavior

## 3. ปัญหา UX/UI ปัจจุบัน

- โลกภาพยังผสมระหว่าง dashboard เดิม, cozy fantasy ใหม่ และ emoji-heavy game layer จึงยังไม่เป็น visual language เดียว
- ภาพหลักยังอิง emoji จากระบบปฏิบัติการ ทำให้รูปลักษณ์ต่างกันตาม device
- CSS มี token สองรุ่นและ inline style มาก ทำให้ hierarchy/state consistency ปรับยาก
- Kid navigation ยังไม่สะท้อน IA 5 ปลายทาง: Home, Quests, My World, Portfolio, Rewards
- Desktop sidebar ยังไม่จัดกลุ่มและยังมีลักษณะ mobile nav ที่ยืดเป็นแนวตั้ง
- Adventure Map เป็น progress visualization มากกว่า entry point: node ไม่มี CTA/detail/unlock payload และเส้นทางบน desktop ยังอ่านเป็นแผนที่ได้จำกัด
- Mission card แสดง capture UI ภายใน card ทันทีเมื่อเริ่ม ทำให้ card โตมาก; brief ต้องการรายละเอียดใน modal/drawer/detail view
- Portfolio ยังเป็น polaroid grid ไม่ใช่ Magical Memory Book/timeline และยังไม่แสดง reflection/feedback/indicator อย่างเป็นระบบ
- Parent Hub มี review/tracker/SAR ที่ใช้งานได้ แต่ยังขาด dashboard summary ตาม brief และ density/quick actions สำหรับงานตรวจจำนวนมาก
- Empty/loading/error states ไม่เป็น shared components; loading skeleton ไม่มี
- ambient motion มากกว่าที่ art direction อนุญาต และไม่มี in-app reduced-motion setting
- content มี bilingual labels มากในพื้นที่จำกัด ทำให้ลำดับอ่านและ button competition สูง

## 4. Information architecture เป้าหมาย

### Kid mode

1. Home — magical hero, recommended quest, daily summary, recent achievement
2. Quests — filters, quest list, quest detail, evidence submission
3. My World — 7 learning territories, progress, unlocks, territory detail
4. Memory Book — portfolio timeline/cards, media, reflection และ parent feedback
5. Star Shop — rewards, room/wardrobe/collections

### Parent mode

1. Overview — pending/revision/not-started, weekly summary, curriculum progress, recent activity
2. Quests — create from plan/custom, manage active quests
3. Reviews — approval queue/history
4. Curriculum — yearly tracker/group guide
5. Reports & Settings — SAR, profile, Firebase, backup/PIN

ใช้ presentation mapping แยกจาก `GROUPS` data IDs เดิมสำหรับชื่อ 7 โลกตาม brief ห้ามแก้ IDs `life/language/math/science/agri/social/art`

## 5. Design system plan

### Direction

ผู้ใช้หลักคือเด็กวัยประถมปลายที่เรียนบ้านและผู้ปกครอง งานหลักคือทำให้ “ภารกิจเรียนรู้วันนี้” เข้าใจง่ายและมีแรงใจทำต่อ ภาพจำเฉพาะของระบบคือ **สมุดแผนที่นักสำรวจที่ค่อย ๆ บันทึกเส้นทางจากภารกิจจริง** ไม่ใช่ dashboard ที่ติดองค์ประกอบแฟนตาซีเพิ่ม

Frontend Design review: brief กำหนด warm cream อยู่แล้ว จึงคงพื้น cream แต่หลีกเลี่ยง default cream/editorial look ด้วยรูปทรงเส้นทาง, map contour, stitched paper edge และภาษา visual จากเครื่องมือนักสำรวจ การเสี่ยงเชิงภาพหนึ่งจุดคือ world map ที่ทำหน้าที่เป็น navigation จริง; ส่วนอื่นต้องสงบและอ่านง่าย

### Proposed core tokens

- Blueberry `#6653C7` — primary action/navigation
- Peach `#F29B8F` — warmth/secondary emphasis
- Star `#F2C34A` — earned value only
- Cream `#FFF8EE` — base world
- Mint `#3EAE88` — success
- Coral `#E86C5B` — revision/warning
- Deep indigo `#312A46` — primary text
- Soft indigo gray `#756E86` — secondary text

Typography direction: Mitr สำหรับ display/Thai headings อย่างประหยัด, Mali หรือ system Thai sans สำหรับ body หลังตรวจ readability, utility labels ใช้ system sans ที่ชัด ไม่เพิ่ม dependency จนกว่าจะพิสูจน์ว่าฟอนต์เดิมไม่พอ

Foundations ที่ต้องรวมศูนย์: spacing, type, radius, border, shadow, container, breakpoints, z-index, motion duration/easing, 44 px touch target, focus ring และ semantic surface levels

### Shared component plan

- Button/IconButton พร้อม loading/disabled/focus
- Surface และ section layout
- Dialog/BottomSheet/SettingsSheet ที่มี focus management และ Escape
- CategoryBadge/StatusBadge/StarCounter/LevelProgress
- QuestCard/QuestDetail/EvidencePicker
- WorldNode/TerritoryDetail
- RewardCard/ConfirmationDialog
- MemoryCard/MediaViewer
- EmptyState/LoadingSkeleton/ErrorState/Toast

ห้ามเปลี่ยน action functions ใน `AppProvider` เพื่อให้เหมาะกับหน้าตา Component ใหม่ให้เรียก action เดิมและแสดงผลจาก state เดิม

## 6. Asset mapping plan

เมื่อ asset directory พร้อม ให้สร้าง central config ที่เข้ากับ static architecture เช่น `fw-assets.js` และโหลดก่อน feature components โดย mapping อย่างน้อย:

- `worlds.{groupId}.scene/node/marker`
- `mascot.base/outfits`
- `quests.fallbackByGroup`
- `shop.scene/items`
- `memory.paper/tape/stickers`
- `ui.icons/status`

ทุก entry ต้องมี `src`, intrinsic width/height, aspect ratio, alt policy, object position, eager/lazy strategy และ neutral SVG/CSS fallback ห้ามใช้ emoji fallback เป็นภาพหลัก

## 7. Implementation phases

### Phase 1 — Design System and App Shell

- reconcile legacy/new tokens โดยไม่ลบ compatibility aliases
- shared primitives, semantic overlays, focus management
- child 5-destination nav และ grouped desktop sidebar
- compact header/settings sheet, central asset config
- ลด ambient motion แต่ไม่แตะ feedback logic

### Phase 2 — Kid Home and My World

- hero เป็น map-journal entry point
- recommended quest + achievement preview
- 7 territory presentation mapping และ interactive nodes
- responsive map/path สำหรับ mobile/tablet/desktop

หมายเหตุ: HEAD มี implementation ที่เรียก Phase 1/2 แล้ว ต้องทำ gap analysis ต่อองค์ประกอบและ refactor แบบ incremental ไม่สร้างซ้ำทั้งหน้า

### Phase 3 — Quest Experience

- แยก quest list/detail/submission
- filters และ status taxonomy
- รักษา EvidencePicker/upload/outbox และ state machine เดิม
- loading/offline/retry/error states

### Phase 4 — Reward Shop

- เปลี่ยน emoji art เป็น mapped assets/fallback shapes
- รักษา guard และ transaction actions เดิม
- ตรวจ owned/locked/confirmation/celebration/room/wardrobe end-to-end

### Phase 5 — Magical Memory Book

- desktop two-column journal/timeline; mobile vertical cards
- media, mission, reflection, parent feedback, category, indicators, achievement
- preserve portfolio data/media fields และ SAR consumers

### Phase 6 — Parent Experience

- overview dashboard + review density + quick actions
- grouped desktop IA และ tablet data presentation
- ไม่เปลี่ยน PIN/Auth/Firebase schema โดยไม่มี issue แยก

### Phase 7 — Polish and Validation

- accessibility/responsive/performance audit
- reduced-motion setting ถ้าปลอดภัยต่อ architecture
- shared empty/loading/error states
- browser/console/Firebase regression pass และ documentation

## 8. Test plan

หลังทุก Phase:

1. `node tests/smoke.mjs`
2. รัน formatter/lint/build เมื่อ repository มีคำสั่งเหล่านั้น; ถ้ายังไม่มีให้รายงานว่าไม่มี ห้ามอ้างว่าผ่าน
3. เปิด app อย่างน้อย 360×800, 390×844, 768×1024, 1024×768, 1440×900
4. ตรวจ console และ service worker update
5. ทดสอบ critical workflow ด้วยข้อมูลแยก: create → accept → attach → submit → approve และ reject/resubmit
6. ตรวจดาวก่อน/หลัง approval และซื้อ reward ทั้งกรณีพอ/ไม่พอ
7. ทดสอบ Firebase สอง client เฉพาะ Phase ที่แตะ state/UI ที่ sync
8. ทดสอบ offline evidence outbox และ reload โดยไม่เขียน blob URL ลง cloud state
9. keyboard-only, Escape/focus restore, screen reader naming, reduced motion
10. บันทึกผล/ข้อจำกัดใน `docs/magical-learning-adventure-progress.md`

Smoke test Phase 0 เป็น source-level safety net ไม่ทดแทน browser interaction หรือ Firebase integration test

## 9. Rollback plan

- หนึ่ง commit ต่อ Phase และห้ามรวม schema/runtime migration กับ visual redesign
- ก่อน Phase ให้ tag/บันทึก baseline commit และ service-worker cache version
- ถ้า validation ไม่ผ่าน ให้ revert เฉพาะ commit ของ Phase นั้น ไม่ force-reset history
- รักษา compatibility aliases ของ CSS และ data field เดิมอย่างน้อยหนึ่ง Phase
- asset/config ใหม่ต้องมี fallback ไปยัง UI เดิมโดยไม่ทำ transaction/action เปลี่ยน
- หากแตะ service worker ต้อง bump cache version และยืนยันว่า Firestore/Storage/Auth ยัง bypass
- หากพบ Firebase regression ให้หยุด Phase และย้อน UI adapter ก่อนแก้ schema

## 10. Phase 0 exit criteria

- repository audit และ implementation plan ถูกบันทึกแล้ว
- baseline app เปิดได้ใน mobile/desktop โดยไม่มี app console error
- source smoke test ครอบคลุม file/load order/critical logic/PWA
- ไม่มี visual production หรือ business logic ถูกแก้
- build/lint/formatter ถูกบันทึกชัดว่าไม่มีใน baseline
- Phase 1 ต้องรอการตรวจเอกสารนี้ก่อนเริ่ม

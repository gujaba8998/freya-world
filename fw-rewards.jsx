/* fw-rewards.jsx — Reward Store & Wallet tab */
const { useState: useStateR } = React;

// Computes a display label from a real timestamp. Old wallet entries
// (created before this fix) only have a frozen `day: 'นี้'` string and no
// `ts` — fall back to showing that so old history doesn't break or lie.
function formatWalletDay(w) {
  if (!w.ts) return w.day || '—';
  const diffDays = Math.floor((Date.now() - w.ts) / 86400000);
  if (diffDays <= 0) return 'วันนี้';
  if (diffDays === 1) return 'เมื่อวาน';
  if (diffDays < 7) return `${diffDays} วันก่อน`;
  const d = new Date(w.ts);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
}

/* =========================================================
   Freya's Room — furniture catalog (client-side only; IDs sync)
   Phase 1 uses emoji art. To upgrade any item to real artwork later,
   add `img: 'url'` to it — the renderer prefers img over emoji.
   ========================================================= */
const ROOM_ITEMS = [
  // เฟอร์นิเจอร์หลัก
  { id: 'bed',      emoji: '🛏️', th: 'เตียงนุ่มนิ่ม',   en: 'Cozy bed',      cost: 60 },
  { id: 'sofa',     emoji: '🛋️', th: 'โซฟา',            en: 'Sofa',          cost: 50 },
  { id: 'chair',    emoji: '🪑', th: 'เก้าอี้',          en: 'Chair',         cost: 25 },
  { id: 'lamp',     emoji: '💡', th: 'โคมไฟ',           en: 'Lamp',          cost: 30 },
  { id: 'mirror',   emoji: '🪞', th: 'กระจกแต่งตัว',    en: 'Mirror',        cost: 35 },
  // ของตกแต่ง
  { id: 'plant',    emoji: '🪴', th: 'ต้นไม้กระถาง',    en: 'Potted plant',  cost: 20 },
  { id: 'flowers',  emoji: '💐', th: 'แจกันดอกไม้',     en: 'Flowers',       cost: 20 },
  { id: 'picture',  emoji: '🖼️', th: 'กรอบรูป',         en: 'Picture frame', cost: 25 },
  { id: 'clock',    emoji: '⏰', th: 'นาฬิกาปลุก',      en: 'Alarm clock',   cost: 15 },
  { id: 'rainbow',  emoji: '🌈', th: 'สายรุ้งติดผนัง',  en: 'Rainbow decor', cost: 40 },
  { id: 'stars',    emoji: '🌟', th: 'ดาวเรืองแสง',     en: 'Glow stars',    cost: 30 },
  // มุมเล่น/มุมอ่าน
  { id: 'books',    emoji: '📚', th: 'ชั้นหนังสือ',      en: 'Bookshelf',     cost: 45 },
  { id: 'teddy',    emoji: '🧸', th: 'ตุ๊กตาหมี',        en: 'Teddy bear',    cost: 35 },
  { id: 'piano',    emoji: '🎹', th: 'เปียโนจิ๋ว',       en: 'Mini piano',    cost: 80 },
  { id: 'easel',    emoji: '🎨', th: 'ขาตั้งวาดรูป',    en: 'Art easel',     cost: 55 },
  { id: 'fishtank', emoji: '🐠', th: 'ตู้ปลา',           en: 'Fish tank',     cost: 70 },
];
const ROOM_SLOTS = ['w1','w2','w3','w4','f1','f2','f3','f4','g1','g2','g3','g4']; // wall row · floor row · ground row
const roomItemById = (id) => ROOM_ITEMS.find(i => i.id === id);

function RoomItemArt({ item, size = 34 }) {
  if (!item) return null;
  return item.img
    ? <img src={item.img} alt={item.th} style={{ width: size, height: size, objectFit: 'contain' }} />
    : <span style={{ fontSize: size, lineHeight: 1 }}>{item.emoji}</span>;
}

function RoomWalker() {
  const { profile } = useApp();
  const isCustom = profile.avatar === 'custom';
  return (
    <>
      <style>{`
        @keyframes fw-walk-cycle {
          0%   { left: 6%;  transform: scaleX(1); }
          45%  { left: 80%; transform: scaleX(1); }
          50%  { left: 80%; transform: scaleX(-1); }
          95%  { left: 6%;  transform: scaleX(-1); }
          100% { left: 6%;  transform: scaleX(1); }
        }
        @keyframes fw-walk-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
      <div style={{
        position: 'absolute', bottom: 8, left: '6%', zIndex: 5, pointerEvents: 'none',
        animation: 'fw-walk-cycle 16s ease-in-out infinite',
        filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.28))',
      }}>
        <div style={{ animation: 'fw-walk-bob 0.55s ease-in-out infinite' }}>
          {isCustom
            ? <image-slot id="avatar-photo" shape="circle" style={{ width: 30, height: 30, display: 'block' }} placeholder="📷" />
            : <span style={{ fontSize: 30, lineHeight: 1 }}>{profile.avatar || '🐰'}</span>}
        </div>
      </div>
    </>
  );
}

function FreyaRoom() {
  const { room, placeRoomItem, beep } = useApp();
  const [pickSlot, setPickSlot] = useStateR(null); // slotId being edited
  const placedIds = Object.values(room.placed);
  const ownedItems = room.owned.map(roomItemById).filter(Boolean);

  return (
    <div className="card" style={{ padding: 14 }}>
      {/* the room: wall / floor / ground rows */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)', position: 'relative',
        background: 'linear-gradient(180deg, #ffeef7 0%, #ffeef7 55%, #ffe3c9 55%, #ffd9b8 100%)',
      }}>
        <RoomWalker />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: 12 }}>
          {ROOM_SLOTS.map(slotId => {
            const item = roomItemById(room.placed[slotId]);
            return (
              <button key={slotId} onClick={() => { setPickSlot(slotId); beep('tab'); }}
                style={{
                  aspectRatio: '1', borderRadius: 12, display: 'grid', placeItems: 'center',
                  border: item ? 'none' : '2px dashed rgba(0,0,0,.12)',
                  background: item ? 'rgba(255,255,255,.4)' : 'transparent', cursor: 'pointer',
                }}>
                {item ? <RoomItemArt item={item} /> : <span style={{ fontSize: 14, opacity: .3 }}>＋</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 8, textAlign: 'center' }}>
        แตะช่องเพื่อวาง/ย้าย/เก็บของ · ซื้อของใหม่ได้ที่ร้านด้านล่าง
      </div>

      {/* slot item picker */}
      {pickSlot && (
        <AppOverlayPortal>
        <div className="overlay" onClick={() => setPickSlot(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="sheet-grab"></div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>เลือกของมาวางตรงนี้</div>
            {ownedItems.length === 0 ? (
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', padding: '14px 0', textAlign: 'center' }}>
                ยังไม่มีของเลย — สะสมดาวไปซื้อที่ร้านด้านล่างก่อนนะ 🛒
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {ownedItems.map(item => (
                  <button key={item.id} className="card" style={{ padding: 10, display: 'grid', placeItems: 'center', gap: 4, cursor: 'pointer', opacity: placedIds.includes(item.id) && room.placed[pickSlot] !== item.id ? .45 : 1 }}
                    onClick={() => { placeRoomItem(pickSlot, item.id); setPickSlot(null); }}>
                    <RoomItemArt item={item} size={28} />
                    <span style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{item.th}</span>
                  </button>
                ))}
              </div>
            )}
            {room.placed[pickSlot] && (
              <button className="btn ghost block" style={{ marginTop: 12 }}
                onClick={() => { placeRoomItem(pickSlot, null); setPickSlot(null); }}>
                เก็บของชิ้นนี้ออก
              </button>
            )}
          </div>
        </div>
        </AppOverlayPortal>
      )}
    </div>
  );
}

function RoomShop() {
  const { stars, room, buyRoomItem } = useApp();
  return (
    <div className="rewards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {ROOM_ITEMS.map(item => {
        const owned = room.owned.includes(item.id);
        const can = stars >= item.cost;
        return (
          <div key={item.id} className="card reward-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
            <RoomItemArt item={item} size={38} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{item.th}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{item.en}</div>
            </div>
            {owned ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--good)' }}>✓ มีแล้ว</span>
            ) : (
              <>
                <span className="starpill" style={{ fontSize: 12.5 }}>⭐ {item.cost}</span>
                <button onClick={() => buyRoomItem(item)} className={'btn' + (can ? '' : ' ghost')} style={{ width: '100%', padding: '9px', fontSize: 13.5 }} disabled={!can}>
                  {can ? 'ซื้อเลย!' : 'ดาวไม่พอ'}
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   Weekly Loot Box — ทำภารกิจครบ LOOT_GOAL ในสัปดาห์ → เปิดกล่องสุ่มสติกเกอร์
   Catalog + rarity weights live client-side; only collected IDs sync.
   ========================================================= */
const STICKERS = [
  { id: 'st_straw',   emoji: '🍓', th: 'สตรอว์เบอร์รี', rarity: 'c' },
  { id: 'st_daisy',   emoji: '🌼', th: 'ดอกเดซี่',      rarity: 'c' },
  { id: 'st_lady',    emoji: '🐞', th: 'เต่าทอง',       rarity: 'c' },
  { id: 'st_clover',  emoji: '🍀', th: 'โคลเวอร์',      rarity: 'c' },
  { id: 'st_donut',   emoji: '🍩', th: 'โดนัท',         rarity: 'c' },
  { id: 'st_chick',   emoji: '🐣', th: 'ลูกเจี๊ยบ',      rarity: 'c' },
  { id: 'st_uni',     emoji: '🦄', th: 'ยูนิคอร์น',     rarity: 'r' },
  { id: 'st_rainbow', emoji: '🌈', th: 'สายรุ้ง',        rarity: 'r' },
  { id: 'st_rocket',  emoji: '🚀', th: 'จรวด',          rarity: 'r' },
  { id: 'st_dolphin', emoji: '🐬', th: 'โลมา',          rarity: 'r' },
  { id: 'st_mermaid', emoji: '🧜‍♀️', th: 'นางเงือก',     rarity: 'r' },
  { id: 'st_dragon',  emoji: '🐉', th: 'มังกร',         rarity: 'e' },
  { id: 'st_crown',   emoji: '👑', th: 'มงกุฎทอง',      rarity: 'e' },
  { id: 'st_castle',  emoji: '🏰', th: 'ปราสาท',        rarity: 'e' },
];
const RARITY = {
  c: { th: 'ทั่วไป',    color: '#8fd694', w: 60 },
  r: { th: 'หายาก',     color: '#7fb1ff', w: 30 },
  e: { th: 'สุดพิเศษ!', color: '#c3a3ff', w: 10 },
};
function rollSticker() {
  const roll = Math.random() * 100;
  const rarity = roll < RARITY.e.w ? 'e' : roll < RARITY.e.w + RARITY.r.w ? 'r' : 'c';
  const pool = STICKERS.filter(s => s.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function LootBox() {
  const { lootbox, claimLootbox } = useApp();
  const [reveal, setReveal] = useStateR(null);
  const wk = weekKey();
  const done = lootbox.week === wk ? (lootbox.done || 0) : 0;
  const opened = lootbox.lastOpen === wk;
  const ready = done >= LOOT_GOAL && !opened;
  const open = () => {
    const st = rollSticker();
    if (claimLootbox(st.id)) setReveal(st);
  };
  return (
    <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
      <span className={'loot-emoji' + (ready ? ' ready' : '')}>{opened ? '📭' : '🎁'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>กล่องสุ่มประจำสัปดาห์</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 6 }}>
          {opened ? 'เปิดไปแล้วสัปดาห์นี้ — สัปดาห์หน้ามาใหม่นะ!'
            : ready ? 'พร้อมเปิดแล้ว! ข้างในมีสติกเกอร์อะไรน้า~'
            : `ทำภารกิจสำเร็จอีก ${LOOT_GOAL - done} ครั้งเพื่อเปิดกล่อง`}
        </div>
        <div className="loot-bar"><b style={{ width: Math.min(100, (done / LOOT_GOAL) * 100) + '%' }}></b></div>
        <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 4 }}>ภารกิจสัปดาห์นี้ {Math.min(done, LOOT_GOAL)}/{LOOT_GOAL}</div>
      </div>
      {ready && <button className="btn" style={{ flex: 'none', padding: '10px 16px' }} onClick={open}>เปิด!</button>}

      {reveal && (
        <AppOverlayPortal>
        <div className="loot-reveal" onClick={() => setReveal(null)}>
          <div className="loot-reveal-card" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>ได้สติกเกอร์ใหม่!</div>
            <span className="loot-sticker">{reveal.emoji}</span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{reveal.th}</div>
            <span className="rarity-chip" style={{ background: RARITY[reveal.rarity].color }}>{RARITY[reveal.rarity].th}</span>
            <button className="btn" style={{ marginTop: 8, padding: '9px 22px' }} onClick={() => setReveal(null)}>เก็บเข้าอัลบั้ม 📒</button>
          </div>
        </div>
        </AppOverlayPortal>
      )}
    </div>
  );
}

function StickerAlbum() {
  const { stickers } = useApp();
  const counts = {};
  stickers.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  const ownedKinds = STICKERS.filter(s => counts[s.id]).length;
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 10 }}>
        สะสมแล้ว {ownedKinds}/{STICKERS.length} แบบ · ได้จากกล่องสุ่มทุกสัปดาห์
      </div>
      <div className="sticker-grid">
        {STICKERS.map(s => {
          const n = counts[s.id] || 0;
          return (
            <div key={s.id} className={'sticker-cell' + (n ? '' : ' off')} title={n ? `${s.th} × ${n}` : '???'}>
              <span className="st-emoji">{s.emoji}</span>
              <span className="st-name">{n ? s.th : '???'}</span>
              {n > 1 && <span className="st-count">×{n}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Mascot Wardrobe — ซื้อ/สวมชุดให้มาสคอต (ของแลกไม่มีต้นทุนจริง)
   ========================================================= */
function MascotWardrobe() {
  const { level, mascotFit, wearMascotItem } = useApp();
  const ownedItems = MASCOT_ITEMS.filter(i => mascotFit.owned.includes(i.id));
  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 92, height: 92, borderRadius: 24, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)' }}>
          <DressedMascot size={54} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>เพื่อนคู่ใจของเฟรยา</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>โตขึ้นตามเลเวล · ตอนนี้ Level {level}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>มีชุดแล้ว {ownedItems.length}/{MASCOT_ITEMS.length} ชิ้น</div>
        </div>
      </div>

      {/* owned: tap to wear / take off */}
      {ownedItems.length > 0 ? (
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 7 }}>แตะเพื่อใส่/ถอด</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {ownedItems.map(item => {
              const on = mascotFit.worn[item.slot] === item.id;
              return (
                <button key={item.id} className={'fit-chip' + (on ? ' on' : '')} onClick={() => wearMascotItem(item)}>
                  {item.emoji} {item.th}{on ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
          ยังไม่มีชุดเลย — แวะดูชั้น "ชุดมาสคอต" ที่ร้านดาวด้านบนได้นะ 🎀
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Freya's Star Shop — หน้าร้านแฟนตาซีรวมของ 3 หมวดในที่เดียว
   Reuses buyRoomItem / buyMascotItem / redeem unchanged; the shop is
   pure presentation: shelves → preview sheet (confirm) → chest celebration.
   ========================================================= */
const SHOP_TABS = [
  { id: 'room', th: 'ของแต่งห้อง', icon: 'bed' },
  { id: 'fit',  th: 'ชุดมาสคอต',  icon: 'shirt' },
  { id: 'real', th: 'รางวัลจริง',  icon: 'gift' },
];

function ItemPreviewSheet({ p, onClose, onBuy }) {
  const { stars } = useApp();
  const { kind, item } = p;
  const afford = stars >= item.cost;
  const missing = item.cost - stars;
  const desc = kind === 'room' ? 'ซื้อแล้วนำไปวาง ย้าย จัดมุมในห้องของเฟรยาได้เลย'
    : kind === 'fit' ? `ชุดของเพื่อนคู่ใจ (${item.slot === 'hat' ? 'สวมบนหัว' : 'ของถือคู่กาย'}) · ซื้อแล้วใส่ให้ทันที`
    : 'รางวัลพิเศษจากคุณแม่ · แลกแล้วไปบอกคุณแม่ได้เลยนะ';
  return (
    <AppOverlayPortal>
      <div className="overlay" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-grab"></div>
          <div className="pv-art">{item.emoji}</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--ink)' }}>{item.th}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{item.en}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.55 }}>{desc}</div>
          {afford ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 'none' }} onClick={onClose}>ยกเลิก</button>
              <button className="btn block" onClick={() => onBuy(p)}>
                {kind === 'real' ? 'แลกเลย' : 'ซื้อเลย'} · {item.cost} ⭐
              </button>
            </div>
          ) : (
            <>
              <div className="pv-soft">เก็บดาวอีก {missing} ดวงก็ได้แล้ว สู้ๆ นะ! 💪</div>
              <button className="btn ghost block" onClick={onClose}>ไว้มาใหม่</button>
            </>
          )}
        </div>
      </div>
    </AppOverlayPortal>
  );
}

function PurchaseCelebration({ p, onClose }) {
  const { beep } = useApp();
  const { kind, item } = p;
  const goRoom = () => {
    onClose(); beep('tab');
    const el = document.getElementById('freya-room');
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView(reduce ? {} : { behavior: 'smooth', block: 'start' });
  };
  return (
    <AppOverlayPortal>
      <div className="loot-reveal" onClick={onClose}>
        <div className="loot-reveal-card" onClick={e => e.stopPropagation()}>
          <div className="chest-scene" aria-hidden="true">
            <span className="chest-glow" />
            <span className="chest-item">{item.emoji}</span>
            <div className="chest">
              <div className="chest-lid" />
              <div className="chest-base" />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--ink)' }}>
            ได้ {item.th} มาแล้ว!
          </div>
          {kind === 'fit' && <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>ใส่ให้เพื่อนคู่ใจเรียบร้อยแล้วนะ</div>}
          {kind === 'real' && <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>ไปบอกคุณแม่ได้เลยนะ 💛</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {kind === 'room' && <button className="btn" style={{ padding: '9px 18px' }} onClick={goRoom}>ไปจัดห้อง 🏠</button>}
            <button className={kind === 'room' ? 'btn ghost' : 'btn'} style={{ padding: '9px 18px' }} onClick={onClose}>
              {kind === 'room' ? 'เก็บไว้ก่อน' : 'เย้! 🎉'}
            </button>
          </div>
        </div>
      </div>
    </AppOverlayPortal>
  );
}

function StarShop() {
  const { stars, room, mascotFit, rewards, parentMode, buyRoomItem, buyMascotItem, redeem, addReward, beep, showToast } = useApp();
  const [tab, setTab] = useStateR('room');
  const [preview, setPreview] = useStateR(null);   // { kind, item } being inspected
  const [won, setWon] = useStateR(null);           // { kind, item } just purchased

  const entries = tab === 'room'
    ? ROOM_ITEMS.map(item => ({ kind: 'room', item, owned: room.owned.includes(item.id) }))
    : tab === 'fit'
      ? MASCOT_ITEMS.map(item => ({ kind: 'fit', item, owned: mascotFit.owned.includes(item.id) }))
      : rewards.map(item => ({ kind: 'real', item, owned: false }));

  const confirmBuy = (p) => {
    // preview sheet only offers this when affordable; buy fns re-validate anyway
    if (p.kind === 'room') buyRoomItem(p.item);
    else if (p.kind === 'fit') buyMascotItem(p.item);
    else redeem(p.item);
    setPreview(null);
    setWon(p);
  };

  return (
    <div className="shop-front">
      <div className="shop-awning" aria-hidden="true"></div>
      <div className="shop-head">
        <div className="shop-sign">⭐ ร้านดาวของเฟรยา<span>Freya's Star Shop</span></div>
        <span className="shop-purse">⭐ {stars}</span>
      </div>
      <div className="shop-keeper">
        <DressedMascot size={38} />
        <span className="shop-keeper-bubble">ยินดีต้อนรับค่า~ วันนี้รับอะไรดีคะ?</span>
      </div>
      <div className="shop-tabs" role="tablist">
        {SHOP_TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id}
            className={'shop-tab' + (tab === t.id ? ' on' : '')}
            onClick={() => { setTab(t.id); beep('tab'); }}>
            <FwIcon name={t.icon} size={14} /> {t.th}
          </button>
        ))}
      </div>

      {/* คุณแม่จัดการรางวัลจริงได้จากชั้นวางโดยตรง */}
      {tab === 'real' && parentMode ? (
        <div style={{ padding: '14px 14px 20px' }}>
          <div className="rewards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {rewards.map(r => <RewardCard key={r.id} r={r} />)}
            <button className="card rw-add" onClick={addReward}>
              <span style={{ fontSize: 30 }}>＋</span>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>เพิ่มรางวัล</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="shop-shelf">
          {entries.map(({ kind, item, owned }) => (
            <button key={item.id} className={'shelf-item' + (owned ? ' owned' : '')}
              onClick={() => {
                if (owned) { showToast('มีชิ้นนี้แล้ว · Already owned', item.emoji); beep('tab'); return; }
                setPreview({ kind, item }); beep('tab');
              }}>
              <span className="shelf-art">{item.emoji}</span>
              <span className="shelf-name">{item.th}</span>
              {owned
                ? <span className="shelf-state ok">✓ มีแล้ว</span>
                : stars >= item.cost
                  ? <span className="shelf-price">⭐ {item.cost}</span>
                  : <span className="shelf-state soft">อีก {item.cost - stars} ⭐</span>}
            </button>
          ))}
        </div>
      )}

      {preview && <ItemPreviewSheet p={preview} onClose={() => setPreview(null)} onBuy={confirmBuy} />}
      {won && <PurchaseCelebration p={won} onClose={() => setWon(null)} />}
    </div>
  );
}

function RewardCard({ r }) {
  const { stars, redeem, parentMode, setRewardCost, updateReward, removeReward, beep } = useApp();
  const can = stars >= r.cost;
  const [editing, setEditing] = useStateR(false);

  return (
    <div className="card reward-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', position: 'relative' }}>
      {parentMode && (
        <button className="rw-del" title="ลบรางวัล" onClick={() => removeReward(r.id)}>✕</button>
      )}
      <div style={{ fontSize: 38, lineHeight: 1 }}>{r.emoji}</div>
      <div style={{ width: '100%' }}>
        {parentMode && editing ? (
          <input className="rw-name-input" value={r.th} autoFocus
            onChange={e => updateReward(r.id, { th: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={e => { if (e.key === 'Enter') setEditing(false); }} />
        ) : (
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', cursor: parentMode ? 'text' : 'default' }}
            onClick={() => parentMode && setEditing(true)}>{r.th}{parentMode && ' ✎'}</div>
        )}
        <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{r.en}</div>
      </div>

      {parentMode ? (
        <div className="rw-cost-edit">
          <button className="rw-step" onClick={() => setRewardCost(r.id, -5)} aria-label="ลดราคา">−</button>
          <span className="starpill" style={{ fontSize: 12.5 }}>⭐ {r.cost}</span>
          <button className="rw-step" onClick={() => setRewardCost(r.id, +5)} aria-label="เพิ่มราคา">+</button>
        </div>
      ) : (
        <>
          <span className="starpill" style={{ fontSize: 12.5 }}>⭐ {r.cost}</span>
          <button onClick={() => redeem(r)} className={'btn' + (can ? '' : ' ghost')} style={{ width: '100%', padding: '9px', fontSize: 13.5 }} disabled={!can}>
            {can ? 'แลกรางวัล' : 'ดาวไม่พอ'}
          </button>
        </>
      )}
    </div>
  );
}

function Wallet() {
  const { wallet } = useApp();
  const income = wallet.filter(w => w.amount > 0).reduce((s, w) => s + w.amount, 0);
  const spent = wallet.filter(w => w.amount < 0).reduce((s, w) => s + Math.abs(w.amount), 0);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>ได้รับ · Earned</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--good)' }}>+{income} ⭐</div>
        </div>
        <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>ใช้ไป · Spent</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--accent-deep)' }}>−{spent} ⭐</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {wallet.slice(0, 6).map(w => (
          <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 4px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, flex: 'none', display: 'grid', placeItems: 'center', background: w.amount > 0 ? 'color-mix(in oklab, var(--good) 22%, transparent)' : 'var(--accent-soft)', fontSize: 13 }}>{w.amount > 0 ? '⬆️' : '⬇️'}</span>
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink)' }}>{w.label}</span>
            <span style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{formatWalletDay(w)}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: w.amount > 0 ? 'var(--good)' : 'var(--accent-deep)' }}>{w.amount > 0 ? '+' : ''}{w.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rewards() {
  const { parentMode } = useApp();
  return (
    <div className="tab-enter" style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* the storefront — all three categories, balance purse, preview + chest */}
      <StarShop />

      <div>
        <div className="sec-h">
          <h3><FwIcon name="package" /> กล่องสุ่มรางวัล</h3>
          <span className="sub">Weekly Surprise Box</span>
        </div>
        <LootBox />
      </div>

      <div id="freya-room">
        <div className="sec-h">
          <h3><FwIcon name="bed" /> ห้องของเฟรยา</h3>
          <span className="sub">My Room · ของที่ซื้อมาวางที่นี่</span>
        </div>
        <FreyaRoom />
      </div>

      <div>
        <div className="sec-h">
          <h3><FwIcon name="shirt" /> เพื่อนคู่ใจ</h3>
          <span className="sub">Mascot Wardrobe</span>
        </div>
        <MascotWardrobe />
      </div>

      <div>
        <div className="sec-h">
          <h3><FwIcon name="star" /> อัลบั้มสติกเกอร์</h3>
          <span className="sub">Sticker Album</span>
        </div>
        <StickerAlbum />
      </div>

      <div>
        <div className="sec-h"><h3><FwIcon name="wallet" /> กระเป๋าเงิน</h3><span className="sub">Wallet · เรียนรู้การออม</span></div>
        <Wallet />
      </div>
    </div>
  );
}

Object.assign(window, { Rewards, STICKERS, RARITY });

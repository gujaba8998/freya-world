/* fw-rewards.jsx — Reward Store & Wallet tab */
const { useState: useStateR } = React;

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
            <span style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{w.day}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: w.amount > 0 ? 'var(--good)' : 'var(--accent-deep)' }}>{w.amount > 0 ? '+' : ''}{w.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rewards() {
  const { stars, rewards, parentMode, addReward } = useApp();
  return (
    <div className="tab-enter" style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* balance banner */}
      <div className="card" style={{ padding: 16, background: 'var(--header-grad)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 36 }} className="floaty">🪙</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, opacity: .92 }}>ดาวสะสมของเฟรยา · My Stars</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textShadow: '0 1px 2px rgba(0,0,0,.12)' }}>{stars} ⭐</div>
        </div>
      </div>

      <div>
        <div className="sec-h">
          <h3>🏠 ห้องของเฟรยา</h3>
          <span className="sub">My Room · แต่งห้องด้วยดาวที่สะสม</span>
        </div>
        <FreyaRoom />
      </div>

      <div>
        <div className="sec-h">
          <h3>🛒 ร้านของแต่งห้อง</h3>
          <span className="sub">Furniture Shop</span>
        </div>
        <RoomShop />
      </div>

      <div>
        <div className="sec-h">
          <h3>🎁 ร้านแลกรางวัล</h3>
          <span className="sub">{parentMode ? 'แตะ ✎ แก้ชื่อ · กด +/− ปรับราคา' : 'Reward Store'}</span>
        </div>
        <div className="rewards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {rewards.map(r => <RewardCard key={r.id} r={r} />)}
          {parentMode && (
            <button className="card rw-add" onClick={addReward}>
              <span style={{ fontSize: 30 }}>＋</span>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>เพิ่มรางวัล</span>
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="sec-h"><h3>👛 กระเป๋าเงิน</h3><span className="sub">Wallet · เรียนรู้การออม</span></div>
        <Wallet />
      </div>
    </div>
  );
}

Object.assign(window, { Rewards });

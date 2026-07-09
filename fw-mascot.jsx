/* fw-mascot.jsx — companion mascot: Freya's chosen avatar lives in the corner,
   greets per-tab, drops tips, and cheers when tapped. Hidden in parent mode. */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

const MASCOT_MSGS = {
  home: [
    'วันนี้มีภารกิจอะไรน่าสนุกนะ~ 🎯',
    'กดรับภารกิจแล้วลุยกันเลย!',
    'ทำทีละอย่าง เดี๋ยวก็ครบ! 💪',
  ],
  portfolio: [
    'ว้าว! ผลงานของหนูสวยมากเลย 🖼️',
    'สะสมผลงานไว้เยอะๆ นะ~',
  ],
  rewards: [
    'เก็บดาวแลกของรางวัลกัน! ⭐',
    'อีกนิดเดียวก็ได้รางวัลแล้วน้า~',
  ],
  activity: ['เลือกกิจกรรมสนุกๆ ให้หนูหน่อยนะคะ 📋'],
  parent: ['วันนี้เฟรยาเก่งมากเลยค่ะ 💖'],
};

const MASCOT_TAPS = [
  'สู้ๆ นะ! 💪', 'หนูเก่งที่สุดเลย! ✨', 'วันนี้ก็น่ารักเหมือนเดิม~ 💖',
  'ไปลุยภารกิจกัน! 🎯', 'เก็บดาวเยอะๆ นะ! ⭐', 'เย้ๆ! 🎉',
];

/* ---------------- mascot wardrobe (Tamagotchi-style) ----------------
   Catalog lives client-side; only owned/worn item IDs sync to Firestore.
   slot 'hat' sits on the head, slot 'held' floats at the mascot's side. */
const MASCOT_ITEMS = [
  { id: 'crown',    emoji: '👑', th: 'มงกุฎ',         en: 'Crown',       slot: 'hat',  cost: 80 },
  { id: 'bow',      emoji: '🎀', th: 'โบว์',           en: 'Bow',         slot: 'hat',  cost: 30 },
  { id: 'cap',      emoji: '🧢', th: 'หมวกแก๊ป',      en: 'Cap',         slot: 'hat',  cost: 35 },
  { id: 'tophat',   emoji: '🎩', th: 'หมวกวิเศษ',     en: 'Magic hat',   slot: 'hat',  cost: 55 },
  { id: 'flower',   emoji: '🌸', th: 'ดอกไม้ทัดหู',   en: 'Flower',      slot: 'hat',  cost: 25 },
  { id: 'wand',     emoji: '🪄', th: 'ไม้กายสิทธิ์',  en: 'Magic wand',  slot: 'held', cost: 45 },
  { id: 'balloon',  emoji: '🎈', th: 'ลูกโป่ง',        en: 'Balloon',     slot: 'held', cost: 25 },
  { id: 'guitar',   emoji: '🎸', th: 'กีตาร์จิ๋ว',     en: 'Mini guitar', slot: 'held', cost: 60 },
  { id: 'flag',     emoji: '🚩', th: 'ธงเชียร์',       en: 'Cheer flag',  slot: 'held', cost: 20 },
  { id: 'icecream', emoji: '🍦', th: 'ไอศกรีม',       en: 'Ice cream',   slot: 'held', cost: 15 },
];
const MASCOT_ITEM = Object.fromEntries(MASCOT_ITEMS.map(i => [i.id, i]));

/* Mascot + worn outfit, grows slightly with level (caps at +40%). */
function DressedMascot({ size = 30, style }) {
  const { profile, mascotFit, level } = useApp();
  const grow = 1 + Math.min((level || 1) - 1, 10) * 0.04;
  const s = Math.round(size * grow);
  const isCustom = profile.avatar === 'custom';
  const worn = (mascotFit && mascotFit.worn) || {};
  const hat = MASCOT_ITEM[worn.hat], held = MASCOT_ITEM[worn.held];
  return (
    <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1, fontSize: s, ...style }}>
      {isCustom
        ? <image-slot id="avatar-photo" shape="circle" style={{ width: s, height: s, display: 'block' }} placeholder="🐰" />
        : (profile.avatar || '🐰')}
      {hat && <span style={{ position: 'absolute', top: -s * 0.42, left: '50%', transform: 'translateX(-50%) rotate(-10deg)', fontSize: s * 0.55, pointerEvents: 'none' }}>{hat.emoji}</span>}
      {held && <span style={{ position: 'absolute', bottom: -s * 0.08, right: -s * 0.3, fontSize: s * 0.5, pointerEvents: 'none' }}>{held.emoji}</span>}
    </span>
  );
}

function MascotBuddy({ tab }) {
  const { profile, beep } = useApp();
  const [msg, setMsg] = useStateM(null);
  const [hop, setHop] = useStateM(0);
  const hideT = useRefM(null);

  // greeting bubble is fixed-position (bottom-right corner) so on tabs with
  // taller content it can land on top of a section heading; keep it brief
  // so that's a flash, not a blocker, for readers taking their time.
  const say = (text, dur = 2600) => {
    setMsg(text);
    clearTimeout(hideT.current);
    hideT.current = setTimeout(() => setMsg(null), dur);
  };

  // greet on tab change
  useEffectM(() => {
    const list = MASCOT_MSGS[tab] || MASCOT_MSGS.home;
    say(list[Math.floor(Math.random() * list.length)]);
  }, [tab]);
  useEffectM(() => () => clearTimeout(hideT.current), []);

  const tap = () => {
    beep('pop');
    setHop(h => h + 1);
    say(MASCOT_TAPS[Math.floor(Math.random() * MASCOT_TAPS.length)], 3500);
  };

  return (
    <div className="mascot-wrap">
      {msg && <div className="mascot-bubble" key={msg}>{msg}</div>}
      <button className="mascot" key={hop} onClick={tap} aria-label="เพื่อนคู่ใจ"><DressedMascot size={30} /></button>
    </div>
  );
}

Object.assign(window, { MascotBuddy, MASCOT_ITEMS, MASCOT_ITEM, DressedMascot });

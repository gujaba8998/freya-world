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

function MascotBuddy({ tab }) {
  const { profile, beep } = useApp();
  const emoji = profile.avatar && profile.avatar !== 'custom' ? profile.avatar : '🐰';
  const [msg, setMsg] = useStateM(null);
  const [hop, setHop] = useStateM(0);
  const hideT = useRefM(null);

  const say = (text, dur = 5000) => {
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
      <button className="mascot" key={hop} onClick={tap} aria-label="เพื่อนคู่ใจ">{emoji}</button>
    </div>
  );
}

Object.assign(window, { MascotBuddy });

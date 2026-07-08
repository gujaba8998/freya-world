/* fw-app.jsx — header, bottom nav, confetti, toast, and the FreyaApp wrapper */
const { useState: useStateS, useEffect: useEffectS } = React;

const CONFETTI_COLORS = ['#ff7eb0', '#ffd166', '#8b7bff', '#5fd0d8', '#8fd694', '#ff9aa2'];

function ConfettiLayer() {
  const { confetti } = useApp();
  const [bits, setBits] = useStateS([]);
  useEffectS(() => {
    if (!confetti) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const batch = Array.from({ length: 36 }, (_, i) => ({
      id: confetti + '-' + i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.3,
      dur: 1.6 + Math.random() * 1.1,
      round: Math.random() > 0.5,
    }));
    setBits(batch);
    const t = setTimeout(() => setBits([]), 3200);
    return () => clearTimeout(t);
  }, [confetti]);
  if (!bits.length) return null;
  return (
    <div className="confetti-layer">
      {bits.map(b => (
        <span key={b.id} className="confetti-bit" style={{
          left: b.left + '%', background: b.color, borderRadius: b.round ? '50%' : 2,
          animationDelay: b.delay + 's', animationDuration: b.dur + 's',
        }} />
      ))}
    </div>
  );
}

function Header({ onOpenGate, onOpenSheet, onOpenAvatar }) {
  const { stars, level, levelInto, streak, dark, setDark, soundOn, setSoundOn, musicOn, setMusicOn, musicTrack, setMusicTrack, beep, settings, profile, parentMode, setParentMode, fbStatus } = useApp();
  const tracks = (typeof window !== 'undefined' && window.musicTracks) || [];
  const curTrack = tracks[musicTrack] || tracks[0] || { th: '', emoji: '🎵' };
  const today = thaiDate(new Date());
  return (
    <div style={{ background: 'var(--header-grad)', padding: '16px 16px 18px', color: '#fff', borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AvatarDisplay profile={profile} size={50} onClick={onOpenAvatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, textShadow: '0 1px 2px rgba(0,0,0,.12)' }}>สวัสดี {profile.nickname || profile.firstName || profile.name}! <span className="wave">👋</span></div>
          <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            <span className="lvl-chip" title={levelInto + '/100 ดาวสะสมในเลเวลนี้'}>
              ⭐ Level {level}
              <i className="lvl-bar"><b style={{ width: levelInto + '%' }}></b></i>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, background: 'rgba(255,255,255,0.32)', padding: '2px 9px', borderRadius: 999, fontWeight: 700 }}>📘 {profile.grade}</span>
            {streak && streak.count > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, background: 'rgba(255,255,255,0.32)', padding: '2px 9px', borderRadius: 999, fontWeight: 700 }}
                title={`ทำภารกิจต่อเนื่อง ${streak.count} วัน · สถิติสูงสุด ${streak.best} วัน`}>
                🔥 {streak.count} วัน
              </span>
            )}
            <FbStatusBadge status={fbStatus} />
          </div>
        </div>
        <span className="starpill star-pop" key={stars} style={{ fontSize: 14 }}>⭐ {stars}</span>
      </div>

      {settings.thaiDate !== false && (
        <div style={{ marginTop: 12, fontSize: 11.5, opacity: .94, display: 'flex', alignItems: 'center', gap: 6 }}>
          📅 {today.full}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button onClick={() => { setDark(d => !d); beep('tab'); }} style={pillBtn}>
          {dark ? '🌙' : '☀️'} <span>{dark ? 'มืด' : 'สว่าง'}</span>
        </button>
        <button onClick={() => { setSoundOn(s => !s); }} style={pillBtn}>
          {soundOn ? '🔊' : '🔇'} <span>เสียง</span>
        </button>
        <button onClick={() => { setMusicOn(m => !m); }}
          style={{ ...pillBtn, background: musicOn ? 'rgba(255,255,255,0.42)' : pillBtn.background, fontWeight: musicOn ? 700 : 600 }}>
          {musicOn ? '🎶' : '🎵'} <span>เพลง</span>
        </button>
        {musicOn && (
          <button onClick={() => { setMusicTrack(t => (t + 1) % (tracks.length || 1)); beep('tab'); }}
            style={pillBtn} title="เปลี่ยนเพลง">
            {curTrack.emoji} <span>{curTrack.th}</span>
          </button>
        )}
        {parentMode ? (
          <>
            <button onClick={onOpenSheet} style={{ ...pillBtn, background: 'rgba(255,255,255,0.42)', fontWeight: 700 }}>⚙️ <span>ตั้งค่า</span></button>
            <button onClick={() => { setParentMode(false); beep('tab'); }} style={pillBtn}>🔒 <span>ล็อก</span></button>
          </>
        ) : (
          <button onClick={onOpenGate} style={pillBtn}>🔐 <span>โหมดคุณแม่</span></button>
        )}
      </div>
    </div>
  );
}
const pillBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', font: 'inherit',
  background: 'rgba(255,255,255,0.22)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)',
  borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600,
};

const TABS = [
  { id: 'home',      emoji: '🏠', th: 'หน้าหลัก' },
  { id: 'portfolio', emoji: '🖼️', th: 'ผลงาน' },
  { id: 'rewards',   emoji: '🎁', th: 'รางวัล' },
];
const ACTIVITY_TAB = { id: 'activity', emoji: '✏️', th: 'สร้าง' };
const PARENT_TAB = { id: 'parent', emoji: '👩‍🏫', th: 'คุณแม่' };

function BottomNav({ tab, setTab }) {
  const { beep, parentMode, submissions } = useApp();
  // แท็บ "สร้าง" และ "คุณแม่" แสดงเฉพาะโหมดคุณแม่
  const tabs = parentMode
    ? [TABS[0], ACTIVITY_TAB, TABS[1], TABS[2], PARENT_TAB]
    : TABS;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
      background: 'var(--surface)', borderTop: '1px solid var(--line)',
      padding: '8px 6px calc(8px + env(safe-area-inset-bottom))',
      display: 'grid', gridTemplateColumns: `repeat(${tabs.length},1fr)`, gap: 2,
      boxShadow: '0 -6px 18px -10px rgba(0,0,0,0.2)',
    }} className="bottom-nav">
      {tabs.map(t => {
        const on = tab === t.id;
        const showDot = t.id === 'parent' && submissions && submissions.length > 0;
        return (
          <button key={t.id} onClick={() => { setTab(t.id); beep('tab'); }} style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '7px 2px',
            border: 'none', cursor: 'pointer', font: 'inherit', borderRadius: 14,
            background: on ? 'var(--accent-soft)' : 'transparent',
          }}>
            <span className={'nav-emoji' + (on ? ' on' : '')} style={{ fontSize: 19 }}>{t.emoji}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: on ? 'var(--accent-deep)' : 'var(--ink-soft)' }}>{t.th}</span>
            {showDot && <span className="nav-badge">{submissions.length}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Shell() {
  const { dark, toast, parentMode, setParentMode, beep } = useApp();
  const [tab, setTab] = useStateS('home');
  const [gate, setGate] = useStateS(false);
  const [sheet, setSheet] = useStateS(false);
  const [avOpen, setAvOpen] = useStateS(false);
  const requestParent = () => { if (parentMode) setSheet(true); else setGate(true); };
  // ถ้าออกจากโหมดคุณแม่ และอยู่ที่แท็บเฉพาะแม่ → เด้งกลับหน้าหลัก
  useEffectS(() => { if (!parentMode && (tab === 'parent' || tab === 'activity')) setTab('home'); }, [parentMode, tab]);
  return (
    <div className={'app' + (dark ? ' is-dark' : '')} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="bg-doodles" aria-hidden="true">
        <span>⭐</span><span>☁️</span><span>🌸</span><span>✨</span><span>🌈</span><span>☁️</span>
      </div>
      <div className="app-scroll" style={{ paddingBottom: 76 }}>
        <Header onOpenGate={() => setGate(true)} onOpenSheet={() => setSheet(true)} onOpenAvatar={() => setAvOpen(true)} />
        {tab === 'home' && <Dashboard go={setTab} />}
        {tab === 'activity' && <ActivityBuilder go={setTab} />}
        {tab === 'portfolio' && <Portfolio onRequestParent={requestParent} />}
        {tab === 'rewards' && <Rewards />}
        {tab === 'parent' && <ParentHub onOpenSettings={() => setSheet(true)} />}
      </div>
      {toast && <div className="toast"><span style={{ fontSize: 17 }}>{toast.emoji}</span>{toast.msg}</div>}
      <ConfettiLayer />
      <CheerPopup />
      {!parentMode && <MascotBuddy tab={tab} />}
      <BottomNav tab={tab} setTab={setTab} />
      {avOpen && <AvatarPicker onClose={() => setAvOpen(false)} />}
      {gate && <ParentGate onClose={() => setGate(false)} onSuccess={() => { setParentMode(true); setGate(false); setTab('parent'); }} />}
      {sheet && <ParentSheet onClose={() => setSheet(false)} />}
    </div>
  );
}

function FreyaApp({ variant, settings }) {
  return (
    <AppProvider variant={variant} settings={settings}>
      <Shell />
    </AppProvider>
  );
}

Object.assign(window, { FreyaApp });

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

/* Compact header — avatar · name · level+streak · stars · settings.
   Every auxiliary control (theme, sound, music, parent mode) lives in
   KidSettingsSheet so the header stays calm and the hero carries the scene. */
function Header({ onOpenAvatar, onOpenSettings }) {
  const { stars, level, levelInto, streak, profile, parentMode, fbStatus } = useApp();
  return (
    <header className="kid-head">
      <AvatarDisplay profile={profile} size={44} onClick={onOpenAvatar} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="kid-head-name">{profile.nickname || profile.firstName || profile.name}</div>
        <div className="kid-head-chips">
          <span className="k-chip" title={levelInto + '/100 ดาวสะสมในเลเวลนี้'}>
            Lv {level} <i className="lvl-mini"><b style={{ width: levelInto + '%' }}></b></i>
          </span>
          {streak && streak.count > 0 && (
            <span className="k-chip streak" title={`ทำภารกิจต่อเนื่อง ${streak.count} วัน · สถิติสูงสุด ${streak.best} วัน`}>
              🔥 {streak.count}
            </span>
          )}
          {parentMode && <span className="k-chip" title="โหมดคุณแม่เปิดอยู่">🔓 คุณแม่</span>}
          <FbStatusBadge status={fbStatus} />
        </div>
      </div>
      <span className="k-stars star-pop" key={stars}>⭐ {stars}</span>
      <button className="k-gear" aria-label="ตั้งค่า" title="ตั้งค่า" onClick={onOpenSettings}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08A1.7 1.7 0 0 0 10 4.09V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56h.08a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08A1.7 1.7 0 0 0 21 12h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.6-.97z" />
        </svg>
      </button>
    </header>
  );
}

/* Settings bottom sheet — the auxiliary controls that used to crowd the header */
function KidSettingsSheet({ onClose, onOpenGate, onOpenParentSheet }) {
  const { dark, setDark, soundOn, setSoundOn, musicOn, setMusicOn, musicTrack, setMusicTrack, parentMode, setParentMode, beep } = useApp();
  const tracks = (typeof window !== 'undefined' && window.musicTracks) || [];
  return (
    <AppOverlayPortal>
      <div className="overlay" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-grab"></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 2 }}>
            <span style={{ fontSize: 20 }}>⚙️</span>
            <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>ตั้งค่า · Settings</div>
            <button className="x-btn" onClick={onClose} aria-label="ปิด">✕</button>
          </div>

          <div>
            <div className="set-row">
              <span className="set-ico">{dark ? '🌙' : '☀️'}</span>
              <span className="set-label"><b>ธีมหน้าจอ</b><span>{dark ? 'โหมดกลางคืน' : 'โหมดกลางวัน'}</span></span>
              <button className={'k-switch' + (dark ? ' on' : '')} role="switch" aria-checked={dark} aria-label="โหมดกลางคืน"
                onClick={() => { setDark(d => !d); beep('tab'); }} />
            </div>
            <div className="set-row">
              <span className="set-ico">{soundOn ? '🔊' : '🔇'}</span>
              <span className="set-label"><b>เสียงเอฟเฟกต์</b><span>เสียงติ๊ง เสียงแตร ตอนได้ดาว</span></span>
              <button className={'k-switch' + (soundOn ? ' on' : '')} role="switch" aria-checked={soundOn} aria-label="เสียงเอฟเฟกต์"
                onClick={() => setSoundOn(s => !s)} />
            </div>
            <div className="set-row">
              <span className="set-ico">{musicOn ? '🎶' : '🎵'}</span>
              <span className="set-label"><b>เพลงพื้นหลัง</b><span>{musicOn ? (tracks[musicTrack] || {}).th || '' : 'ปิดอยู่'}</span></span>
              <button className={'k-switch' + (musicOn ? ' on' : '')} role="switch" aria-checked={musicOn} aria-label="เพลงพื้นหลัง"
                onClick={() => setMusicOn(m => !m)} />
            </div>
            {musicOn && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '4px 4px 12px 49px' }}>
                {tracks.map((t, i) => (
                  <button key={t.id} className={'fit-chip' + (musicTrack === i ? ' on' : '')}
                    onClick={() => { setMusicTrack(i); beep('tab'); }}>
                    {t.emoji} {t.th}
                  </button>
                ))}
              </div>
            )}
          </div>

          {parentMode ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn block" onClick={() => { onClose(); onOpenParentSheet(); }}>⚙️ ตั้งค่าโหมดคุณแม่</button>
              <button className="btn ghost" style={{ flex: 'none' }} onClick={() => { setParentMode(false); beep('tab'); onClose(); }}>🔒 ล็อก</button>
            </div>
          ) : (
            <button className="btn ghost block" onClick={() => { onClose(); onOpenGate(); }}>🔐 โหมดคุณแม่ · Parent Mode</button>
          )}
        </div>
      </div>
    </AppOverlayPortal>
  );
}

const TABS = [
  { id: 'home',      icon: 'home',  th: 'หน้าหลัก' },
  { id: 'portfolio', icon: 'image', th: 'ผลงาน' },
  { id: 'rewards',   icon: 'gift',  th: 'รางวัล' },
];
const ACTIVITY_TAB = { id: 'activity', icon: 'pencil', th: 'สร้าง' };
const PARENT_TAB = { id: 'parent', icon: 'user', th: 'คุณแม่' };

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
            <span className={'nav-emoji' + (on ? ' on' : '')}
              style={{ display: 'grid', placeItems: 'center', color: on ? 'var(--accent-deep)' : 'var(--ink-soft)' }}>
              <FwIcon name={t.icon} size={21} />
            </span>
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
  const [kidSet, setKidSet] = useStateS(false);
  const [avOpen, setAvOpen] = useStateS(false);
  const requestParent = () => { if (parentMode) setSheet(true); else setGate(true); };
  // ถ้าออกจากโหมดคุณแม่ และอยู่ที่แท็บเฉพาะแม่ → เด้งกลับหน้าหลัก
  useEffectS(() => { if (!parentMode && (tab === 'parent' || tab === 'activity')) setTab('home'); }, [parentMode, tab]);
  return (
    <div className={'app' + (dark ? ' is-dark' : '') + (parentMode ? ' parent-on' : '')} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="bg-doodles" aria-hidden="true">
        <span>⭐</span><span>☁️</span><span>🌸</span><span>✨</span><span>🌈</span><span>☁️</span>
      </div>
      <div className="app-scroll" style={{ paddingBottom: 76 }}>
        <Header onOpenAvatar={() => setAvOpen(true)} onOpenSettings={() => { setKidSet(true); beep('tab'); }} />
        {tab === 'home' && <Dashboard go={setTab} />}
        {tab === 'activity' && <ActivityBuilder go={setTab} />}
        {tab === 'portfolio' && <Portfolio onRequestParent={requestParent} />}
        {tab === 'rewards' && <Rewards />}
        {tab === 'parent' && <ParentHub onOpenSettings={() => setSheet(true)} go={setTab} />}
      </div>
      {toast && <div className="toast"><span style={{ fontSize: 17 }}>{toast.emoji}</span>{toast.msg}</div>}
      <ConfettiLayer />
      <CheerPopup />
      {!parentMode && <MascotBuddy tab={tab} />}
      <BottomNav tab={tab} setTab={setTab} />
      {avOpen && <AvatarPicker onClose={() => setAvOpen(false)} />}
      {kidSet && <KidSettingsSheet onClose={() => setKidSet(false)} onOpenGate={() => setGate(true)} onOpenParentSheet={() => setSheet(true)} />}
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

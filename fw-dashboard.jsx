/* fw-dashboard.jsx — Home & Dashboard tab — 3-step mission flow */
const { useState: useStateDash, useRef: useRefDash, useEffect: useEffectDash } = React;

/* =========================================================
   EvidencePicker — real photo / video / audio capture
   ========================================================= */
function EvidencePicker({ items, setItems, accent }) {
  const { beep, showToast } = useApp();
  const photoRef = useRefDash(null);
  const videoRef = useRefDash(null);
  const [recording, setRecording] = useStateDash(false);
  const [elapsed, setElapsed] = useStateDash(0);
  const recRef = useRefDash(null);
  const chunksRef = useRefDash([]);
  const timerRef = useRefDash(null);

  const addFile = (file, kind) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setItems(list => [...list, { id: 'ev' + Date.now() + '_' + Math.random().toString(36).slice(2,8), type: kind, url, file, name: file.name || kind }]);
    beep('pop');
  };

  const removeItem = (id) => setItems(list => list.filter(x => x.id !== id));

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setItems(list => [...list, { id: 'ev' + Date.now() + '_' + Math.random().toString(36).slice(2,8), type: 'audio', url, file: blob, name: 'เสียงอ่าน.webm' }]);
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true); setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      beep('pop');
    } catch (err) {
      showToast('ไม่สามารถเข้าถึงไมโครโฟน · Mic blocked', '🎤');
    }
  };
  const stopRec = () => {
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop();
    clearInterval(timerRef.current);
    setRecording(false);
    beep('reward');
  };
  useEffectDash(() => () => clearInterval(timerRef.current), []);

  const iconFor = { image: '🖼️', video: '🎬', audio: '🎧' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* hidden native inputs — open real photo library / camera / video */}
      <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { addFile(e.target.files[0], 'image'); e.target.value = ''; }} />
      <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }}
        onChange={e => { addFile(e.target.files[0], 'video'); e.target.value = ''; }} />

      {/* thumbnails of attached evidence */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {items.map(it => (
            <div key={it.id} className="ev-thumb">
              {it.type === 'image'
                ? <img src={it.url} alt="" />
                : <div className="ev-thumb-ph">{iconFor[it.type]}</div>}
              <button className="ev-thumb-x" onClick={() => removeItem(it.id)} title="ลบ">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* capture buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="ev-cap" onClick={() => photoRef.current.click()}>📷<span>รูป</span></button>
        <button className="ev-cap" onClick={() => videoRef.current.click()}>🎬<span>วิดีโอ</span></button>
        {recording
          ? <button className="ev-cap rec" onClick={stopRec}>⏹️<span>{String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}</span></button>
          : <button className="ev-cap" onClick={startRec}>🎤<span>อัดเสียง</span></button>}
      </div>
    </div>
  );
}

/* =========================================================
   MissionCard — 3 state visual
   available  → accept button
   inprogress → colored border + submit evidence button
   pending    → muted, hourglass badge
   done       → strikethrough, green check
   ========================================================= */
function MissionCard({ m }) {
  const { acceptMission, submitMission, toggleMission, repeatMission, parentMode, beep, showToast } = useApp();
  const g = GROUP[m.group];
  const st = m.status || (m.done ? 'done' : 'available');
  const [evidence, setEvidence] = useStateDash([]); // attached files
  const [uploading, setUploading] = useStateDash(false);
  const hasEvidence = evidence.length > 0;

  const handleSubmit = async () => {
    setUploading(true);
    try { await submitMission(m.id, evidence); }
    finally { setUploading(false); }
  };

  // border + bg per state
  const cardStyle = {
    available:   { border: '1.5px solid var(--line)',      background: 'var(--surface)' },
    inprogress:  { border: `2px solid ${g.c}`,            background: g.c + '10' },
    pending:     { border: '1.5px dashed var(--gold)',     background: 'color-mix(in oklab, var(--gold) 8%, var(--surface))' },
    done:        { border: '1.5px solid var(--line)',      background: 'var(--surface-2)', opacity: 0.78 },
  }[st] || {};

  return (
    <div className="mission-card" style={{ borderRadius: 'var(--radius-sm)', padding: '12px 13px', ...cardStyle, transition: 'all .25s' }}>
      {/* top row: icon + name + star pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <GroupDot id={m.group} size={38} ring={st === 'inprogress'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', textDecoration: st === 'done' ? 'line-through' : 'none', opacity: st === 'done' ? 0.7 : 1 }}>
              {m.th}
            </span>
            {st === 'inprogress' && m.returned && (
              <span className="ms-badge returned">💪 ลองแก้อีกครั้ง</span>
            )}
            {st === 'inprogress' && !m.returned && (
              <span className="ms-badge inprogress">🧭 กำลังผจญภัย</span>
            )}
            {st === 'pending' && (
              <span className="ms-badge pending">💌 ส่งให้คุณแม่แล้ว</span>
            )}
            {st === 'done' && (
              <span className="ms-badge done">🏆 ผ่านภารกิจ!</span>
            )}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{m.en} · {g.th}</span>
        </div>
        <button className="tts-btn" title="อ่านให้ฟัง · Read aloud"
          onClick={() => { if (!speakThai(m.th + (m.desc ? '. ' + m.desc : ''))) showToast('เครื่องนี้ไม่มีเสียงอ่านภาษาไทย', '🔇'); }}>
          🔊
        </button>
        <span className="starpill" style={{ fontSize: 12, padding: '4px 9px', flex: 'none' }}>⭐ {m.stars}</span>
      </div>

      {/* action row */}
      {st === 'available' && (
        <button className="ms-btn accept" onClick={() => acceptMission(m.id)}>
          <span>🗺️</span> ออกผจญภัย · Start Quest
        </button>
      )}

      {st === 'inprogress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <EvidencePicker items={evidence} setItems={setEvidence} accent={g.c} />
          <button className="ms-btn submit" disabled={!hasEvidence || uploading}
            onClick={handleSubmit}>
            {uploading ? <><span className="ms-spin">⏳</span> กำลังอัปโหลด...</> : <><span>📤</span> ส่งผลงาน · Submit Evidence</>}
          </button>
          <div className="ms-hint">
            {uploading ? '☁️ กำลังอัปโหลดขึ้นคลาวด์…' : m.returned ? '↩️ คุณแม่ส่งกลับมาให้แก้ · แนบหลักฐานใหม่แล้วส่งอีกครั้ง' : hasEvidence ? `✅ แนบแล้ว ${evidence.length} ไฟล์ · พร้อมส่ง` : '📸 แนบรูป วิดีโอ หรืออัดเสียงอ่านก่อนส่ง'}
          </div>
        </div>
      )}

      {st === 'pending' && (
        <div className="ms-pending-bar">
          <span style={{ fontSize: 14 }}>⏳</span>
          <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>ส่งให้คุณแม่แล้ว รอฟังข่าวดีนะ · Sent to Mum</span>
        </div>
      )}

      {st === 'done' && (
        <div className="ms-done-bar">
          <span style={{ fontSize: 14 }}>🌟</span>
          <span style={{ fontSize: 12, color: 'var(--good)', fontWeight: 700 }}>ผ่านภารกิจ! +{m.stars} ดาว</span>
        </div>
      )}

      {/* parent mode: direct toggle override + repeat */}
      {parentMode && (
        <div style={{ display: 'flex', gap: 6, marginTop: st === 'done' ? 8 : 0 }}>
          <button className="ms-parent-toggle" style={{ flex: 1 }} onClick={() => toggleMission(m.id)}
            title="Parent override">
            {st === 'done' ? '↩︎ ยกเลิก' : '✓ อนุมัติตรงๆ'}
          </button>
          {st === 'done' && (
            <button className="ms-parent-toggle" style={{ flex: 1 }} onClick={() => repeatMission(m.id)}
              title="Send again for another round">
              🔁 ทำอีกครั้ง
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HeroAdventure — signature element: หน้าต่างท้องฟ้าที่เปลี่ยนตามเวลาจริง
   เช้า/บ่าย/เย็น/ค่ำ (CSS ล้วน ไม่มี canvas ไม่มี loop animation)
   รวม: คำทักทาย · คำคมประจำวัน · แถบเลเวล · ภารกิจแนะนำ · CTA เดียว
   ========================================================= */
const QUOTES = [
  'การผจญภัยที่ยิ่งใหญ่ เริ่มจากก้าวเล็กๆ เสมอ',
  'ทุกภารกิจคือขุมทรัพย์ความรู้ที่รอให้ค้นพบ',
  'ผิดพลาดได้ เพราะนักผจญภัยเรียนรู้จากทุกเส้นทาง',
  'ดาวทุกดวงบนฟ้า เกิดจากความพยายามของหนูเอง',
  'วันนี้โลกของหนูจะเติบโตขึ้นอีกนิดนะ',
  'หัวใจของนักสำรวจ คือกล้าลองสิ่งใหม่ๆ',
  'ความรู้ใหม่ซ่อนอยู่ในทุกๆ วัน',
];
function heroPeriod(h) {
  return h >= 5 && h < 11 ? 'morning' : h < 16 ? 'afternoon' : h < 19 ? 'evening' : 'night';
}
const HERO_GREET = { morning: 'สวัสดีตอนเช้า', afternoon: 'สวัสดีตอนบ่าย', evening: 'สวัสดีตอนเย็น', night: 'ค่ำนี้พักผ่อนด้วยนะ' };

function HeroAdventure({ go }) {
  const { missions, profile, level, levelInto, parentMode, beep, settings } = useApp();
  const now = new Date();
  const period = heroPeriod(now.getHours());
  const name = profile.nickname || profile.firstName || profile.name;
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];
  const doing = missions.find(m => m.status === 'inprogress');
  const avail = missions.find(m => (m.status || (m.done ? 'done' : 'available')) === 'available');
  const target = doing || avail;
  const nDone = missions.filter(m => m.status === 'done').length;
  const nPending = missions.filter(m => m.status === 'pending').length;
  const scrollToQuests = () => {
    beep('tab');
    const el = document.getElementById('quests');
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView(reduce ? {} : { behavior: 'smooth', block: 'start' });
  };
  return (
    <section className={'hero ' + period}>
      <div className="hero-sky" aria-hidden="true">
        {period === 'night'
          ? <><span className="hero-moon" /><span className="hero-stars" /></>
          : <span className="hero-sun" />}
        <span className="hero-cloud c1" /><span className="hero-cloud c2" />
      </div>
      <div className="hero-hill" aria-hidden="true" />
      <div className="hero-body">
        {settings.thaiDate !== false && <div className="hero-date">{thaiDate(now).full}</div>}
        <h2 className="hero-greet">{HERO_GREET[period]} {name}!</h2>
        <p className="hero-quote">“{quote}”</p>
        <div className="hero-lvl">
          <div className="hero-lvl-bar"><b style={{ width: levelInto + '%' }}></b></div>
          <span>อีก {100 - levelInto} ⭐ ถึง Level {level + 1}</span>
        </div>
        {missions.length > 0 && (
          <div className="hero-counts">
            <span className="k-chip">🏆 {nDone} สำเร็จ</span>
            {nPending > 0 && <span className="k-chip">💌 {nPending} รอคุณแม่</span>}
          </div>
        )}
        {target ? (
          <button className="btn hero-cta" onClick={scrollToQuests}>
            {doing ? '🧭 ผจญภัยต่อ · Continue' : '🗺️ เริ่มภารกิจวันนี้ · Start'}
            <small>{target.th}</small>
          </button>
        ) : parentMode ? (
          <button className="btn hero-cta" onClick={() => { beep('tab'); go('activity'); }}>
            ＋ เพิ่มภารกิจแรกของวันนี้
          </button>
        ) : (
          <div className="hero-wait">วันนี้ยังไม่มีภารกิจ รอคุณแม่ส่งมานะ 💌</div>
        )}
      </div>
      <div className="hero-mascot"><DressedMascot size={58} /></div>
    </section>
  );
}

/* =========================================================
   AchievementPreview — สติกเกอร์/ความสำเร็จล่าสุด + ลิงก์ไปดูทั้งหมด
   ========================================================= */
function AchievementPreview({ go }) {
  const { stickers, beep } = useApp();
  const catalog = (typeof window !== 'undefined' && window.STICKERS) || [];
  if (!stickers.length || !catalog.length) return null;
  const recent = stickers.slice(-4).reverse()
    .map(id => catalog.find(s => s.id === id)).filter(Boolean);
  return (
    <div>
      <div className="sec-h">
        <h3>🏅 ความสำเร็จล่าสุด</h3>
        <span className="sub">Achievements</span>
      </div>
      <div className="card ach-strip">
        {recent.map((s, i) => (
          <span key={i} className="ach-cell" title={s.th}>{s.emoji}</span>
        ))}
        <button className="ach-more" onClick={() => { beep('tab'); go('rewards'); }}>ดูทั้งหมด ›</button>
      </div>
    </div>
  );
}

/* =========================================================
   AdventureMap — ความก้าวหน้า 7 กลุ่มสาระเป็น "เกาะ" บนเส้นทางผจญภัย
   เกาะจาง+มีเมฆเมื่อยังไม่เริ่ม (0%), สว่างขึ้นตาม % และได้มงกุฎเมื่อครบ 100%
   มาสคอตยืนอยู่ที่เกาะแรกที่ยังไม่ถึง 100% (= ด่านปัจจุบัน)
   ========================================================= */
const MAP_POS = [
  { x: 20, y: 8 }, { x: 68, y: 20 }, { x: 24, y: 34 }, { x: 70, y: 48 },
  { x: 24, y: 62 }, { x: 68, y: 76 }, { x: 36, y: 90 },
];
function AdventureMap() {
  const { progress, dark } = useApp();
  const firstOpen = GROUPS.findIndex(g => (progress[g.id] || 0) < 100);
  const curIdx = firstOpen === -1 ? GROUPS.length - 1 : firstOpen;
  const pathD = MAP_POS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  // low-alpha pastel fills read fine on the light surface but nearly vanish
  // against the dark theme's near-black card — bump alpha in dark mode so
  // each island still reads as its own color instead of uniform gray.
  const isleAlpha = dark ? { locked: '40', open: '70' } : { locked: '22', open: '44' };
  return (
    <div className="adv-map card">
      <svg className="adv-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={pathD} fill="none" stroke={dark ? 'var(--accent)' : 'var(--accent-soft)'} strokeWidth="2.2"
          strokeDasharray="0.1 4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {GROUPS.map((g, i) => {
        const pct = progress[g.id] || 0;
        const locked = pct === 0;
        const done = pct >= 100;
        return (
          <div key={g.id} className={'adv-node' + (locked ? ' locked' : '')}
            style={{ left: MAP_POS[i].x + '%', top: MAP_POS[i].y + '%' }}>
            <div className="adv-isle" style={{
              background: g.c + (locked ? isleAlpha.locked : isleAlpha.open),
              boxShadow: done ? `0 0 0 3px ${g.c}, 0 0 16px ${g.c}88` : `0 0 0 2px ${g.c}55`,
            }}>
              <span>{locked ? '☁️' : g.emoji}</span>
              {done && <span className="adv-crown">👑</span>}
              {i === curIdx && <span className="adv-me"><DressedMascot size={20} /></span>}
            </div>
            <span className="adv-terr">{(TERRITORY[g.id] || {}).th || g.th}</span>
            <span className="adv-name">{g.th}</span>
            <span className="adv-pct" style={{ color: g.c }}>{locked ? 'ยังไม่สำรวจ' : done ? 'พิชิตแล้ว!' : 'สำรวจแล้ว ' + pct + '%'}</span>
          </div>
        );
      })}
    </div>
  );
}

function Dashboard({ go }) {
  const { missions, progress, beep, parentMode } = useApp();
  const overall = Math.round(GROUPS.reduce((s, g) => s + (progress[g.id] || 0), 0) / GROUPS.length);

  return (
    <div className="tab-enter" style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* signature hero — the sky window into Freya's world */}
      <HeroAdventure go={go} />

      {/* quests */}
      <div id="quests">
        <div className="sec-h">
          <h3>🎯 ภารกิจวันนี้</h3>
          <span className="sub">Today's Quests</span>
        </div>
        {missions.length === 0 ? (
          <div className="hub-empty">
            <div style={{ fontSize: 38 }}>🗓️</div>
            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>ยังไม่มีภารกิจ</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              {parentMode ? 'กดปุ่มด้านล่างเพื่อเพิ่มกิจกรรมแรก' : 'รอคุณแม่เพิ่มภารกิจให้นะ'}
            </div>
          </div>
        ) : (
          <div className="missions-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {missions.map(m => <MissionCard key={m.id} m={m} />)}
          </div>
        )}
        {parentMode && (
          <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => { beep('pop'); go('activity'); }}>
            ＋ เพิ่มกิจกรรมพิเศษ · Add Spontaneous Activity
          </button>
        )}
      </div>

      {/* adventure map — progress across the 7 groups as unlockable islands */}
      <div>
        <div className="sec-h">
          <h3>🗺️ แผนที่ผจญภัย</h3>
          <span className="sub">Adventure Map · รวม {overall}%</span>
        </div>
        <AdventureMap />
      </div>

      {/* recently unlocked achievements */}
      <AchievementPreview go={go} />

    </div>
  );
}

Object.assign(window, { Dashboard, AdventureMap, HeroAdventure, AchievementPreview });

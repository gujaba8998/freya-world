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
  const { acceptMission, submitMission, toggleMission, repeatMission, parentMode, beep } = useApp();
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
              <span className="ms-badge returned">↩️ ส่งกลับมาแก้</span>
            )}
            {st === 'inprogress' && !m.returned && (
              <span className="ms-badge inprogress">🔥 กำลังทำ</span>
            )}
            {st === 'pending' && (
              <span className="ms-badge pending">⏳ รอตรวจ</span>
            )}
            {st === 'done' && (
              <span className="ms-badge done">✅ สำเร็จ</span>
            )}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{m.en} · {g.th}</span>
        </div>
        <span className="starpill" style={{ fontSize: 12, padding: '4px 9px', flex: 'none' }}>⭐ {m.stars}</span>
      </div>

      {/* action row */}
      {st === 'available' && (
        <button className="ms-btn accept" onClick={() => acceptMission(m.id)}>
          <span>🎯</span> กดรับภารกิจ · Accept Mission
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
          <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>ส่งให้คุณแม่ตรวจแล้ว · Awaiting approval</span>
        </div>
      )}

      {st === 'done' && (
        <div className="ms-done-bar">
          <span style={{ fontSize: 14 }}>🌟</span>
          <span style={{ fontSize: 12, color: 'var(--good)', fontWeight: 700 }}>ผ่านการตรวจแล้ว! +{m.stars} ดาว</span>
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

function Dashboard({ go }) {
  const { missions, progress, beep, parentMode } = useApp();
  // for progress ring: count done + pending as "active"
  const activeCount = missions.filter(m => ['done','pending'].includes(m.status || (m.done ? 'done' : 'available'))).length;
  const todayPct = missions.length ? Math.round((activeCount / missions.length) * 100) : 0;
  const overall = Math.round(GROUPS.reduce((s, g) => s + (progress[g.id] || 0), 0) / GROUPS.length);

  return (
    <div className="tab-enter" style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* today summary */}
      <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--header-grad)', border: 'none', color: '#fff' }}>
        <ProgressRing value={todayPct} size={66} stroke={8} color="#fff" track="rgba(255,255,255,0.3)">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--accent-deep)' }}>{todayPct}%</span>
        </ProgressRing>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, textShadow: '0 1px 2px rgba(0,0,0,.12)' }}>ภารกิจวันนี้</div>
          <div style={{ fontSize: 12.5, opacity: .92 }}>
            {missions.filter(m => m.status === 'done').length} สำเร็จ ·{' '}
            {missions.filter(m => m.status === 'pending').length} รอตรวจ ·{' '}
            {missions.filter(m => m.status === 'inprogress').length} กำลังทำ
          </div>
        </div>
        <span style={{ fontSize: 40 }} className="floaty">
          {todayPct === 100 ? '🌟' : missions.some(m=>m.status==='inprogress') ? '⚡' : '🐰'}
        </span>
      </div>

      {/* missions */}
      <div>
        <div className="sec-h">
          <h3>🎯 ภารกิจวันนี้</h3>
          <span className="sub">Today's Missions</span>
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

      {/* progress for 7 groups */}
      <div>
        <div className="sec-h">
          <h3>🌈 ความก้าวหน้า</h3>
          <span className="sub">รวม {overall}%</span>
        </div>
        <div className="progress-list card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {GROUPS.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <GroupDot id={g.id} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{g.th}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: g.c }}>{progress[g.id] || 0}%</span>
                </div>
                <Bar value={progress[g.id] || 0} color={g.c} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { Dashboard });

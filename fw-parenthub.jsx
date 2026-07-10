/* fw-parenthub.jsx — Parent Mode hub: Approval Queue · Yearly Tracker · SAR */
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

/* ---------------- 0. Weekly Summary + mission suggester ----------------
   สรุปอัตโนมัติของสัปดาห์นี้ (จันทร์–วันนี้) จาก portfolio/wallet ที่มี ts —
   งานที่อนุมัติก่อนอัปเดตนี้ไม่มี ts จะไม่ถูกนับ (ไม่ใช่บั๊ก แค่ข้อมูลเก่า) */
function WeeklySummary() {
  const { portfolio, wallet, progress, missions, addMission, profile, streak, showToast, beep, planItemsFor } = useApp();
  const ws = weekStart().getTime();
  const wkItems = portfolio.filter(p => p.ts && p.ts >= ws);
  const counts = {};
  GROUPS.forEach(g => { counts[g.id] = wkItems.filter(p => p.group === g.id).length; });
  const quiet = GROUPS.filter(g => !counts[g.id]);
  const starsWk = wallet.filter(w => w.ts && w.ts >= ws && w.amount > 0).reduce((s, w) => s + w.amount, 0);

  // แนะนำภารกิจจากกลุ่มที่ progress ต่ำสุด (เฉพาะกลุ่มที่เงียบสัปดาห์นี้ก่อน)
  const suggest = () => {
    const pool = (quiet.length ? quiet : GROUPS).slice().sort((a, b) => (progress[a.id] || 0) - (progress[b.id] || 0));
    const active = new Set(missions.filter(m => m.planKey && m.status !== 'done').map(m => m.planKey));
    for (const g of pool) {
      const opts = planItemsFor(profile.grade).filter(it => it.group === g.id && !active.has(it.key));
      if (opts.length) {
        const it = opts[Math.floor(Math.random() * opts.length)];
        const [th, en] = it.label.split(' · ');
        addMission({ en: en || th, th, group: it.group, stars: 15, inds: [it.label], planKey: it.key });
        return;
      }
    }
    showToast('ทุกกิจกรรมในแผนถูกส่งไปแล้ว ลองสร้างเองดูนะ', '🤔');
  };

  return (
    <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>📊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>สรุปสัปดาห์นี้</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
            {wkItems.length} ภารกิจสำเร็จ · +{starsWk} ⭐
            {streak && streak.count > 0 && <> · 🔥 ต่อเนื่อง {streak.count} วัน</>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {GROUPS.map(g => (
          <span key={g.id} className="wk-chip" style={counts[g.id] ? { background: g.c + '2b', color: 'var(--ink)' } : { opacity: .55 }}>
            {g.emoji} {counts[g.id] || 0}
          </span>
        ))}
      </div>
      {quiet.length > 0 && wkItems.length > 0 && (
        <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
          กลุ่มที่ยังเงียบสัปดาห์นี้: <b style={{ color: 'var(--accent-deep)' }}>{quiet.map(g => g.th).join(' · ')}</b>
        </div>
      )}
      <button className="btn ghost block" onClick={() => { beep('tab'); suggest(); }}>
        🎲 แนะนำภารกิจวันนี้ · เลือกจากกลุ่มที่ยังเงียบให้อัตโนมัติ
      </button>
    </div>
  );
}

/* ---------------- 1. Approval Queue ---------------- */
function EvidenceThumb({ sub, size = 'card' }) {
  const g = GROUP[sub.group];
  const video = (sub.evidence || []).find(e => e.type === 'video');
  const audio = (sub.evidence || []).find(e => e.type === 'audio');
  if (sub.thumb) {
    return <img src={sub.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  if (video && video.url) {
    return <video src={video.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return (
    <>
      <span style={{ fontSize: 26 }}>{audio ? '🎧' : sub.media === 'video' ? '🎬' : '📷'}</span>
      <small>{audio ? 'audio' : sub.media === 'video' ? 'video' : 'photo'}</small>
    </>
  );
}

function ApprovalCard({ sub }) {
  const { approveSubmission, rejectSubmission, fbFamily, showToast, beep } = useApp();
  const g = GROUP[sub.group];
  const audioItem = (sub.evidence || []).find(e => e.type === 'audio');
  const hasPending = (sub.evidence || []).some(e => e.pendingUpload);

  // คำชมจากคุณแม่ — ข้อความ + เสียงอัด (แนบไปกับผลงานในโพลารอยด์)
  const [praise, setPraise] = useStateH('');
  const [praiseBlob, setPraiseBlob] = useStateH(null);
  const [recOn, setRecOn] = useStateH(false);
  const [busy, setBusy] = useStateH(false);
  const recRef = useRefH(null);
  const chunksRef = useRefH([]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        setPraiseBlob(new Blob(chunksRef.current, { type: 'audio/webm' }));
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start(); recRef.current = rec; setRecOn(true); beep('pop');
    } catch (e) { showToast('ไม่สามารถเข้าถึงไมโครโฟน · Mic blocked', '🎤'); }
  };
  const stopRec = () => {
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop();
    setRecOn(false); beep('tab');
  };

  const doApprove = async () => {
    let audioUrl = null;
    // เสียงชมอัปโหลดขึ้นคลาวด์เท่านั้น (blob: URL ตายเมื่อรีโหลด) — ถ้าออฟไลน์เก็บแค่ข้อความ
    if (praiseBlob && fbFamily && fbGetStorage && fbGetStorage()) {
      setBusy(true);
      try { audioUrl = await fbUploadFile(fbFamily, praiseBlob, 'audio'); }
      catch (e) { console.error('Praise audio upload failed:', e); showToast('อัปโหลดเสียงชมไม่สำเร็จ — ส่งเฉพาะข้อความแทน', '⚠️'); }
      setBusy(false);
    } else if (praiseBlob) {
      showToast('ยังไม่เชื่อมคลาวด์ — ส่งเฉพาะข้อความชม', '💬');
    }
    approveSubmission(sub.id, { text: praise.trim(), audioUrl });
  };

  return (
    <div className="appr-card">
      <div className="appr-media" style={{ borderColor: g.c, overflow: 'hidden', padding: (sub.thumb || (sub.evidence||[]).some(e=>e.type==='video')) ? 0 : undefined }}>
        <EvidenceThumb sub={sub} />
        {sub.evCount > 1 && <span className="appr-count">{sub.evCount}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{sub.th}</span>
          <span className="appr-grp" style={{ background: g.c + '22', color: g.c }}>{g.emoji} {g.th}</span>
          {hasPending && (
            <span className="appr-grp" style={{ background: '#fff3cd', color: '#8a6200' }} title="ไฟล์นี้ยังไม่ขึ้นคลาวด์ — จะซิงก์อัตโนมัติเมื่อเน็ตพร้อม">
              ⏳ รอซิงก์
            </span>
          )}
        </div>
        {sub.desc && <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', margin: '3px 0 6px', lineHeight: 1.4 }}>{sub.desc}</div>}
        {audioItem && audioItem.url && (
          <audio controls src={audioItem.url} style={{ width: '100%', height: 30, marginBottom: 6 }} />
        )}
        {sub.inds && sub.inds.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 7 }}>
            {sub.inds.map((ind, i) => <span key={i} className="appr-ind">✓ {ind.split(' · ')[0]}</span>)}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="starpill" style={{ fontSize: 11.5, padding: '3px 9px' }}>⭐ {sub.stars} รออนุมัติ</span>
          <span style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>· {sub.when}</span>
        </div>
        {/* praise from mom — optional, shows on the polaroid in Freya's portfolio */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
          <input value={praise} onChange={e => setPraise(e.target.value)} maxLength={120}
            placeholder="💬 เขียนคำชมถึงเฟรยา (ไม่บังคับ)"
            style={{ flex: 1, minWidth: 0, border: '1.5px solid var(--accent-soft)', borderRadius: 10, padding: '7px 10px', font: 'inherit', fontSize: 11.5, color: 'var(--ink)', background: 'var(--surface)', outline: 'none' }} />
          {recOn
            ? <button className="tts-btn" style={{ background: '#ffd9e2' }} title="หยุดอัด" onClick={stopRec}>⏹️</button>
            : <button className="tts-btn" title={praiseBlob ? 'อัดใหม่' : 'อัดเสียงชม'} onClick={startRec}>{praiseBlob ? '✅' : '🎤'}</button>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="appr-btn reject" onClick={() => rejectSubmission(sub.id)}>↩︎ ส่งกลับแก้</button>
          <button className="appr-btn approve" disabled={busy || recOn} onClick={doApprove}>
            {busy ? '⏳ กำลังส่ง...' : `✓ อนุมัติ +${sub.stars}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewedRow({ item }) {
  const g = GROUP[item.group];
  const ok = item.outcome === 'approved';
  return (
    <div className="rvw-row">
      <div className="rvw-thumb" style={{ borderColor: g.c }}>
        {item.thumb
          ? <img src={item.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 16 }}>{g.emoji}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.th}</div>
        <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{g.th} · {item.when}</div>
      </div>
      <span className={'rvw-tag ' + (ok ? 'ok' : 'back')}>
        {ok ? `✅ +${item.stars}⭐` : '↩️ ส่งกลับ'}
      </span>
    </div>
  );
}

function ApprovalQueue() {
  const { submissions, reviewed } = useApp();
  const approvedCount = reviewed.filter(r => r.outcome === 'approved').length;
  const returnedCount = reviewed.filter(r => r.outcome === 'returned').length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <WeeklySummary />
      <div className="sec-h" style={{ marginBottom: 0 }}>
        <h3 style={{ fontSize: 16 }}>📥 ตะกร้าตรวจงาน</h3>
        <span className="sub">{submissions.length} รอตรวจ</span>
      </div>
      {submissions.length === 0 ? (
        <div className="hub-empty">
          <div style={{ fontSize: 38 }}>🎉</div>
          <div style={{ fontWeight: 700, color: 'var(--ink)' }}>ตรวจงานครบแล้ว!</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>ไม่มีกิจกรรมรออนุมัติในขณะนี้</div>
        </div>
      ) : submissions.map(s => <ApprovalCard key={s.id} sub={s} />)}

      {/* reviewed history */}
      {reviewed.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div className="sec-h" style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 14.5 }}>🗒️ งานที่ตรวจแล้ว</h3>
            <span className="sub">✅ {approvedCount} · ↩️ {returnedCount}</span>
          </div>
          <div className="card" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {reviewed.map(item => <ReviewedRow key={item.id} item={item} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- 2. Yearly Curriculum Tracker (editable) ---------------- */

/* คู่มือกลุ่มประสบการณ์ — คำอธิบาย จุดเน้น และตัวอย่างกิจกรรมจากแผนจริง */
function GroupGuideModal({ groupId, grade, onClose }) {
  const g = GROUP[groupId];
  const guide = GROUP_GUIDE[groupId];
  if (!guide) return null;
  const examples = guideExamples(groupId, grade);
  return (
    <AppOverlayPortal>
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '78vh', overflowY: 'auto' }}>
        <div className="sheet-grab"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <GroupDot id={groupId} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{g.th} · {g.en}</div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{guide.full}</div>
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 12 }}>{guide.desc}</div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-deep)', marginBottom: 6 }}>🎯 จุดเน้นของกลุ่มนี้</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {guide.points.map((p, i) => (
            <div key={i} style={{ fontSize: 11.5, color: 'var(--ink)', lineHeight: 1.5, background: 'var(--surface-2)', borderRadius: 10, padding: '7px 11px' }}>
              {p}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-deep)', marginBottom: 6 }}>✨ ตัวอย่างกิจกรรมตามแผน {GRADE_LABEL[grade] || grade}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          {examples.map((ex, i) => (
            <div key={i} style={{ fontSize: 11.5, color: 'var(--ink)', display: 'flex', gap: 7 }}>
              <span style={{ flex: 'none' }}>{g.emoji}</span><span>{ex}</span>
            </div>
          ))}
        </div>
        <button className="btn block" onClick={onClose}>เข้าใจแล้ว</button>
      </div>
    </div>
    </AppOverlayPortal>
  );
}

function YearlyTracker() {
  const { profile, planDone, togglePlan, beep, planItemsFor, planEdits, addPlanItem, editPlanItem, removePlanItem, resetPlanEdits, showToast } = useApp();
  const [grade, setGrade] = useStateH(profile.grade);
  // ตามชั้นเรียนในโปรไฟล์เมื่อคุณแม่เปลี่ยนชั้นในตั้งค่า
  useEffectH(() => { setGrade(profile.grade); }, [profile.grade]);
  const items = planItemsFor(grade);
  const doneCount = items.filter(p => planDone.has(p.key)).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;
  const gradeOptions = ['ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'];

  const [guideGroup, setGuideGroup] = useStateH(null);   // groupId ของคู่มือที่เปิดอยู่
  const [editKey, setEditKey] = useStateH(null);         // key ของรายการที่กำลังแก้ชื่อ
  const [editText, setEditText] = useStateH('');
  const [addGroup, setAddGroup] = useStateH(null);       // groupId ที่กำลังพิมพ์เพิ่มกิจกรรม
  const [addText, setAddText] = useStateH('');

  const hasEdits = planEdits.removed.some(k => k.startsWith(grade + '|'))
    || Object.keys(planEdits.edited).some(k => k.startsWith(grade + '|'))
    || planEdits.added.some(a => a.grade === grade);

  const startEdit = (it) => { setEditKey(it.key); setEditText(it.label.split(' · ')[0]); beep('tab'); };
  const saveEdit = () => {
    if (editText.trim()) editPlanItem(editKey, editText);
    setEditKey(null); setEditText('');
  };
  const confirmRemove = (it) => {
    if (window.confirm(`ลบ "${it.label.split(' · ')[0]}" ออกจากแผน${grade}?`)) {
      removePlanItem(it.key);
      showToast('ลบออกจากแผนแล้ว · Removed', '🗑️');
    }
  };
  const saveAdd = () => {
    if (addText.trim()) { addPlanItem(grade, addGroup, addText); showToast('เพิ่มในแผนแล้ว · Added', '✨'); }
    setAddGroup(null); setAddText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="sec-h" style={{ marginBottom: 0 }}>
        <h3 style={{ fontSize: 16 }}>🗂️ เช็กลิสต์แผนรายปี</h3>
        <span className="sub">Yearly Tracker</span>
      </div>

      {/* grade selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {gradeOptions.map(gr => (
          <button key={gr} className={'trk-grade' + (grade === gr ? ' on' : '')}
            onClick={() => { setGrade(gr); beep('tab'); }}>{gr}</button>
        ))}
      </div>

      {/* 7-group guide menu */}
      <div className="card" style={{ padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
          📖 คู่มือกลุ่มประสบการณ์ <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>· แตะเพื่อดูคำอธิบายและตัวอย่าง</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {GROUPS.map(g => (
            <button key={g.id} onClick={() => { setGuideGroup(g.id); beep('tab'); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, border: 'none', background: 'transparent', cursor: 'pointer', font: 'inherit', width: 62 }}>
              <GroupDot id={g.id} size={38} />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.15 }}>{g.th}</span>
            </button>
          ))}
        </div>
      </div>

      {/* progress summary */}
      <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <ProgressRing value={pct} size={62} stroke={8} color="var(--accent)">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--accent-deep)' }}>{pct}%</span>
        </ProgressRing>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>
            ทำแล้ว {doneCount} / {items.length} กิจกรรม
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>ตามแผน{GRADE_LABEL[grade] || grade} · {GROUPS.length} กลุ่มประสบการณ์</div>
          {hasEdits && (
            <button className="btn ghost" style={{ padding: '4px 10px', fontSize: 10.5, marginTop: 6 }}
              onClick={() => { if (window.confirm(`คืนแผน${grade}กลับเป็นค่าเริ่มต้น? (รายการที่แก้/ลบ/เพิ่มเองจะหายไป)`)) resetPlanEdits(grade); }}>
              ↺ คืนค่าเริ่มต้น {grade}
            </button>
          )}
        </div>
      </div>

      {/* checklist grouped by experience group — editable */}
      {GROUPS.map(g => {
        const groupItems = items.filter(it => it.group === g.id);
        const gDone = groupItems.filter(it => planDone.has(it.key)).length;
        return (
          <div className="card" key={g.id} style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <GroupDot id={g.id} size={30} />
              <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', flex: 1 }}>{g.th}</span>
              <button className="tts-btn" style={{ width: 26, height: 26, fontSize: 12 }} title="คำอธิบายกลุ่มนี้"
                onClick={() => { setGuideGroup(g.id); beep('tab'); }}>ℹ️</button>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: groupItems.length && gDone === groupItems.length ? 'var(--good)' : 'var(--ink-soft)' }}>
                {gDone}/{groupItems.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {groupItems.map(it => {
                const on = planDone.has(it.key);
                if (editKey === it.key) {
                  return (
                    <div key={it.key} className="trk-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditKey(null); } }}
                        style={{ flex: 1, minWidth: 0, border: '1.5px solid var(--accent)', borderRadius: 8, padding: '6px 9px', font: 'inherit', fontSize: 12, color: 'var(--ink)', background: 'var(--surface)', outline: 'none' }} />
                      <button className="tts-btn" style={{ width: 26, height: 26, fontSize: 12 }} title="บันทึก" onClick={saveEdit}>✅</button>
                      <button className="tts-btn" style={{ width: 26, height: 26, fontSize: 12 }} title="ยกเลิก" onClick={() => setEditKey(null)}>✕</button>
                    </div>
                  );
                }
                return (
                  <div key={it.key} className={'trk-row' + (on ? ' on' : '')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => togglePlan(it.key)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, border: 'none', background: 'transparent', cursor: 'pointer', font: 'inherit', padding: 0, textAlign: 'left' }}>
                      <span className={'trk-check' + (on ? ' on' : '')}>{on ? '✓' : ''}</span>
                      <span style={{ flex: 1, fontSize: 12, textDecoration: on ? 'line-through' : 'none', color: on ? 'var(--ink-soft)' : 'var(--ink)' }}>
                        {it.label.split(' · ')[0]}{it.custom && <span style={{ fontSize: 9, color: 'var(--accent-deep)', fontWeight: 700 }}> ·เพิ่มเอง</span>}
                      </span>
                    </button>
                    <button className="trk-mini" title="แก้ไขชื่อ" onClick={() => startEdit(it)}>✎</button>
                    <button className="trk-mini" title="ลบออกจากแผน" onClick={() => confirmRemove(it)}>✕</button>
                  </div>
                );
              })}

              {/* add new item to this group */}
              {addGroup === g.id ? (
                <div className="trk-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input autoFocus value={addText} onChange={e => setAddText(e.target.value)}
                    placeholder={`กิจกรรมใหม่ในกลุ่ม${g.th}...`}
                    onKeyDown={e => { if (e.key === 'Enter') saveAdd(); if (e.key === 'Escape') { setAddGroup(null); setAddText(''); } }}
                    style={{ flex: 1, minWidth: 0, border: '1.5px solid var(--accent)', borderRadius: 8, padding: '6px 9px', font: 'inherit', fontSize: 12, color: 'var(--ink)', background: 'var(--surface)', outline: 'none' }} />
                  <button className="tts-btn" style={{ width: 26, height: 26, fontSize: 12 }} title="เพิ่ม" onClick={saveAdd}>✅</button>
                  <button className="tts-btn" style={{ width: 26, height: 26, fontSize: 12 }} title="ยกเลิก" onClick={() => { setAddGroup(null); setAddText(''); }}>✕</button>
                </div>
              ) : (
                <button className="btn ghost" style={{ padding: '7px', fontSize: 11.5 }}
                  onClick={() => { setAddGroup(g.id); setAddText(''); beep('tab'); }}>
                  ＋ เพิ่มกิจกรรมในกลุ่มนี้
                </button>
              )}
            </div>
          </div>
        );
      })}

      {guideGroup && <GroupGuideModal groupId={guideGroup} grade={grade} onClose={() => setGuideGroup(null)} />}
    </div>
  );
}

/* ---------------- 3. SAR Report ---------------- */
function SARSection({ onOpen }) {
  const { profile, portfolio, progress, planDone, planItemsFor } = useApp();
  const planTotal = planItemsFor(profile.grade).length;
  const planDoneCount = planItemsFor(profile.grade).filter(p => planDone.has(p.key)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="sec-h" style={{ marginBottom: 0 }}>
        <h3 style={{ fontSize: 16 }}>📄 รายงาน SAR ประจำปี</h3>
        <span className="sub">Self-Assessment Report</span>
      </div>

      <div className="card sar-hero">
        <div style={{ fontSize: 34 }}>📄</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginTop: 4 }}>รายงานประเมินตนเอง</div>
        <div style={{ fontSize: 12, opacity: .92, marginBottom: 4 }}>{GRADE_LABEL[profile.grade] || profile.grade} · ปีการศึกษา {new Date().getFullYear() + 543}</div>
        <div style={{ fontSize: 11.5, opacity: .85, marginBottom: 14, lineHeight: 1.5 }}>
          ระบบรวบรวมผลงาน {portfolio.length} ชิ้น · {planDoneCount}/{planTotal} กิจกรรมตามแผน<br/>แล้วจัดเรียงเป็นเอกสารพร้อมส่ง สพฐ. อัตโนมัติ
        </div>
        <button className="sar-cta" onClick={onOpen}>⬇️ สร้าง &amp; ดาวน์โหลด PDF</button>
      </div>

      {/* auto-mapping preview */}
      <div className="sec-h" style={{ marginBottom: 0 }}>
        <h3 style={{ fontSize: 13.5 }}>👁️ ตัวอย่างการจัดวางอัตโนมัติ</h3>
        <span className="sub">Auto-mapped layout</span>
      </div>
      <div className="sar-preview-frame" onClick={onOpen}>
        <div className="sar-preview-scale">
          <SARDocument profile={profile} portfolio={portfolio} progress={progress}
            planDoneCount={planDoneCount} planTotal={planTotal} />
        </div>
        <div className="sar-preview-tap">แตะเพื่อดูเต็มหน้า ›</div>
      </div>
    </div>
  );
}

/* ---------------- 0.5 Parent Dashboard — งานค้าง + ทางลัด ---------------- */
function ParentDashboard({ go, setSub }) {
  const { submissions, missions, portfolio, beep } = useApp();
  const returned = missions.filter(m => m.status === 'inprogress' && m.returned).length;
  const unstarted = missions.filter(m => (m.status || (m.done ? 'done' : 'available')) === 'available').length;
  const ws = weekStart().getTime();
  const wkDone = portfolio.filter(p => p.ts && p.ts >= ws).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="pd-grid">
        <button className="pd-tile hot" onClick={() => { setSub('approve'); beep('tab'); }}>
          <b>{submissions.length}</b><span>รอตรวจ</span>
        </button>
        <button className="pd-tile warn" onClick={() => { go('home'); beep('tab'); }}>
          <b>{returned}</b><span>ส่งกลับแก้</span>
        </button>
        <button className="pd-tile" onClick={() => { go('home'); beep('tab'); }}>
          <b>{unstarted}</b><span>ยังไม่เริ่มทำ</span>
        </button>
        <button className="pd-tile ok" onClick={() => { setSub('approve'); beep('tab'); }}>
          <b>{wkDone}</b><span>สำเร็จสัปดาห์นี้</span>
        </button>
      </div>
      <div className="pd-actions">
        <button className="pd-act" onClick={() => { go('activity'); beep('tab'); }}><i>＋</i>สร้างภารกิจ</button>
        <button className="pd-act" onClick={() => { setSub('tracker'); beep('tab'); }}><i>🗂️</i>แผนรายปี</button>
        <button className="pd-act" onClick={() => { setSub('sar'); beep('tab'); }}><i>📄</i>รายงาน SAR</button>
      </div>
    </div>
  );
}

/* ---------------- Parent Hub shell ---------------- */
const HUB_TABS = [
  { id: 'approve', emoji: '📥', th: 'ตรวจงาน' },
  { id: 'tracker', emoji: '🗂️', th: 'แผนรายปี' },
  { id: 'sar',     emoji: '📄', th: 'รายงาน' },
];

function ParentHub({ onOpenSettings, go }) {
  const { submissions, beep } = useApp();
  const [sub, setSub] = useStateH('approve');
  const [sarOpen, setSarOpen] = useStateH(false);

  return (
    <div className="tab-enter pro-zone" style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* hub header */}
      <div className="card hub-head">
        <span style={{ fontSize: 24 }}>👩‍🏫</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>โหมดคุณแม่</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>จัดการหลักสูตร · ตรวจงาน · ออกรายงาน</div>
        </div>
        <button className="btn ghost" style={{ padding: '8px 12px', fontSize: 12.5 }} onClick={onOpenSettings}>⚙️ ตั้งค่า</button>
      </div>

      {/* dashboard: pending work + quick actions */}
      <ParentDashboard go={go || (() => {})} setSub={setSub} />

      {/* sub-tab switcher */}
      <div className="hub-tabs">
        {HUB_TABS.map(t => (
          <button key={t.id} className={'hub-tab' + (sub === t.id ? ' on' : '')} onClick={() => { setSub(t.id); beep('tab'); }}>
            <span>{t.emoji}</span> {t.th}
            {t.id === 'approve' && submissions.length > 0 && <span className="hub-dot">{submissions.length}</span>}
          </button>
        ))}
      </div>

      {sub === 'approve' && <ApprovalQueue />}
      {sub === 'tracker' && <YearlyTracker />}
      {sub === 'sar' && <SARSection onOpen={() => { setSarOpen(true); beep('reward'); }} />}

      {sarOpen && <SARModal onClose={() => setSarOpen(false)} />}
    </div>
  );
}

Object.assign(window, { ParentHub });

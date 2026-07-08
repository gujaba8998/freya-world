/* fw-parent.jsx — PIN gate + Parent settings sheet (Layer 1 controls) */
const { useState: useStatePa } = React;

/* ---------- PIN entry overlay ---------- */
function ParentGate({ onClose, onSuccess }) {
  const { profile, beep } = useApp();
  const [entry, setEntry] = useStatePa('');
  const [err, setErr] = useStatePa(false);

  const press = (d) => {
    if (entry.length >= 4) return;
    beep('tab');
    const next = entry + d;
    setEntry(next); setErr(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === profile.pin) { beep('reward'); onSuccess(); }
        else { setErr(true); setEntry(''); }
      }, 180);
    }
  };
  const del = () => { setEntry(e => e.slice(0, -1)); setErr(false); };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="gate" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 40 }}>🔐</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>โหมดคุณแม่</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 4 }}>ใส่ PIN เพื่อเข้าจัดการหลักสูตร</div>
        <div className={'pin-dots' + (err ? ' err' : '')}>
          {[0,1,2,3].map(i => <span key={i} className={'pin-dot' + (entry.length > i ? ' on' : '')}></span>)}
        </div>
        {err && <div style={{ fontSize: 12, color: 'var(--accent-deep)', fontWeight: 600 }}>PIN ไม่ถูกต้อง ลองใหม่อีกครั้ง</div>}
        <div className="pinpad">
          {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} className="pin-key" onClick={() => press('' + n)}>{n}</button>)}
          <span></span>
          <button className="pin-key" onClick={() => press('0')}>0</button>
          <button className="pin-key del" onClick={del}>⌫</button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>เดโม PIN: <b>1234</b></div>
        <button className="btn ghost" style={{ marginTop: 4 }} onClick={onClose}>ยกเลิก</button>
      </div>
    </div>
  );
}

/* ---------- Parent settings sheet ---------- */
const fieldLabel = { fontWeight: 700, fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 };

function ParentSheet({ onClose }) {
  const { profile, saveProfile, setParentMode, beep, showToast, fbStatus, fbFamily, fbConnect, fbDisconnect, exportBackup, importBackup } = useApp();
  const [fbOpen, setFbOpen] = useStatePa(false);
  const [pinDraft, setPinDraft] = useStatePa(profile.pin);
  const importRef = React.useRef(null);
  const gradeInfo = calcGrade(profile.birthYear);
  const years = [];
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= thisYear - 18; y--) years.push(y);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grab"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>👩‍🏫</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>ตั้งค่าหลักสูตร</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>Parent settings · เฉพาะคุณแม่</div>
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>

        {/* profile */}
        <div className="p-card">
          <div style={fieldLabel}>👧 ข้อมูลผู้เรียน</div>
          <label className="p-row">
            <span>ชื่อเล่น · Nickname</span>
            <input className="p-input" value={profile.nickname || ''}
              placeholder="เช่น เฟรี"
              onChange={e => saveProfile({ nickname: e.target.value })} />
          </label>
          <label className="p-row">
            <span>ชื่อจริง · First name</span>
            <input className="p-input" value={profile.firstName || profile.name || ''}
              placeholder="เช่น เฟรยา"
              onChange={e => saveProfile({ firstName: e.target.value, name: e.target.value })} />
          </label>
          <label className="p-row">
            <span>นามสกุล · Last name</span>
            <input className="p-input" value={profile.lastName || ''}
              placeholder="เช่น รักเรียน"
              onChange={e => saveProfile({ lastName: e.target.value })} />
          </label>
          <label className="p-row">
            <span>ปีเกิด (ค.ศ.)</span>
            <select className="p-input" value={profile.birthYear} onChange={e => saveProfile({ birthYear: +e.target.value })}>
              {years.map(y => <option key={y} value={y}>{y} (พ.ศ. {y + 543})</option>)}
            </select>
          </label>
          <div className="p-hint">📅 อายุ ≈ {thisYear - profile.birthYear} ปี → ระบบแนะนำ <b>{gradeInfo.label}</b></div>
        </div>

        {/* grade */}
        <div className="p-card">
          <div style={fieldLabel}>📚 ชั้นเรียน · แผนการเรียนเปลี่ยนตามชั้น</div>
          <label className="p-row" style={{ marginBottom: 6 }}>
            <span>คำนวณจากปีเกิดอัตโนมัติ</span>
            <button className={'switch' + (profile.gradeAuto ? ' on' : '')} onClick={() => saveProfile({ gradeAuto: !profile.gradeAuto })}></button>
          </label>
          <div className="grade-grid" style={{ opacity: profile.gradeAuto ? 0.5 : 1, pointerEvents: profile.gradeAuto ? 'none' : 'auto' }}>
            {GRADE_LEVELS.map(g => (
              <button key={g.id} className={'grade-chip' + (profile.grade === g.id ? ' on' : '')}
                onClick={() => { saveProfile({ grade: g.id }); beep('tab'); }}>{g.id}</button>
            ))}
          </div>
          <div className="p-hint">เลือก <b>{GRADE_LABEL[profile.grade] || profile.grade}</b> → ตัวชี้วัด {totalIndicators(profile.grade)} รายการ ใน 7 กลุ่ม</div>
        </div>

        {/* cloud sync */}
        <div className="p-card">
          <div style={fieldLabel}>☁️ ซิงก์ข้อมูลหลายเครื่อง · Cloud Sync</div>
          {fbFamily ? (
            <>
              <div className="p-row">
                <span>สถานะ</span>
                <span style={{ fontWeight: 700, color: fbStatus === 'synced' ? 'var(--good)' : fbStatus === 'error' ? '#d4516b' : 'var(--ink-soft)' }}>
                  {fbStatus === 'synced' ? '🟢 เชื่อมต่อแล้ว' : fbStatus === 'connecting' ? '🟡 กำลังเชื่อม…' : fbStatus === 'error' ? '🔴 ผิดพลาด' : '⚪ ปิดอยู่'}
                </span>
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '10px 12px', textAlign: 'center', margin: '4px 0' }}>
                <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>รหัสครอบครัว · Family Code</div>
                <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, letterSpacing: 3, color: 'var(--accent-deep)' }}>{fbFamily}</div>
              </div>
              <div className="p-hint">ใส่รหัสนี้บนเครื่องอื่น (ในหน้าตั้งค่า) เพื่อ sync ข้อมูลชุดเดียวกัน</div>
              <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => { fbDisconnect(); showToast('หยุด sync แล้ว', '⚪'); }}>ยกเลิกการ sync เครื่องนี้</button>
            </>
          ) : fbOpen ? (
            <FirebaseSetupWizard onDone={(code) => { fbConnect(code); setFbOpen(false); showToast('เริ่ม sync แล้ว! ☁️', '🟢'); }} />
          ) : (
            <>
              <div className="p-hint">เก็บข้อมูลบน Google (Firebase) → เปิดจากมือถือเฟรยาและ iPad คุณแม่พร้อมกัน ข้อมูลอัปเดตอัตโนมัติทุกเครื่อง</div>
              <button className="btn block" style={{ marginTop: 10 }} onClick={() => setFbOpen(true)}>☁️ ตั้งค่า Cloud Sync</button>
            </>
          )}
        </div>

        {/* backup / restore */}
        <div className="p-card">
          <div style={fieldLabel}>💾 สำรองข้อมูล · Backup</div>
          <div className="p-hint">เก็บทุกอย่าง (ภารกิจ ผลงาน ดาว โปรไฟล์ ห้องของเฟรยา) เป็นไฟล์เดียว เอาไว้กู้คืนหรือย้ายเครื่อง</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn block" style={{ flex: 1 }} onClick={exportBackup}>⬇️ ดาวน์โหลดไฟล์สำรอง</button>
            <button className="btn ghost block" style={{ flex: 1 }} onClick={() => importRef.current.click()}>⬆️ กู้คืนจากไฟล์</button>
          </div>
          <input ref={importRef} type="file" accept=".json,application/json" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files[0]; if (f) importBackup(f).catch(() => {}); e.target.value = ''; }} />
        </div>

        {/* pin */}
        <div className="p-card">
          <div style={fieldLabel}>🔑 รหัส PIN</div>
          <label className="p-row">
            <span>เปลี่ยน PIN (4 หลัก)</span>
            <input className="p-input" inputMode="numeric" maxLength={4} value={pinDraft}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPinDraft(v);
                if (v.length === 4) saveProfile({ pin: v });   // บันทึกเมื่อครบ 4 หลักเท่านั้น
              }} />
          </label>
          {pinDraft.length < 4 && (
            <div className="p-hint">⚠️ ต้องครบ 4 หลักจึงจะเปลี่ยน — ตอนนี้ยังใช้ PIN เดิม (<b>{profile.pin}</b>)</div>
          )}
        </div>

        <button className="btn block" onClick={() => { showToast('บันทึกการตั้งค่าแล้ว', '✅'); onClose(); }}>เสร็จสิ้น · Done</button>
        <button className="btn ghost block" style={{ marginTop: 8 }}
          onClick={() => { setParentMode(false); beep('tab'); showToast('ออกจากโหมดคุณแม่', '🔒'); onClose(); }}>
          🔒 ออกจากโหมดคุณแม่
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ParentGate, ParentSheet });

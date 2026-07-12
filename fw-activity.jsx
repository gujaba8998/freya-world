/* fw-activity.jsx — Activity Builder & Evidence tab (with cascading indicator selector) */
const { useState: useStateA } = React;

function Field({ label, en, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 7 }}>
        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{en}</span>
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%', border: '1.5px solid var(--accent-soft)', background: 'var(--surface)',
  borderRadius: 14, padding: '11px 13px', font: 'inherit', fontSize: 14, color: 'var(--ink)', outline: 'none',
};

/* ===================================================================
   IndicatorSelector — modal, 3-step cascade:
   Step 1 เลือกกลุ่มประสบการณ์ → Step 2 เลือกสมรรถนะ → Step 3 ติ๊กตัวชี้วัด
   =================================================================== */
function IndicatorSelector({ initialGroup, grade, selected, onToggle, onClose }) {
  const { beep } = useApp();
  const [step, setStep] = useStateA(1);
  const [group, setGroup] = useStateA(initialGroup || 'life');
  const [comp, setComp] = useStateA(null);
  const comps = getCompetencies(group, grade);
  const compObj = comps.find(c => c.id === comp);

  const goGroup = (g) => { setGroup(g); setComp(null); setStep(2); beep('tab'); };
  const goComp = (c) => { setComp(c); setStep(3); beep('tab'); };

  const Crumb = () => (
    <div className="sel-crumb">
      <button className={step >= 1 ? 'on' : ''} onClick={() => setStep(1)}>1 · กลุ่ม</button>
      <span>›</span>
      <button className={step >= 2 ? 'on' : ''} disabled={step < 2} onClick={() => setStep(2)}>2 · สมรรถนะ</button>
      <span>›</span>
      <button className={step >= 3 ? 'on' : ''} disabled={step < 3} onClick={() => setStep(3)}>3 · ตัวชี้วัด</button>
    </div>
  );

  return (
    <AccessibleOverlay onClose={onClose} labelledBy="indicator-selector-title" surfaceClassName="sheet sel-sheet">
        <div className="sheet-grab"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>🏷️</span>
          <div style={{ flex: 1 }}>
            <div id="indicator-selector-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>เลือกตัวชี้วัด</div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>ตามหลักสูตรบ้านเรียน · {grade}</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent-deep)', background: 'var(--accent-soft)', padding: '4px 10px', borderRadius: 999 }}>{selected.length} เลือก</span>
          <button className="x-btn" onClick={onClose} aria-label="ปิดตัวเลือกตัวชี้วัด">✕</button>
        </div>
        <Crumb />

        {/* Step 1: groups */}
        {step === 1 && (
          <div className="sel-grid">
            {GROUPS.map(g => (
              <button key={g.id} className={'sel-group' + (group === g.id ? ' on' : '')} onClick={() => goGroup(g.id)}>
                <span style={{ fontSize: 24 }}>{g.emoji}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700 }}>{g.th}</span>
                <span style={{ fontSize: 9.5, color: 'var(--ink-soft)' }}>{getCompetencies(g.id, grade).length} สมรรถนะ</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: competencies */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="sel-ctx"><GroupDot id={group} size={26} /> {GROUP[group].th} · {GROUP[group].en}</div>
            {comps.map(c => {
              const picked = c.inds.filter(i => selected.includes(i)).length;
              return (
                <button key={c.id} className={'sel-comp' + (c.plan ? ' plan' : '')} onClick={() => goComp(c.id)}>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{c.th}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{c.en} · {c.inds.length} ตัวชี้วัด</div>
                  </div>
                  {picked > 0 && <span className="sel-badge">{picked}</span>}
                  <span style={{ color: 'var(--ink-soft)', fontSize: 16 }}>›</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: indicator checkboxes */}
        {step === 3 && compObj && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div className="sel-ctx"><GroupDot id={group} size={26} /> {GROUP[group].th} › {compObj.th}</div>
            {compObj.inds.map(ind => {
              const on = selected.includes(ind);
              return (
                <button key={ind} className={'sel-ind' + (on ? ' on' : '')} onClick={() => { onToggle(ind); beep(on ? 'tab' : 'pop'); }}>
                  <span className={'sel-check' + (on ? ' on' : '')}>{on ? '✓' : ''}</span>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 12.5 }}>{ind}</span>
                </button>
              );
            })}
            <button className="btn ghost" style={{ marginTop: 4 }} onClick={() => setStep(2)}>‹ เลือกสมรรถนะอื่น</button>
          </div>
        )}

        <button className="btn block" style={{ marginTop: 14 }} onClick={onClose}>เสร็จสิ้น · เลือกแล้ว {selected.length} ตัวชี้วัด</button>
    </AccessibleOverlay>
  );
}

/* ===================================================================
   PlanPicker — เลือกกิจกรรมจากแผนการเรียนของชั้น แล้วส่งเป็นภารกิจให้ลูก
   =================================================================== */
function PlanPicker({ go }) {
  const { addMission, profile, missions, beep, showToast, planItemsFor } = useApp();
  const grade = profile.grade;
  const items = planItemsFor(grade);
  const [sel, setSel] = useStateA([]);
  const [stars, setStars] = useStateA(15);

  // กิจกรรมที่กำลังดำเนินการอยู่ (ยังไม่เสร็จ) → กันส่งซ้ำ; ส่วนที่สำเร็จแล้วส่งซ้ำได้ (ทำซ้ำ)
  const blockedKeys = new Set(missions.filter(m => m.planKey && m.status !== 'done').map(m => m.planKey));
  const doneCounts = {};
  missions.forEach(m => { if (m.planKey && m.status === 'done') doneCounts[m.planKey] = (doneCounts[m.planKey] || 0) + 1; });

  const toggle = (k) => { setSel(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]); beep('tab'); };

  const send = () => {
    const chosen = items.filter(it => sel.includes(it.key) && !blockedKeys.has(it.key));
    chosen.forEach(it => {
      const [th, en] = it.label.split(' · ');
      addMission({ en: en || th, th, group: it.group, stars: Number(stars) || 15, inds: [it.label], planKey: it.key });
    });
    showToast(`ส่ง ${chosen.length} ภารกิจให้เฟรยาแล้ว! · Sent`, '🎯');
    setSel([]);
    go('home');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* plan summary */}
      <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 26 }}>📋</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>
            แผนการเรียน {GRADE_LABEL[grade] || grade}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
            {items.length} กิจกรรม · {GROUPS.length} กลุ่มประสบการณ์ · กำลังทำ {blockedKeys.size}
          </div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent-deep)', background: 'var(--accent-soft)', padding: '4px 10px', borderRadius: 999 }}>{sel.length} เลือก</span>
      </div>

      {/* activities grouped by experience group */}
      {GROUPS.map(g => {
        const groupItems = items.filter(it => it.group === g.id);
        if (!groupItems.length) return null;
        return (
          <div className="card" key={g.id} style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <GroupDot id={g.id} size={30} />
              <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', flex: 1 }}>{g.th}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{groupItems.length} กิจกรรม</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {groupItems.map(it => {
                const blocked = blockedKeys.has(it.key);
                const doneN = doneCounts[it.key] || 0;
                const on = sel.includes(it.key);
                const [th, en] = it.label.split(' · ');
                return (
                  <button key={it.key} className={'sel-ind' + (on ? ' on' : '')} disabled={blocked}
                    style={blocked ? { opacity: .45, cursor: 'default' } : undefined}
                    onClick={() => !blocked && toggle(it.key)}>
                    <span className={'sel-check' + (on ? ' on' : '')}>{on ? '✓' : ''}</span>
                    <span style={{ flex: 1, textAlign: 'left' }}>
                      <span style={{ fontSize: 12.5, display: 'block' }}>{th}</span>
                      <span style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{en}</span>
                    </span>
                    {blocked && <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--accent-deep)', flex: 'none' }}>⏳ กำลังทำ</span>}
                    {!blocked && doneN > 0 && <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--good)', flex: 'none' }}>✓ ทำแล้ว {doneN} ครั้ง</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* stars + send */}
      <div className="card" style={{ padding: 16 }}>
        <Field label="รางวัลต่อกิจกรรม" en="Stars per activity">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min="5" max="50" step="5" value={stars} onChange={e => setStars(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--accent)' }} />
            <span className="starpill">⭐ {stars}</span>
          </div>
        </Field>
      </div>

      <button className="btn block" disabled={sel.length === 0} onClick={send}>
        🎯 ส่ง {sel.length || ''} ภารกิจให้เฟรยา · Send to Freya
      </button>
    </div>
  );
}

function ActivityBuilder({ go }) {
  const { addMission, profile, beep } = useApp();
  const [mode, setMode] = useStateA('plan');   // 'plan' | 'custom'
  const [name, setName] = useStateA('');
  const [desc, setDesc] = useStateA('');
  const [group, setGroup] = useStateA('life');
  const [tags, setTags] = useStateA([]);
  const [stars, setStars] = useStateA(15);
  const [selOpen, setSelOpen] = useStateA(false);

  const toggleTag = (t) => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);
  const canSave = name.trim().length > 0;

  const save = () => {
    addMission({ en: name, th: name, desc: desc.trim(), group, stars: Number(stars) || 0, inds: tags });
    setName(''); setDesc(''); setTags([]); setStars(15);
    go('home');
  };

  return (
    <div className="tab-enter" style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="sec-h" style={{ marginBottom: 0 }}>
        <h3>✏️ สร้างกิจกรรม</h3>
        <span className="sub">{GRADE_LABEL[profile.grade] || profile.grade}</span>
      </div>

      {/* mode switcher: pick from plan vs custom */}
      <div className="av-tabs">
        <button className={'av-tab' + (mode === 'plan' ? ' on' : '')} onClick={() => { setMode('plan'); beep('tab'); }}>
          📋 จากแผนการเรียน
        </button>
        <button className={'av-tab' + (mode === 'custom' ? ' on' : '')} onClick={() => { setMode('custom'); beep('tab'); }}>
          ✏️ สร้างเอง
        </button>
      </div>

      {mode === 'plan' ? <PlanPicker go={go} /> : <>
      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="ชื่อกิจกรรม" en="Activity Name">
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="เช่น ทำขนมไทย / Make Thai dessert" />
        </Field>

        <Field label="รายละเอียด" en="Description">
          <textarea style={{ ...inputStyle, resize: 'none', height: 70 }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="เล่าว่าเฟรยาทำอะไรบ้าง..." />
        </Field>

        <Field label="กลุ่มประสบการณ์หลัก" en="Primary Experience Group">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {GROUPS.map(g => (
              <button key={g.id} onClick={() => setGroup(g.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 4px',
                borderRadius: 13, cursor: 'pointer', font: 'inherit',
                border: group === g.id ? `2px solid ${g.c}` : '2px solid transparent',
                background: group === g.id ? g.c + '26' : 'var(--surface-2)',
              }}>
                <span style={{ fontSize: 19 }}>{g.emoji}</span>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.1 }}>{g.th}</span>
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* indicators — advanced cascading selector */}
      <div>
        <div className="sec-h">
          <h3 style={{ fontSize: 15 }}>🏷️ ตัวชี้วัดการเรียนรู้</h3>
          <span className="sub">{tags.length} เลือกแล้ว</span>
        </div>
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {tags.map(t => (
                <button key={t} className="chip on" onClick={() => toggleTag(t)} title="แตะเพื่อเอาออก">
                  {t.split(' · ')[0]} <span style={{ opacity: .6 }}>✕</span>
                </button>
              ))}
            </div>
          )}
          <button className="btn ghost block" onClick={() => { setSelOpen(true); beep('tab'); }}>
            🎯 เลือกตัวชี้วัดแบบจัดเต็ม · Map indicators
          </button>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            เลือกตามลำดับ: กลุ่มประสบการณ์ → สมรรถนะ → ตัวชี้วัดเฉพาะของ {profile.grade}
          </div>
        </div>
      </div>

      {/* reward */}
      <div className="card" style={{ padding: 16 }}>
        <Field label="รางวัลเมื่อสำเร็จ" en="Reward stars on completion">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min="5" max="50" step="5" value={stars} onChange={e => setStars(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--accent)' }} />
            <span className="starpill">⭐ {stars}</span>
          </div>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn ghost" style={{ flex: 'none' }} onClick={() => go('home')}>ยกเลิก</button>
        <button className="btn block" disabled={!canSave} onClick={save}>บันทึกกิจกรรม · Save</button>
      </div>

      {selOpen && (
        <IndicatorSelector
          initialGroup={group} grade={profile.grade} selected={tags}
          onToggle={toggleTag} onClose={() => setSelOpen(false)} />
      )}
      </>}
    </div>
  );
}

Object.assign(window, { ActivityBuilder, IndicatorSelector, PlanPicker });

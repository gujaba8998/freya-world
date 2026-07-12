/* fw-portfolio.jsx — Digital Portfolio & Reports tab */
const { useState: useStateP } = React;

function MemoryCard({ item, i }) {
  const g = GROUP[item.group];
  const video = (item.evidence || []).find(e => e.type === 'video');
  const audio = (item.evidence || []).find(e => e.type === 'audio');
  return (
    <article className="memory-card" style={{ '--memory-color': g.c }}>
      <div className="memory-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
      <div className="memory-media">
        {item.thumb ? (
          <img src={item.thumb} alt={`ผลงาน ${item.th}`} />
        ) : video ? (
          <video src={video.url} controls playsInline aria-label={`วิดีโอผลงาน ${item.th}`} />
        ) : (
          <div className="memory-media-fallback"><AppIcon name="memory" size={34} /><span>บันทึกการเรียนรู้</span></div>
        )}
        <span className="memory-category">{g.th}</span>
      </div>
      <div className="memory-copy">
        <div className="memory-meta"><span>{item.date}</span><StarCounter value={item.stars} /></div>
        <h3>{item.th}</h3><p className="memory-en">{item.en}</p>
        {(item.reflection || item.desc) && <p className="memory-reflection"><b>สิ่งที่ฉันค้นพบ</b>{item.reflection || item.desc}</p>}
        {item.praise && <blockquote><AppIcon name="sparkle" size={15} /><span><b>ข้อความจากผู้ปกครอง</b>{item.praise}</span></blockquote>}
        {audio && audio.url && <audio controls src={audio.url} aria-label={`เสียงประกอบผลงาน ${item.th}`} />}
        {item.praiseAudio && <audio controls src={item.praiseAudio} aria-label="เสียงชมจากผู้ปกครอง" />}
        {item.indicators && item.indicators.length > 0 && (
          <div className="memory-indicators">{item.indicators.slice(0, 3).map(code => <span key={code}>{code}</span>)}</div>
        )}
      </div>
    </article>
  );
}

function Portfolio({ onRequestParent }) {
  const { portfolio, progress, showToast, beep, parentMode, profile } = useApp();
  const admin = parentMode;
  const [sarOpen, setSarOpen] = useStateP(false);

  const nowYear = new Date().getFullYear() + 543;
  const years = portfolio.map(p => p.year).filter(Boolean);
  const minYear = years.length ? Math.min(...years, nowYear) : nowYear - 5;
  const maxYear = years.length ? Math.max(...years, nowYear) : nowYear;
  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) yearOptions.push(y);

  const [fromYear, setFromYear] = useStateP(minYear);
  const [toYear, setToYear] = useStateP(maxYear);

  const filtered = portfolio.filter(p => !p.year || (p.year >= fromYear && p.year <= toYear));

  const covered = GROUPS.filter(g => (progress[g.id] || 0) >= 50).length;

  const genSAR = () => { beep('reward'); setSarOpen(true); };

  return (
    <div className="tab-enter" style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* mode card */}
      <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="page-intro-icon"><AppIcon name={admin ? 'parent' : 'memory'} size={22} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{admin ? 'มุมมองคุณแม่ (Admin)' : 'มุมมองเฟรยา'}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{admin ? 'Curriculum & reports · ' + profile.grade : 'Freya\'s gallery'}</div>
        </div>
        {admin
          ? <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--good)' }}>🔓 ปลดล็อก</span>
          : <button className="btn ghost" style={{ padding: '8px 13px', fontSize: 12.5 }} onClick={() => { beep('tab'); onRequestParent && onRequestParent(); }}>🔐 เข้าโหมดคุณแม่</button>}
      </div>

      {!admin ? (
        <>
          <div className="sec-h" style={{ marginBottom: 0 }}>
            <h3>สมุดความทรงจำมหัศจรรย์</h3>
            <span className="sub">{filtered.length} ชิ้น</span>
          </div>

          {/* academic-year range picker */}
          <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>📅 ปีการศึกษา</span>
            <select className="p-input" style={{ width: 'auto', flex: 'none', marginTop: 0, padding: '6px 10px', fontSize: 12.5 }}
              value={fromYear} onChange={e => { const v = +e.target.value; setFromYear(v); if (v > toYear) setToYear(v); beep('tab'); }}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>–</span>
            <select className="p-input" style={{ width: 'auto', flex: 'none', marginTop: 0, padding: '6px 10px', fontSize: 12.5 }}
              value={toYear} onChange={e => { const v = +e.target.value; setToYear(v); if (v < fromYear) setFromYear(v); beep('tab'); }}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="memory" title="ยังไม่มีผลงานในช่วงนี้" description="ทำภารกิจแล้วส่งให้ผู้ปกครองอนุมัติ เรื่องราวการเรียนรู้จะถูกบันทึกไว้ตรงนี้" />
          ) : (
            <div className="portfolio-grid memory-book">
              {filtered.map((p, i) => <MemoryCard key={p.id} item={p} i={i} />)}
            </div>
          )}

          {/* badges */}
          <div className="sec-h"><h3 style={{ fontSize: 15 }}>🏅 เหรียญรางวัล</h3><span className="sub">Badges</span></div>
          <div className="card" style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {BADGES.map(b => (
              <div key={b.en} style={{ textAlign: 'center', opacity: b.got ? 1 : 0.4 }}>
                <div style={{ fontSize: 32, filter: b.got ? 'none' : 'grayscale(1)' }}>{b.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', marginTop: 2 }}>{b.th}</div>
                {!b.got && <div style={{ fontSize: 9, color: 'var(--ink-soft)' }}>ยังไม่ปลดล็อก</div>}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="sec-h" style={{ marginBottom: 0 }}>
            <h3>📊 สรุปหลักสูตร</h3>
            <span className="sub">{profile.grade} · {totalIndicators(profile.grade)} ตัวชี้วัด</span>
          </div>
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>กลุ่มประสบการณ์ที่ครอบคลุม ≥50%: <b style={{ color: 'var(--accent-deep)' }}>{covered}/7</b></div>
            {GROUPS.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 20, fontSize: 15 }}>{g.emoji}</span>
                <span style={{ width: 78, fontSize: 11.5, fontWeight: 600, color: 'var(--ink)' }}>{g.th}</span>
                <div style={{ flex: 1 }}><Bar value={progress[g.id] || 0} color={g.c} /></div>
                <span style={{ width: 30, textAlign: 'right', fontSize: 11, fontWeight: 700, color: g.c }}>{progress[g.id] || 0}%</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18, textAlign: 'center', background: 'var(--header-grad)', border: 'none', color: '#fff' }}>
            <div style={{ fontSize: 34 }}>📄</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginTop: 4, textShadow: '0 1px 2px rgba(0,0,0,.12)' }}>รายงานประเมินตนเอง</div>
            <div style={{ fontSize: 12, opacity: .92, marginBottom: 14 }}>SAR · {GRADE_LABEL[profile.grade] || profile.grade} · ส่ง สพฐ.</div>
            <button onClick={genSAR} style={{
              width: '100%', border: 'none', cursor: 'pointer', borderRadius: 999, padding: '13px',
              background: '#fff', color: 'var(--accent-deep)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
              boxShadow: '0 6px 16px -6px rgba(0,0,0,.3)',
            }}>⬇️ Generate SAR PDF</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--accent-deep)' }}>{portfolio.length}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>กิจกรรมบันทึกแล้ว</div>
            </div>
            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--good)' }}>{BADGES.filter(b => b.got).length}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>เหรียญที่ได้รับ</div>
            </div>
          </div>
        </>
      )}
      {sarOpen && <SARModal onClose={() => setSarOpen(false)} />}
    </div>
  );
}

Object.assign(window, { Portfolio, MemoryCard });

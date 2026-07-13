/* fw-portfolio.jsx — Digital Portfolio & Reports tab */
const { useState: useStateP } = React;

function Polaroid({ item, i }) {
  const g = GROUP[item.group];
  const rot = [-2.5, 1.8, -1.4, 2.2, -2][i % 5];
  const video = (item.evidence || []).find(e => e.type === 'video');
  const audio = (item.evidence || []).find(e => e.type === 'audio');
  return (
    <div style={{
      background: '#fff', padding: '10px 10px 0', borderRadius: 8, transform: `rotate(${rot}deg)`,
      boxShadow: '0 8px 18px -8px rgba(0,0,0,0.35)', border: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{ position: 'relative' }}>
        {item.thumb ? (
          <img src={item.thumb} alt={item.en} style={{ width: '100%', height: 104, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
        ) : video ? (
          <video src={video.url} controls playsInline style={{ width: '100%', height: 104, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
        ) : (
          <PhImg label={`📷 ${item.en}`} h={104} style={{ borderRadius: 4 }} />
        )}
        <span style={{ position: 'absolute', top: -8, right: -8, fontSize: 26, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.25))' }}>{item.badge}</span>
        <span style={{ position: 'absolute', bottom: 6, left: 6, background: g.c + 'ee', color: '#fff', fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>{g.emoji} {g.th}</span>
      </div>
      {audio && audio.url && (
        <audio controls src={audio.url} style={{ width: '100%', height: 26, marginTop: 6 }} />
      )}
      {item.praise && <div className="praise-note">💬 คุณแม่: {item.praise}</div>}
      {item.praiseAudio && (
        <audio controls src={item.praiseAudio} style={{ width: '100%', height: 26, marginTop: 4 }} title="เสียงชมจากคุณแม่" />
      )}
      <div style={{ padding: '8px 4px 12px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: '#4a3d4e' }}>{item.th}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 3, fontSize: 10.5, color: '#9a8ba0' }}>
          <span>{item.date}</span><span>·</span><span style={{ color: '#d99000', fontWeight: 700 }}>⭐ {item.stars}</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Adventure Journal — หนึ่งหน้าความทรงจำต่อหนึ่งผลงาน
   masking tape + paper card + สิ่งที่ได้เรียนรู้ + คำชมคุณแม่
   ========================================================= */
function JournalEntry({ item, i }) {
  const g = GROUP[item.group];
  const video = (item.evidence || []).find(e => e.type === 'video');
  const audio = (item.evidence || []).find(e => e.type === 'audio');
  const learned = (item.inds || []).slice(0, 3);
  return (
    <article className="mem-card">
      <span className={'mem-tape t' + (i % 3)} aria-hidden="true"></span>
      {i % 4 === 1 && <span className="mem-sticker" aria-hidden="true">⭐</span>}
      {i % 4 === 3 && <span className="mem-sticker" aria-hidden="true">🌸</span>}

      {item.thumb ? (
        <img className="mem-photo" src={item.thumb} alt={item.th} loading="lazy" />
      ) : video && video.url ? (
        <video className="mem-photo" src={video.url} controls playsInline preload="metadata" />
      ) : null}

      <div className="mem-title-row">
        <h4 className="mem-title">{item.th}</h4>
        <span className="mem-badge" style={{ background: g.c }}>{g.emoji} {g.th}</span>
      </div>
      {item.desc && <p className="mem-desc">{item.desc}</p>}

      {audio && audio.url && (
        <audio controls src={audio.url} style={{ width: '100%', height: 28, marginTop: 8 }} />
      )}

      {learned.length > 0 && (
        <div className="mem-learn">
          {learned.map((ind, k) => <span key={k} className="mem-skill">✓ {ind.split(' · ')[0]}</span>)}
        </div>
      )}

      {item.praise && <div className="praise-note">💬 คุณแม่บอกว่า: {item.praise}</div>}
      {item.praiseAudio && (
        <audio controls src={item.praiseAudio} style={{ width: '100%', height: 26, marginTop: 4 }} title="เสียงชมจากคุณแม่" />
      )}

      <div className="mem-foot">
        <span>{item.date}</span>
        <span className="mem-star">⭐ {item.stars}</span>
      </div>
    </article>
  );
}

/* จัดกลุ่มผลงานตามวัน (ใหม่→เก่า ตามลำดับใน state ซึ่ง prepend อยู่แล้ว) */
function journalDays(items) {
  const days = [];
  const byDate = new Map();
  items.forEach(p => {
    const key = p.date || 'ไม่ระบุวัน';
    if (!byDate.has(key)) { byDate.set(key, []); days.push(key); }
    byDate.get(key).push(p);
  });
  return days.map(d => ({ date: d, items: byDate.get(d) }));
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
        <span style={{ fontSize: 22 }}>{admin ? '👩‍🏫' : '🐰'}</span>
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
          {/* journal cover */}
          <div className={'j-cover' + (fwArt('scene', 'journal') ? ' has-art' : '')}>
            {fwArt('scene', 'journal') && <img className="j-cover-art" src={fwArt('scene', 'journal')} alt="" aria-hidden="true" />}
            <div className="j-cover-in">
              <h2><FwIcon name="book-open" style={{ verticalAlign: '-3px', color: 'var(--accent-deep)' }} /> สมุดบันทึกการผจญภัย</h2>
              <p>Adventure Journal · บันทึกแล้ว {filtered.length} ความทรงจำ</p>
            </div>
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
            <div className="hub-empty">
              <div style={{ fontSize: 38 }}>📖</div>
              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>หน้าแรกของสมุดยังว่างอยู่</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>ทำภารกิจแรกให้สำเร็จ แล้วความทรงจำจะถูกบันทึกที่นี่</div>
            </div>
          ) : (
            <div className="journal">
              {journalDays(filtered).map(day => (
                <div key={day.date}>
                  <div className="j-day">📌 {day.date}</div>
                  <div className="j-entries">
                    {day.items.map((p, i) => <JournalEntry key={p.id} item={p} i={i} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* badges */}
          <div className="sec-h"><h3 style={{ fontSize: 15 }}><FwIcon name="award" /> เหรียญรางวัล</h3><span className="sub">Badges</span></div>
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

Object.assign(window, { Portfolio });

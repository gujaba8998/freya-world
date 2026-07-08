/* fw-sar.jsx — Self-Assessment Report (SAR) document + printable full-screen overlay */
const { useState: useStateSar } = React;

/* The actual report body — reused in mini-preview and full overlay.
   Maps portfolio activities + indicators into a structured SAR layout. */
function SARDocument({ profile, portfolio, progress, planDoneCount, planTotal }) {
  const year = new Date().getFullYear() + 543;
  const overall = Math.round(GROUPS.reduce((s, g) => s + (progress[g.id] || 0), 0) / GROUPS.length);
  const byGroup = GROUPS.map(g => ({
    g, items: portfolio.filter(p => p.group === g.id),
  }));

  return (
    <div className="sar-doc">
      {/* ---- Page 1: cover + summary ---- */}
      <section className="sar-page">
        <div className="sar-emblem">๑</div>
        <div className="sar-head">
          <div className="sar-kicker">รายงานการประเมินตนเอง · Self-Assessment Report (SAR)</div>
          <h1>แผนการจัดการศึกษาขั้นพื้นฐานโดยครอบครัว</h1>
          <div className="sar-sub">บ้านเรียนเฟรญ่า · Homeschool Freya — ปีการศึกษา {year}</div>
        </div>

        <div className="sar-info">
          <div><span>ชื่อผู้เรียน</span><b>เด็กหญิง{profile.firstName || profile.name}{profile.lastName ? ' ' + profile.lastName : ''}</b></div>
          <div><span>ระดับชั้น</span><b>{GRADE_LABEL[profile.grade] || profile.grade}</b></div>
          <div><span>ปีการศึกษา</span><b>{year}</b></div>
          <div><span>ผู้จัดการศึกษา</span><b>มารดา (ผู้ปกครอง)</b></div>
          <div><span>สังกัด</span><b>สพป. เขตพื้นที่การศึกษา</b></div>
          <div><span>จำนวนตัวชี้วัด</span><b>{totalIndicators(profile.grade)} รายการ · 7 กลุ่ม</b></div>
        </div>

        <div className="sar-stats">
          <div className="sar-stat"><b>{portfolio.length}</b><span>กิจกรรมที่บันทึก</span></div>
          <div className="sar-stat"><b>{planDoneCount}/{planTotal}</b><span>กิจกรรมตามแผน</span></div>
          <div className="sar-stat"><b>{overall}%</b><span>ความก้าวหน้าเฉลี่ย</span></div>
          <div className="sar-stat"><b>{GROUPS.filter(g => (progress[g.id]||0) >= 50).length}/7</b><span>กลุ่มผ่านเกณฑ์</span></div>
        </div>

        <div className="sar-section-title">๑. สรุปพัฒนาการรายกลุ่มประสบการณ์</div>
        <table className="sar-table">
          <thead><tr><th>กลุ่มประสบการณ์</th><th>กิจกรรม</th><th>ความก้าวหน้า</th><th>ผลการประเมิน</th></tr></thead>
          <tbody>
            {byGroup.map(({ g, items }) => {
              const pct = progress[g.id] || 0;
              const grade = pct >= 75 ? 'ดีเยี่ยม' : pct >= 50 ? 'ดี' : pct >= 25 ? 'พอใช้' : 'ปรับปรุง';
              return (
                <tr key={g.id}>
                  <td><span className="sar-gdot" style={{ background: g.c }}></span>{g.emoji} {g.th}</td>
                  <td style={{ textAlign: 'center' }}>{items.length}</td>
                  <td>
                    <div className="sar-bar"><i style={{ width: pct + '%', background: g.c }}></i></div>
                    <span className="sar-pct">{pct}%</span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: pct >= 50 ? '#1f8a5b' : '#c0863a' }}>{grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ---- Page 2: portfolio evidence mapping ---- */}
      <section className="sar-page">
        <div className="sar-section-title">๒. หลักฐานการเรียนรู้และการเชื่อมโยงตัวชี้วัด</div>
        <div className="sar-evidence">
          {portfolio.slice(0, 6).map(p => {
            const g = GROUP[p.group];
            return (
              <div className="sar-ev" key={p.id}>
                <div className="sar-ev-img" style={{ borderColor: g.c, overflow: 'hidden', padding: p.thumb ? 0 : undefined }}>
                  {p.thumb ? (
                    <img src={p.thumb} alt={p.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <span>📷</span>
                      <small>{p.en}</small>
                    </>
                  )}
                </div>
                <div className="sar-ev-body">
                  <div className="sar-ev-title">{p.th} <span style={{ color: g.c }}>· {g.emoji} {g.th}</span></div>
                  {p.desc && <div className="sar-ev-desc">{p.desc}</div>}
                  {p.praise && <div className="sar-ev-desc">💬 ความเห็นผู้ปกครอง: {p.praise}</div>}
                  <div className="sar-ev-inds">
                    {(p.inds && p.inds.length ? p.inds : getIndicators(p.group, profile.grade).slice(0, 2)).map((ind, i) => (
                      <span key={i} className="sar-ind">✓ {ind.split(' · ')[0]}</span>
                    ))}
                  </div>
                  <div className="sar-ev-date">บันทึกเมื่อ {p.date} · ได้รับ {p.stars} ดาว</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sar-section-title" style={{ marginTop: 18 }}>๓. ความเห็นและการลงนาม</div>
        <div className="sar-opinion">
          ผู้เรียนมีพัฒนาการเหมาะสมตามวัยและครอบคลุมทั้ง 7 กลุ่มประสบการณ์ สามารถเชื่อมโยงการเรียนรู้
          กับชีวิตประจำวันได้ดี มีความรับผิดชอบ ใฝ่เรียนรู้ และร่วมกิจกรรมอย่างสม่ำเสมอตามแผนที่วางไว้
        </div>
        <div className="sar-sign">
          <div><div className="sar-line"></div>ผู้จัดการศึกษา (มารดา)</div>
          <div><div className="sar-line"></div>ผู้ประเมิน (สพป.)</div>
        </div>
        <div className="sar-foot">เอกสารนี้สร้างอัตโนมัติจากระบบ Freya's World · {new Date().toLocaleDateString('th-TH')}</div>
      </section>

      {/* ---- Appendix: real evidence photos from the portfolio ---- */}
      {(() => {
        const photos = portfolio.filter(p => p.thumb).slice(0, 12);
        if (!photos.length) return null;
        return (
          <section className="sar-page">
            <div className="sar-section-title">ภาคผนวก ก. ภาพหลักฐานการเรียนรู้</div>
            <div className="sar-photos">
              {photos.map(p => (
                <figure key={p.id} className="sar-photo">
                  <img src={p.thumb} alt={p.th} />
                  <figcaption>{GROUP[p.group].emoji} {p.th} · {p.date}{p.stars ? ` · ⭐ ${p.stars}` : ''}</figcaption>
                </figure>
              ))}
            </div>
            <div className="sar-foot" style={{ marginTop: 14 }}>
              ภาพทั้งหมดบันทึกผ่านระบบส่งงานของผู้เรียนและได้รับการอนุมัติโดยผู้จัดการศึกษา
            </div>
          </section>
        );
      })()}
    </div>
  );
}

/* Full-screen printable overlay (portal to document.body so it escapes the phone frame) */
function SARModal({ onClose }) {
  const { profile, portfolio, progress, planDone, beep, showToast } = useApp();
  const planTotal = planItems(profile.grade).length;
  const planDoneCount = planItems(profile.grade).filter(p => planDone.has(p.key)).length;

  const doPrint = () => {
    beep('reward');
    document.body.classList.add('sar-printing');
    showToast && showToast('เปิดหน้าต่างพิมพ์...', '🖨️');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('sar-printing');
    }, 250);
  };

  const node = (
    <div className="sar-portal" id="sar-portal">
      <div className="sar-toolbar">
        <button className="sar-tb-btn ghost" onClick={onClose}>✕ ปิด</button>
        <div className="sar-tb-title">ตัวอย่างรายงาน SAR · {GRADE_LABEL[profile.grade] || profile.grade}</div>
        <button className="sar-tb-btn" onClick={doPrint}>🖨️ พิมพ์ / บันทึก PDF</button>
      </div>
      <div className="sar-scroll">
        <SARDocument profile={profile} portfolio={portfolio} progress={progress}
          planDoneCount={planDoneCount} planTotal={planTotal} />
      </div>
    </div>
  );
  return ReactDOM.createPortal(node, document.body);
}

Object.assign(window, { SARDocument, SARModal });

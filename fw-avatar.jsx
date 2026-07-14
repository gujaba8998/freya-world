/* fw-avatar.jsx — Avatar picker: preset kawaii icons + custom photo upload */
const { useState: useStateAv, useEffect: useEffectAv, useRef: useRefAv } = React;

const AVATAR_PRESETS = [
  { id: 'rabbit',   emoji: '🐰', label: 'กระต่าย' },
  { id: 'cat',      emoji: '🐱', label: 'แมว' },
  { id: 'bear',     emoji: '🐻', label: 'หมี' },
  { id: 'panda',    emoji: '🐼', label: 'แพนด้า' },
  { id: 'fox',      emoji: '🦊', label: 'จิ้งจอก' },
  { id: 'dog',      emoji: '🐶', label: 'หมา' },
  { id: 'hamster',  emoji: '🐹', label: 'แฮมสเตอร์' },
  { id: 'koala',    emoji: '🐨', label: 'โคอาล่า' },
  { id: 'penguin',  emoji: '🐧', label: 'เพนกวิน' },
  { id: 'chick',    emoji: '🐥', label: 'ลูกไก่' },
  { id: 'frog',     emoji: '🐸', label: 'กบ' },
  { id: 'unicorn',  emoji: '🦄', label: 'ยูนิคอร์น' },
  { id: 'dragon',   emoji: '🐲', label: 'มังกร' },
  { id: 'owl',      emoji: '🦉', label: 'นกฮูก' },
  { id: 'butterfly',emoji: '🦋', label: 'ผีเสื้อ' },
  { id: 'star',     emoji: '⭐', label: 'ดาว' },
  { id: 'rainbow',  emoji: '🌈', label: 'สายรุ้ง' },
  { id: 'flower',   emoji: '🌸', label: 'ดอกไม้' },
  { id: 'sunflower',emoji: '🌻', label: 'ทานตะวัน' },
  { id: 'sparkles', emoji: '✨', label: 'ประกาย' },
  { id: 'princess', emoji: '👸', label: 'เจ้าหญิง' },
  { id: 'fairy',    emoji: '🧚', label: 'นางฟ้า' },
  { id: 'mermaid',  emoji: '🧜', label: 'นางเงือก' },
  { id: 'astronaut',emoji: '👩‍🚀', label: 'นักบินอวกาศ' },
];

/* The avatar display — used in Header and elsewhere */
function AvatarDisplay({ profile, size = 50, onClick }) {
  const isCustom = profile.avatar === 'custom';
  return (
    <button type="button" onClick={onClick} aria-label={onClick ? 'เปลี่ยนรูปประจำตัว' : undefined} style={{
      width: size, height: size, borderRadius: '50%', flex: 'none', cursor: onClick ? 'pointer' : 'default',
      background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center',
      fontSize: size * 0.55, boxShadow: '0 4px 10px -3px rgba(0,0,0,.25)',
      overflow: 'hidden', position: 'relative', border: 'none', padding: 0, font: 'inherit',
    }}>
      {isCustom ? (
        <image-slot id="avatar-photo" shape="circle"
          style={{ width: size + 'px', height: size + 'px', display: 'block' }}
          placeholder="📷" />
      ) : (
        <span style={{ lineHeight: 1 }}>{profile.avatar || '🐰'}</span>
      )}
      {onClick && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0, width: size * 0.36, height: size * 0.36,
          borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center',
          fontSize: size * 0.19, boxShadow: '0 2px 4px rgba(0,0,0,.25)', color: '#fff',
        }}>✎</div>
      )}
    </button>
  );
}

/* Full picker modal */
function AvatarPicker({ onClose }) {
  const { profile, saveProfile, beep } = useApp();
  const [tab, setTab] = useStateAv('icons'); // 'icons' | 'photo'
  const selected = profile.avatar || '🐰';

  const pick = (emoji) => {
    saveProfile({ avatar: emoji });
    beep('pop');
  };
  const pickCustom = () => {
    saveProfile({ avatar: 'custom' });
    setTab('photo');
    beep('pop');
  };

  return (
    <AccessibleOverlay onClose={onClose} labelledBy="avatar-picker-title" surfaceClassName="sheet av-sheet">
        <div className="sheet-grab"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div id="avatar-picker-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>เลือกไอคอนตัวเอง</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>Choose your avatar</div>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="ปิดตัวเลือกรูปประจำตัว">✕</button>
        </div>

        {/* tab switcher */}
        <div className="av-tabs">
          <button className={'av-tab' + (tab === 'icons' ? ' on' : '')} onClick={() => { setTab('icons'); beep('tab'); }}>
            🎨 ไอคอน Kawaii
          </button>
          <button className={'av-tab' + (tab === 'photo' ? ' on' : '')} onClick={() => { setTab('photo'); beep('tab'); }}>
            📷 รูปตัวเอง
          </button>
        </div>

        {tab === 'icons' && (
          <div className="av-grid">
            {AVATAR_PRESETS.map(a => (
              <button key={a.id} className={'av-item' + (selected === a.emoji ? ' on' : '')}
                onClick={() => pick(a.emoji)}>
                <span className="av-emoji">{a.emoji}</span>
                <span className="av-label">{a.label}</span>
                {selected === a.emoji && <span className="av-check">✓</span>}
              </button>
            ))}
          </div>
        )}

        {tab === 'photo' && (
          <div className="av-photo-area">
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 6 }}>ลากหรือคลิกเพื่ออัปโหลดรูป</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Drag & drop หรือ tap เพื่อเลือกรูปจากเครื่อง</div>
            </div>
            <div className="av-upload-wrap" onClick={pickCustom}>
              <image-slot id="avatar-photo-picker" shape="circle"
                style={{ width: '140px', height: '140px', display: 'block', margin: '0 auto' }}
                placeholder="📷 วางรูปที่นี่" />
            </div>
            {profile.avatar === 'custom' && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 12.5, color: 'var(--good)', fontWeight: 700 }}>✓ ใช้รูปของฉันแล้ว</span>
              </div>
            )}
            <button className="btn ghost block" style={{ marginTop: 14 }}
              onClick={() => { pick('🐰'); setTab('icons'); }}>
              ← กลับไปเลือกไอคอน
            </button>
          </div>
        )}

        <button className="btn block" style={{ marginTop: 14 }} onClick={onClose}>
          เสร็จแล้ว! บันทึกไอคอน ✓
        </button>
    </AccessibleOverlay>
  );
}

Object.assign(window, { AvatarDisplay, AvatarPicker, AVATAR_PRESETS });

/* fw-data.jsx — constants, helpers, shared atoms, per-app context */
const { createContext, useContext, useState, useEffect, useRef, useCallback } = React;

/* ---------------- guaranteed-unique id generator ----------------
   Date.now() alone collides when multiple items are created in the same
   millisecond (e.g. sending several plan activities in one loop) — which
   made two missions share an id and both react to a single accept/submit.
   This adds a monotonic counter + random suffix so every call is unique. */
let _uidSeq = 0;
function uid(prefix) {
  _uidSeq += 1;
  return prefix + Date.now().toString(36) + '_' + _uidSeq.toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---------------- 7 Experience Groups ---------------- */
const GROUPS = [
  { id: 'life',     en: 'Life Skills',    th: 'ทักษะชีวิต',   emoji: '🏠', c: '#ff9ec4' },
  { id: 'language', en: 'Language',       th: 'ภาษา',         emoji: '📖', c: '#ffb877' },
  { id: 'math',     en: 'Math',           th: 'คณิตศาสตร์',   emoji: '🔢', c: '#7fb1ff' },
  { id: 'science',  en: 'Science',        th: 'วิทยาศาสตร์',  emoji: '🔬', c: '#5fd0d8' },
  { id: 'agri',     en: 'Agriculture',    th: 'เกษตร',        emoji: '🌱', c: '#8fd694' },
  { id: 'social',   en: 'Social Studies', th: 'สังคมศึกษา',   emoji: '🌏', c: '#c3a3ff' },
  { id: 'art',      en: 'Art',            th: 'ศิลปะ',        emoji: '🎨', c: '#ff9aa2' },
];
const GROUP = Object.fromEntries(GROUPS.map(g => [g.id, g]));

/* learning indicators (มาตรฐานตัวชี้วัด) per group — short bilingual */
const INDICATORS = {
  life:     ['ดูแลตนเอง · Self-care', 'ความปลอดภัย · Safety', 'การวางแผน · Planning', 'มารยาท · Manners'],
  language: ['การอ่าน · Reading', 'การเขียน · Writing', 'การฟัง-พูด · Speaking', 'คำศัพท์ · Vocabulary'],
  math:     ['จำนวน · Numbers', 'การวัด · Measurement', 'รูปทรง · Geometry', 'การคิดเชิงตรรกะ · Logic'],
  science:  ['การสังเกต · Observation', 'การทดลอง · Experiment', 'ธรรมชาติ · Nature', 'ตั้งคำถาม · Inquiry'],
  agri:     ['การปลูก · Growing', 'ดินและน้ำ · Soil & water', 'วงจรชีวิต · Life cycle', 'ความรับผิดชอบ · Responsibility'],
  social:   ['ชุมชน · Community', 'วัฒนธรรม · Culture', 'ภูมิศาสตร์ · Geography', 'พลเมือง · Citizenship'],
  art:      ['ทัศนศิลป์ · Visual art', 'ดนตรี · Music', 'ความคิดสร้างสรรค์ · Creativity', 'การแสดง · Performance'],
};

/* cheer phrases shown when Freya accepts a mission — short, bilingual, game-like */
const CHEER_PHRASES = [
  'สู้ๆ นะ! · Fighting!',
  'ลุยเลย! · Let\'s go!',
  'เก่งมาก! · You\'ve got this!',
  'ทำได้แน่นอน! · You can do it!',
  'เต็มที่เลย! · Give it your all!',
  'ไปกันเลย! · Ready, set, go!',
];

/* ---------------- seed state ---------------- */
/* real-world use starts empty — no demo missions, wallet, or approval-queue items */

const DEFAULT_PROGRESS = { life: 0, language: 0, math: 0, science: 0, agri: 0, social: 0, art: 0 };

const REWARDS = [
  { id: 'r1', en: 'Extra screen time', th: 'เวลาดูจอเพิ่ม 30 นาที', emoji: '📱', cost: 50 },
  { id: 'r2', en: 'Choose dinner menu', th: 'เลือกเมนูมื้อเย็น',     emoji: '🍜', cost: 80 },
  { id: 'r3', en: 'Movie night',        th: 'ดูหนังกลางคืน',        emoji: '🍿', cost: 120 },
  { id: 'r4', en: 'New storybook',      th: 'หนังสือนิทานเล่มใหม่',  emoji: '📚', cost: 150 },
  { id: 'r5', en: 'Stay up 30 min late', th: 'นอนดึกขึ้น 30 นาที',  emoji: '🌙', cost: 60 },
  { id: 'r6', en: 'Trip to the park',   th: 'ไปเที่ยวสวนสนุก',      emoji: '🎡', cost: 220 },
];

const BADGES = [
  { emoji: '👩‍🍳', en: 'Little Chef',   th: 'เชฟน้อย',       got: false },
  { emoji: '🌻', en: 'Green Thumb',   th: 'นักปลูกต้นไม้', got: false },
  { emoji: '🎨', en: 'Artist',        th: 'ศิลปินตัวจิ๋ว',  got: false },
  { emoji: '📚', en: 'Bookworm',      th: 'หนอนหนังสือ',   got: false },
  { emoji: '🔬', en: 'Scientist',     th: 'นักวิทย์น้อย',  got: false },
  { emoji: '🏆', en: 'Week Streak',   th: 'ครบ 7 วัน',     got: false },
];

/* ---------------- Buddhist / Thai date ---------------- */
const TH_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const TH_DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
function thaiDate(d) {
  return {
    full: `วัน${TH_DAYS[d.getDay()]}ที่ ${d.getDate()} ${TH_MONTHS[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`,
    short: `${d.getDate()} ${TH_MONTHS[d.getMonth()].slice(0,3)}. ${d.getFullYear() + 543}`,
  };
}

/* ---------------- sound (gentle WebAudio blips) ---------------- */
let _actx = null;
function playSound(kind, enabled) {
  if (!enabled) return;
  try {
    _actx = _actx || new (window.AudioContext || window.webkitAudioContext)();
    const seq = kind === 'reward' ? [523, 659, 784, 1047] : kind === 'tab' ? [660] : [784, 988];
    seq.forEach((f, i) => {
      const o = _actx.createOscillator(), g = _actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      o.connect(g); g.connect(_actx.destination);
      const t = _actx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.start(t); o.stop(t + 0.2);
    });
  } catch (e) { /* ignore */ }
}

/* ===================================================================
   Per-app context (each phone instance gets its own independent store)
   =================================================================== */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

function AppProvider({ children, variant, settings }) {
  const [missions, setMissions] = useState([]);
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [stars, setStars] = useState(0);
  const [wallet, setWallet] = useState([]);
  const [portfolio, setPortfolio] = useState([]);   // starts empty — real work only, no seed examples
  const [rewards, setRewards] = useState(REWARDS);
  // Freya's Room — furniture collection bought with stars.
  // owned: item IDs purchased; placed: { slotId: itemId } for the room grid.
  // Catalog art (emoji now, images later) lives client-side in fw-rewards.jsx — only IDs sync.
  const [room, setRoom] = useState({ owned: [], placed: {} });
  const [dark, setDark] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(() => localStorage.getItem('fw_music') === '1');
  const [musicTrack, setMusicTrack] = useState(() => parseInt(localStorage.getItem('fw_music_track') || '0', 10) || 0);
  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState(0);   // bump to fire
  const [cheer, setCheer] = useState(null);       // { emoji, phrase } shown on Accept Mission
  const cheerTimer = useRef(null);
  const toastTimer = useRef(null);

  // profile + parent-mode (Layer 1: curriculum is parent-controlled)
  const [profile, setProfile] = useState({
    name: 'เฟรยา', firstName: 'เฟรยา', lastName: '', nickname: '', avatar: '🐰', birthYear: 2016, birthMonth: 3,
    gradeAuto: true, grade: 'ป.5', pin: '1234',
  });
  const [parentMode, setParentMode] = useState(false);

  // Approval queue (completed activities awaiting parent review)
  const [submissions, setSubmissions] = useState([]);
  // Reviewed history: log of approved / returned submissions
  const [reviewed, setReviewed] = useState([]);
  // Firebase sync status/family — declared early so submitMission (below) can use fbFamily for uploads
  const [fbStatus, setFbStatus] = useState('idle');   // idle|connecting|synced|error
  const [fbFamily, setFbFamily] = useState(fbLoadFamily());
  // Yearly curriculum tracker: set of completed plan-item keys
  const [planDone, setPlanDone] = useState(() => new Set());
  const togglePlan = useCallback((key) => {
    setPlanDone(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
    beepRef.current && beepRef.current('tab');
  }, []);

  const saveProfile = useCallback((patch) => {
    setProfile(p => {
      const next = { ...p, ...patch };
      if (next.gradeAuto && ('birthYear' in patch || 'gradeAuto' in patch)) {
        next.grade = calcGrade(next.birthYear).id;
      }
      return next;
    });
  }, []);

  const beep = useCallback((k) => playSound(k, soundOn), [soundOn]);
  const beepRef = useRef(null); beepRef.current = beep;

  // เพลงพื้นหลัง (music box) — เปิด/ปิด + จำค่าไว้ในเครื่อง
  useEffect(() => {
    localStorage.setItem('fw_music', musicOn ? '1' : '0');
    if (musicOn) window.musicStart && window.musicStart();
    else window.musicStop && window.musicStop();
  }, [musicOn]);
  // เลือกเพลง
  useEffect(() => {
    localStorage.setItem('fw_music_track', String(musicTrack));
    window.musicSetTrack && window.musicSetTrack(musicTrack);
  }, [musicTrack]);
  // autoplay policy: ถ้าเปิดไว้จากคราวก่อน เริ่มเล่นตอนแตะหน้าจอครั้งแรก
  useEffect(() => {
    if (!musicOn) return;
    const kick = () => { window.musicStart && window.musicStart(); };
    window.addEventListener('pointerdown', kick, { once: true });
    return () => window.removeEventListener('pointerdown', kick);
  }, []);

  const showToast = useCallback((msg, emoji) => {
    setToast({ msg, emoji });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const fireConfetti = useCallback(() => {
    if (settings.confetti === false) return;
    setConfetti(c => c + 1);
  }, [settings.confetti]);

  // ===== 3-STEP MISSION STATE MACHINE =====
  // available → accept → inprogress → submit → pending → approve → done

  // Step 1: Freya accepts a mission (available → inprogress)
  const acceptMission = useCallback((id) => {
    setMissions(ms => ms.map(m => m.id === id ? { ...m, status: 'inprogress' } : m));
    beep('pop');
    showToast('รับภารกิจแล้ว! · Mission accepted!', '🎯');
    const phrase = CHEER_PHRASES[Math.floor(Math.random() * CHEER_PHRASES.length)];
    setCheer({ id: uid('cheer'), phrase });
    clearTimeout(cheerTimer.current);
    cheerTimer.current = setTimeout(() => setCheer(null), 1800);
  }, [beep, showToast]);

  // Step 2: Freya submits evidence (inprogress → pending + adds to approval queue)
  const submitMission = useCallback(async (id, evidence) => {
    const m = missions.find(x => x.id === id);
    if (!m) return;
    const ev = evidence || [];
    const canUpload = fbFamily && fbGetStorage && fbGetStorage();
    const submissionId = uid('s');   // generated up front so failed-upload outbox entries can reference it
    // Upload every attached file to Cloud Storage (when connected) so Mother sees it on any device.
    // On failure/timeout/offline: DO NOT keep the local blob: URL in synced state — it dies on reload
    // and on every other device. Instead persist the actual file to a durable IndexedDB outbox and
    // leave url null + pendingUpload true, so a background retry can fill it in later without ever
    // having written a doomed reference to Firestore.
    let uploaded = ev;
    let fellBackOffline = false;
    if (canUpload) {
      try {
        uploaded = await Promise.all(ev.map(async (item) => {
          if (!item.file) return item;
          try {
            const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Upload timed out')), 15000));
            const cloudUrl = await Promise.race([fbUploadFile(fbFamily, item.file, item.type), timeout]);
            return { ...item, url: cloudUrl };
          } catch (e) {
            console.error('Evidence upload failed, queuing for retry:', e);
            fellBackOffline = true;
            try {
              await outboxPut({
                key: `${submissionId}::${item.id}`, familyCode: fbFamily,
                submissionId, evidenceId: item.id, kind: item.type, name: item.name,
                file: item.file, addedAt: Date.now(),
              });
            } catch (dbErr) { console.error('Outbox write failed (evidence may be lost if tab closes):', dbErr); }
            return { ...item, url: null, pendingUpload: true };
          }
        }));
      } catch (e) { console.error('Evidence upload batch failed:', e); fellBackOffline = true; }
    }
    const firstImg = uploaded.find(e => e.type === 'image' && e.url);
    const mediaType = uploaded.some(e => e.type === 'video') ? 'video' : uploaded.some(e => e.type === 'audio') ? 'audio' : 'photo';
    const mediaFiles = uploaded.map(e => ({ type: e.type, url: e.url, name: e.name, evidenceId: e.id, pendingUpload: !!e.pendingUpload }));
    const now = new Date();
    const timeStr = `วันนี้ ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setSubmissions(q => [{
      id: submissionId, th: m.th, en: m.en, group: m.group, stars: m.stars,
      desc: m.desc || `ส่งผลงานภารกิจ · Submitted from Today's Missions`, media: mediaType,
      thumb: firstImg ? firstImg.url : null, evCount: uploaded.length, evidence: mediaFiles,
      inds: (m.inds && m.inds.length ? m.inds.slice(0,3) : getIndicators(m.group, profile.grade || 'ป.5').slice(0,2)), when: timeStr,
      missionId: id,
    }, ...q]);
    setMissions(ms => ms.map(mm => mm.id === id ? { ...mm, status: 'pending' } : mm));
    beep('tab');
    fireConfetti();
    showToast(
      canUpload && !fellBackOffline ? 'ส่งผลงานขึ้นคลาวด์แล้ว! · Uploaded'
      : canUpload && fellBackOffline ? 'ส่งผลงานแล้ว (เน็ตช้า จะซิงก์ให้อัตโนมัติทีหลัง) · Sent (will retry sync)'
      : 'ส่งผลงานแล้ว · Sent to Mum!',
      '⏳'
    );
  }, [missions, beep, fireConfetti, showToast, profile, fbFamily]);

  // Background retry: scan the outbox and re-attempt any evidence uploads that
  // previously failed/timed out. Matches by evidenceId (not submissionId)
  // and patches BOTH `submissions` and `portfolio`, because mom may approve
  // a submission — moving it into portfolio under a brand-new id — before
  // the retry finishes. Matching only on submissionId would silently orphan
  // the upload the moment it gets approved.
  const retryPendingUploads = useCallback(async () => {
    if (!fbFamily || !(fbGetStorage && fbGetStorage())) return;
    let entries;
    try { entries = await outboxGetAll(); } catch (e) { console.error('Outbox read failed:', e); return; }
    for (const entry of entries) {
      if (entry.familyCode !== fbFamily) continue; // belongs to a different family/session, leave it
      try {
        const cloudUrl = await fbUploadFile(fbFamily, entry.file, entry.kind);
        const patchEvidence = (list) => list.map(e =>
          e.evidenceId === entry.evidenceId ? { ...e, url: cloudUrl, pendingUpload: false } : e);
        const patchThumbIfNeeded = (item, nextEvidence) => {
          if (item.thumb) return item.thumb;
          const img = nextEvidence.find(e => e.type === 'image' && e.url);
          return img ? img.url : item.thumb;
        };
        setSubmissions(subs => subs.map(s => {
          if (!(s.evidence || []).some(e => e.evidenceId === entry.evidenceId)) return s;
          const nextEvidence = patchEvidence(s.evidence);
          return { ...s, evidence: nextEvidence, thumb: patchThumbIfNeeded(s, nextEvidence) };
        }));
        setPortfolio(pf => pf.map(p => {
          if (!(p.evidence || []).some(e => e.evidenceId === entry.evidenceId)) return p;
          const nextEvidence = patchEvidence(p.evidence);
          return { ...p, evidence: nextEvidence, thumb: patchThumbIfNeeded(p, nextEvidence) };
        }));
        await outboxDelete(entry.key);
      } catch (e) {
        console.error('Retry upload still failing for', entry.key, '— will try again next trigger:', e);
      }
    }
  }, [fbFamily]);

  useEffect(() => {
    if (fbStatus !== 'synced') return;
    retryPendingUploads();
    const onOnline = () => retryPendingUploads();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [fbStatus, retryPendingUploads]);

  // Parent-mode direct toggle (still available in admin)
  const toggleMission = useCallback((id) => {
    const m = missions.find(x => x.id === id);
    if (!m) return;
    const isDone = m.status === 'done';
    if (!isDone) {
      setStars(s => s + m.stars);
      setProgress(p => ({ ...p, [m.group]: Math.min(100, (p[m.group] || 0) + 6) }));
      setWallet(w => [{ id: uid('wm'), label: 'รางวัลภารกิจ · ' + m.en, amount: m.stars, day: 'นี้' }, ...w]);
      beep('reward'); fireConfetti();
      showToast(`+${m.stars} ดาว! · ${m.en}`, '⭐');
    } else {
      setStars(s => Math.max(0, s - m.stars));
      setProgress(p => ({ ...p, [m.group]: Math.max(0, (p[m.group] || 0) - 6) }));
    }
    setMissions(ms => ms.map(mm => mm.id === id ? { ...mm, status: isDone ? 'available' : 'done', done: !isDone } : mm));
  }, [missions, beep, fireConfetti, showToast]);

  const addMission = useCallback((mission) => {
    setMissions(ms => [...ms, { ...mission, id: uid('m'), status: 'available', done: false }]);
    beep('pop');
    showToast('เพิ่มภารกิจใหม่! · Activity added', '✨');
  }, [beep, showToast]);

  // Parent repeats a completed mission — spawns a fresh copy so it can be done again
  // without touching the stars/credit already earned from the first completion.
  const repeatMission = useCallback((id) => {
    const m = missions.find(x => x.id === id);
    if (!m) return;
    setMissions(ms => [...ms, { ...m, id: uid('m'), status: 'available', done: false, returned: false }]);
    beep('pop');
    showToast('เพิ่มภารกิจนี้อีกครั้งแล้ว! · Ready to redo', '🔁');
  }, [missions, beep, showToast]);

  // Freya submits a standalone activity (from ActivityBuilder) for parent approval
  const submitActivity = useCallback((act) => {
    setSubmissions(q => [{ ...act, id: uid('s'), when: 'วันนี้' }, ...q]);
    beep('pop');
    showToast('ส่งให้คุณแม่ตรวจแล้ว · Sent for review', '⏳');
  }, [beep, showToast]);

  // Parent approves a submission -> credit stars, bump progress, add to portfolio, mark mission done
  const approveSubmission = useCallback((id) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    setStars(s => s + sub.stars);
    setProgress(p => ({ ...p, [sub.group]: Math.min(100, (p[sub.group] || 0) + 5) }));
    setWallet(w => [{ id: uid('wa'), label: 'อนุมัติกิจกรรม · ' + sub.en, amount: sub.stars, day: 'นี้' }, ...w]);
    setPortfolio(pf => {
      const now = new Date();
      return [{ id: uid('p'), en: sub.en, th: sub.th, group: sub.group,
        date: thaiDate(now).short, year: now.getFullYear() + 543, stars: sub.stars, badge: GROUP[sub.group].emoji, inds: sub.inds || [], desc: sub.desc,
        thumb: sub.thumb || null, media: sub.media || 'photo', evidence: sub.evidence || [] }, ...pf];
    });
    // mark the originating mission as done (if it came from missions list)
    if (sub.missionId) {
      setMissions(ms => ms.map(m => m.id === sub.missionId ? { ...m, status: 'done', done: true } : m));
    }
    beep('reward'); fireConfetti();
    showToast('อนุมัติแล้ว! +' + sub.stars + ' ⭐ · ' + sub.en, '✅');
    setReviewed(r => [{ id: uid('rv'), th: sub.th, en: sub.en, group: sub.group, stars: sub.stars,
      outcome: 'approved', thumb: sub.thumb || null, when: 'เมื่อสักครู่' }, ...r].slice(0, 40));
    setSubmissions(q => q.filter(s => s.id !== id));
  }, [submissions, beep, fireConfetti, showToast]);

  const rejectSubmission = useCallback((id) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    // send the mission back to Freya so she can redo & resubmit
    if (sub.missionId) {
      setMissions(ms => ms.map(m => m.id === sub.missionId ? { ...m, status: 'inprogress', done: false, returned: true } : m));
    }
    setReviewed(r => [{ id: uid('rv'), th: sub.th, en: sub.en, group: sub.group, stars: sub.stars,
      outcome: 'returned', thumb: sub.thumb || null, when: 'เมื่อสักครู่' }, ...r].slice(0, 40));
    setSubmissions(q => q.filter(s => s.id !== id));
    beep('tab');
    showToast('ส่งกลับให้เฟรยาแก้ไข · Returned', '↩️');
  }, [submissions, beep, showToast]);

  const redeem = useCallback((reward) => {
    if (stars < reward.cost) { showToast('ดาวไม่พอ · Not enough stars', '😅'); beep('pop'); return; }
    setStars(s => s - reward.cost);
    setWallet(w => [{ id: uid('wr'), label: 'แลกรางวัล · ' + reward.en, amount: -reward.cost, day: 'นี้' }, ...w]);
    beep('reward'); fireConfetti();
    showToast(`แลกสำเร็จ! · ${reward.en}`, reward.emoji);
  }, [stars, beep, fireConfetti, showToast]);

  // ---- Reward management (Parent mode) ----
  const setRewardCost = useCallback((id, delta) => {
    setRewards(rs => rs.map(r => r.id === id ? { ...r, cost: Math.max(5, r.cost + delta) } : r));
    beep('tab');
  }, [beep]);
  const updateReward = useCallback((id, patch) => {
    setRewards(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);
  const addReward = useCallback(() => {
    setRewards(rs => [...rs, { id: uid('r'), emoji: '🎁', th: 'รางวัลใหม่', en: 'New reward', cost: 50 }]);
    beep('pop'); showToast('เพิ่มรางวัลใหม่ · Reward added', '🎁');
  }, [beep, showToast]);
  const removeReward = useCallback((id) => {
    setRewards(rs => rs.filter(r => r.id !== id));
    beep('tab');
  }, [beep]);

  // ---- Freya's Room ----
  const buyRoomItem = useCallback((item) => {
    if (room.owned.includes(item.id)) { showToast('มีชิ้นนี้แล้ว · Already owned', '🛋️'); return; }
    if (stars < item.cost) { showToast('ดาวไม่พอ · Not enough stars', '😅'); beep('pop'); return; }
    setStars(s => s - item.cost);
    setWallet(w => [{ id: uid('wr'), label: 'ซื้อของแต่งห้อง · ' + item.en, amount: -item.cost, day: 'นี้' }, ...w]);
    setRoom(r => ({ ...r, owned: [...r.owned, item.id] }));
    beep('reward'); fireConfetti();
    showToast(`ได้ ${item.th} มาแต่งห้องแล้ว!`, item.emoji);
  }, [room.owned, stars, beep, fireConfetti, showToast]);

  const placeRoomItem = useCallback((slotId, itemId) => {
    setRoom(r => {
      const placed = { ...r.placed };
      if (itemId === null) { delete placed[slotId]; }
      else {
        // an item can only occupy one slot — remove it from any other slot first
        for (const k of Object.keys(placed)) { if (placed[k] === itemId) delete placed[k]; }
        placed[slotId] = itemId;
      }
      return { ...r, placed };
    });
    beep('pop');
  }, [beep]);

  /* ============================================================
     Firebase real-time sync (multi-device, PIN-only auth)
     ============================================================ */
  const fbSource = useRef(false);      // true while applying a remote snapshot (blocks echo-save)
  const fbSaveTimer = useRef(null);
  const fbReady = useRef(false);       // first snapshot received
  const fbUnsub = useRef(null);        // active snapshot listener (so disconnect can detach it)

  // Apply a remote snapshot to local state
  const applySnapshot = useCallback((data) => {
    if (!data) return;
    const s = fsToState(data);
    fbSource.current = true;
    if (s.missions.length) setMissions(s.missions);
    setStars(s.stars);
    if (Object.keys(s.progress).length) setProgress(s.progress);
    setWallet(s.wallet);
    setPortfolio(s.portfolio);
    setSubmissions(s.submissions);
    if (s.rewards) setRewards(s.rewards);
    if (s.profile) setProfile(s.profile);
    setPlanDone(s.planDone);
    if (s.room) setRoom(s.room);   // older cloud docs have no room — keep local then
    // release the guard after React flushes
    setTimeout(() => { fbSource.current = false; }, 0);
  }, []);

  // Connect on mount if config + family code exist
  useEffect(() => {
    const cfg = fbLoadConfig();
    const fam = fbLoadFamily();
    if (!cfg || !fam) return;
    setFbStatus('connecting');
    const db = fbInit(cfg);
    if (!db) { setFbStatus('error'); return; }
    let unsub = null;
    let cancelled = false;
    // MUST wait for anonymous auth to resolve before subscribing — the new
    // security rules require request.auth to be set. Firestore does NOT
    // auto-retry a listener after permission-denied, so subscribing early
    // would leave the app stuck on 'error' nondeterministically.
    fbAuthReady().then((user) => {
      if (cancelled) return;
      if (!user) { setFbStatus('error'); return; }
      unsub = fbDoc(fam).onSnapshot(
        (snap) => {
          if (snap.exists) applySnapshot(snap.data());
          fbReady.current = true;
          setFbStatus('synced');
        },
        (err) => { console.error('Firestore snapshot:', err); setFbStatus('error'); }
      );
      fbUnsub.current = unsub;
    });
    return () => { cancelled = true; unsub && unsub(); if (fbUnsub.current === unsub) fbUnsub.current = null; };
  }, [applySnapshot]);

  // Debounced push of local state → Firestore
  useEffect(() => {
    if (!fbFamily || fbStatus === 'idle') return;
    if (fbSource.current) return;        // change came FROM Firestore, don't echo
    if (!fbReady.current) return;        // wait for first snapshot to avoid clobbering
    clearTimeout(fbSaveTimer.current);
    fbSaveTimer.current = setTimeout(() => {
      if (fbSource.current) return;    // remote snapshot arrived while waiting — skip echo
      const doc = fbDoc(fbFamily);
      if (!doc) return;
      // No {merge:true} here on purpose: stateToFs() already serializes the
      // COMPLETE local state every push, so a full document replace is safe
      // and correctly reconstructs everything — including deletions of
      // nested map keys (e.g. removing a room item from `room.placed`).
      // merge:true would NOT delete a key just because it's absent from the
      // new data — Firestore only adds/updates present keys during a merge;
      // an actual deletion needs FieldValue.delete(), which we don't track
      // per-key here. That mismatch was exactly why a removed room item
      // reappeared: the server kept the "deleted" key and the next
      // snapshot echoed it back into local state.
      doc.set(stateToFs({ missions, stars, progress, wallet, portfolio, submissions, rewards, profile, planDone, room }))
        .catch(e => { console.error('Firestore save:', e); setFbStatus('error'); });
    }, 1200);
    return () => clearTimeout(fbSaveTimer.current);
  }, [missions, stars, progress, wallet, portfolio, submissions, rewards, profile, planDone, room, fbFamily, fbStatus]);

  // Called by the setup wizard once config is saved + family code chosen.
  // Waits for anon auth explicitly rather than trusting call order.
  const fbConnect = useCallback((familyCode) => {
    setFbFamily(familyCode);
    setFbStatus('connecting');
    const cfg = fbLoadConfig();
    const db = fbInit(cfg);
    if (!db) { setFbStatus('error'); return; }
    fbAuthReady().then(user => {
    if (!user) { setFbStatus('error'); return; }
    const doc = fbDoc(familyCode);
    // seed the doc if empty, then rely on the mount-effect snapshot listener on next load
    doc.get().then(snap => {
      if (!snap.exists) {
        fbReady.current = true;
        doc.set(stateToFs({ missions, stars, progress, wallet, portfolio, submissions, rewards, profile, planDone, room }));
      } else {
        applySnapshot(snap.data());
        fbReady.current = true;
      }
      // live listener (detach any previous one first)
      if (fbUnsub.current) { try { fbUnsub.current(); } catch(e) {} }
      fbUnsub.current = doc.onSnapshot(s => { if (s.exists) applySnapshot(s.data()); setFbStatus('synced'); },
        e => { console.error(e); setFbStatus('error'); });
      setFbStatus('synced');
    }).catch(e => { console.error(e); setFbStatus('error'); });
    }); // end fbAuthReady().then
  }, [missions, stars, progress, wallet, portfolio, submissions, rewards, profile, planDone, room, applySnapshot]);

  const fbDisconnect = useCallback(() => {
    if (fbUnsub.current) { try { fbUnsub.current(); } catch(e) {} fbUnsub.current = null; }
    clearTimeout(fbSaveTimer.current);
    localStorage.removeItem('fw_famcode');
    setFbFamily(''); setFbStatus('idle'); fbReady.current = false;
  }, []);

  // ---- เลเวลจากดาวสะสมตลอดกาล (รายรับทั้งหมดในกระเป๋าเงิน) ----
  const lifetimeStars = wallet.reduce((s, w) => s + (w.amount > 0 ? w.amount : 0), 0);
  const level = Math.floor(lifetimeStars / 100) + 1;
  const levelInto = lifetimeStars % 100;   // 0-99 ดาวที่เก็บได้ในเลเวลนี้
  const prevLevel = useRef(null);
  useEffect(() => {
    if (prevLevel.current === null) { prevLevel.current = level; return; }
    if (level > prevLevel.current) {
      fireConfetti(); beep('reward');
      showToast(`เลเวลอัพ! ตอนนี้ Level ${level} แล้ว · Level up!`, '🎉');
    }
    prevLevel.current = level;
  }, [level, fireConfetti, beep, showToast]);

  // ---- สำรอง/กู้คืนข้อมูล (Backup / Restore) ----
  // Adapted from an unshipped draft — only fields that actually exist in
  // THIS app's state are included (no activityDays/markActivityToday, those
  // belong to a badge-streak system this codebase doesn't have; `room` is
  // added since it didn't exist when the draft was written).
  const exportBackup = useCallback(() => {
    const data = {
      app: 'freyas-world', version: 1, exportedAt: new Date().toISOString(),
      missions, progress, stars, wallet, portfolio, submissions, reviewed, rewards, profile,
      planDone: [...planDone], room,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const d = new Date();
    a.download = `freya-backup-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    beep('reward');
    showToast('ดาวน์โหลดไฟล์สำรองแล้ว · Backup saved', '💾');
  }, [missions, progress, stars, wallet, portfolio, submissions, reviewed, rewards, profile, planDone, room, beep, showToast]);

  const importBackup = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const d = JSON.parse(reader.result);
          if (d.app !== 'freyas-world') throw new Error('not a Freya backup');
          if (Array.isArray(d.missions)) setMissions(d.missions);
          if (d.progress) setProgress(d.progress);
          if (typeof d.stars === 'number') setStars(d.stars);
          if (Array.isArray(d.wallet)) setWallet(d.wallet);
          if (Array.isArray(d.portfolio)) setPortfolio(d.portfolio);
          if (Array.isArray(d.submissions)) setSubmissions(d.submissions);
          if (Array.isArray(d.reviewed)) setReviewed(d.reviewed);
          if (Array.isArray(d.rewards)) setRewards(d.rewards);
          if (d.profile) setProfile(p => ({ ...p, ...d.profile }));
          if (Array.isArray(d.planDone)) setPlanDone(new Set(d.planDone));
          if (d.room) setRoom(d.room);
          beep('reward'); fireConfetti();
          showToast('กู้คืนข้อมูลสำเร็จ! · Restored', '✅');
          resolve();
        } catch (e) {
          showToast('ไฟล์ไม่ถูกต้อง · Invalid backup file', '⚠️');
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, [beep, fireConfetti, showToast]);

  const val = {
    variant, settings,
    missions, progress, stars, wallet, portfolio, lifetimeStars, level, levelInto,
    dark, setDark, soundOn, setSoundOn, musicOn, setMusicOn, musicTrack, setMusicTrack,
    toast, confetti, showToast, fireConfetti,
    cheer, setCheer,
    toggleMission, acceptMission, submitMission, addMission, repeatMission, redeem, beep,
    rewards, setRewardCost, updateReward, addReward, removeReward,
    room, buyRoomItem, placeRoomItem,
    profile, saveProfile, parentMode, setParentMode,
    submissions, submitActivity, approveSubmission, rejectSubmission,
    reviewed,
    planDone, togglePlan,
    fbStatus, fbFamily, fbConnect, fbDisconnect,
    exportBackup, importBackup,
  };
  return <AppCtx.Provider value={val}>{children}</AppCtx.Provider>;
}

/* ===================================================================
   Shared atoms
   =================================================================== */
function ProgressRing({ value, size = 58, stroke = 7, color, track, children }) {
  const deg = Math.round((value / 100) * 360);
  return (
    <div className="ring" style={{ width: size, height: size, background: `conic-gradient(${color} ${deg}deg, ${track || 'rgba(0,0,0,0.06)'} ${deg}deg)` }}>
      <div className="ring-inner" style={{ width: size - stroke * 2, height: size - stroke * 2 }}>
        {children}
      </div>
    </div>
  );
}

function GroupDot({ id, size = 34, ring }) {
  const g = GROUP[id];
  return (
    <div style={{
      width: size, height: size, borderRadius: '32%', flex: 'none',
      display: 'grid', placeItems: 'center', fontSize: size * 0.5,
      background: g.c + '33', boxShadow: ring ? `0 0 0 2px ${g.c}` : 'none',
    }}>{g.emoji}</div>
  );
}

function Bar({ value, color }) {
  return (
    <div style={{ height: 9, borderRadius: 999, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div className="bar-fill" style={{ width: value + '%', height: '100%', borderRadius: 999, background: color, transition: 'width .5s cubic-bezier(.34,1.56,.64,1)' }}></div>
    </div>
  );
}

function PhImg({ label, h = 110, style }) {
  return <div className="ph-img" style={{ height: h, borderRadius: 12, ...style }}>{label}</div>;
}

Object.assign(window, {
  GROUPS, GROUP, INDICATORS, REWARDS, BADGES,
  thaiDate, playSound, AppCtx, useApp, AppProvider,
  ProgressRing, GroupDot, Bar, PhImg,
});

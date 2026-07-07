/* fw-cheer.jsx — cute chibi-style cheer popup shown when Freya accepts a mission.
   Uses her own chosen avatar (emoji, kawaii-style) as the "chibi character" so it
   always matches whatever she picked — no separate art asset to keep in sync. */
const { useState: useStateCh, useEffect: useEffectCh } = React;

function CheerPopup() {
  const { cheer, profile, setCheer } = useApp();
  if (!cheer) return null;
  const [th, en] = (cheer.phrase || '').split(' · ');
  const avatarEmoji = profile.avatar && profile.avatar !== 'custom' ? profile.avatar : '🐰';

  return (
    <div className="cheer-layer" onClick={() => setCheer(null)}>
      <div className="cheer-card" key={cheer.id}>
        <div className="cheer-sparkle s1">✨</div>
        <div className="cheer-sparkle s2">⭐</div>
        <div className="cheer-sparkle s3">✨</div>
        <div className="cheer-mascot">{avatarEmoji}</div>
        <div className="cheer-bubble">
          <div className="cheer-th">{th}</div>
          {en && <div className="cheer-en">{en}</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CheerPopup });

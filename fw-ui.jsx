/* fw-ui.jsx — shared, presentation-only primitives for the app shell. */
const { useEffect: useEffectUI, useRef: useRefUI } = React;

const ICON_PATHS = {
  home: <><path d="M3.5 10.7 12 3.8l8.5 6.9"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-6h5v6"/></>,
  quests: <><path d="M6 3.5h10a2 2 0 0 1 2 2v15H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="M8 8h6M8 12h6M8 16h4"/><path d="m17 3.5 2-1v15l-2 1"/></>,
  world: <><circle cx="12" cy="12" r="8.5"/><path d="M3.8 10h16.4M3.8 14h16.4M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5S14.2 18.2 12 20.5M12 3.5C9.8 5.8 8.8 8.6 8.8 12s1 6.2 3.2 8.5"/></>,
  memory: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z"/></>,
  rewards: <><path d="M4 9h16v11H4Z"/><path d="M3 6h18v4H3Z"/><path d="M12 6v14"/><path d="M12 6c-2.8 0-5-1.1-5-3 2.6-.8 4.4.2 5 3ZM12 6c2.8 0 5-1.1 5-3-2.6-.8-4.4.2-5 3Z"/></>,
  create: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/><path d="m14.5 5.5 3 3"/></>,
  parent: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20v-2.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V20"/><path d="M15 14h1.7a3.8 3.8 0 0 1 3.8 3.8V20"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34A1.7 1.7 0 0 0 10 4.09V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87A1.7 1.7 0 0 0 21 12h.09a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6-1Z"/></>,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>,
  level: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z"/></>,
  shapes: <><circle cx="8" cy="8" r="4"/><path d="m16 4 5 9H11Z"/><path d="M5 15h7v7H5Z"/></>,
  science: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 16h9"/></>,
  leaf: <><path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z"/><path d="M4 21c2-6 6-9 12-12"/></>,
  sparkle: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  empty: <><path d="M5 7.5h14v11H5Z"/><path d="m8 7.5 1.2-3h5.6l1.2 3"/><path d="M9 12h6"/></>,
};

function AppIcon({ name, size = 20, label, className = '' }) {
  return (
    <svg className={'app-icon ' + className} width={size} height={size} viewBox="0 0 24 24"
      fill={name === 'star' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined} aria-label={label}>
      {ICON_PATHS[name] || ICON_PATHS.empty}
    </svg>
  );
}

function StarCounter({ value, className = '' }) {
  return <span className={'star-counter ' + className} aria-label={`${value} ดาว`}><AppIcon name="star" size={15} />{value}</span>;
}

function LevelProgress({ level, value }) {
  return (
    <span className="level-progress" title={`${value}/100 ดาวสะสมในเลเวลนี้`}>
      <AppIcon name="level" size={13} /> Lv {level}
      <i aria-hidden="true"><b style={{ width: value + '%' }} /></i>
    </span>
  );
}

function StatusBadge({ tone = 'neutral', children, className = '' }) {
  return <span className={`status-badge ${tone} ${className}`}>{children}</span>;
}

function EmptyState({ icon = 'empty', title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state-mark" aria-hidden="true"><AppIcon name={icon} size={28} /></span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

function LoadingSkeleton({ lines = 3, label = 'กำลังโหลด' }) {
  return (
    <div className="loading-skeleton" role="status" aria-label={label}>
      {Array.from({ length: lines }, (_, i) => <span key={i} />)}
    </div>
  );
}

function ErrorState({ title = 'เปิดข้อมูลไม่ได้', description, onRetry }) {
  return <div className="error-state" role="alert">
    <span aria-hidden="true"><AppIcon name="empty" size={25} /></span>
    <div><strong>{title}</strong>{description && <p>{description}</p>}</div>
    {onRetry && <button className="btn ghost" onClick={onRetry}>ลองอีกครั้ง</button>}
  </div>;
}

function Surface({ as = 'div', className = '', children, ...props }) {
  const Element = as;
  return <Element className={'ui-surface ' + className} {...props}>{children}</Element>;
}

function IconButton({ icon, label, className = '', size = 20, ...props }) {
  return (
    <button type="button" className={'icon-button ' + className} aria-label={label} title={label} {...props}>
      <AppIcon name={icon} size={size} />
    </button>
  );
}

function AccessibleOverlay({
  children, onClose, labelledBy, describedBy, className = 'overlay',
  surfaceClassName = 'sheet', surfaceStyle, portal = true, closeOnBackdrop = true,
}) {
  const surfaceRef = useRefUI(null);
  const openerRef = useRefUI(null);
  // Keep the latest close handler without restarting focus management while typing.
  const onCloseRef = useRefUI(onClose);
  onCloseRef.current = onClose;

  useEffectUI(() => {
    openerRef.current = document.activeElement;
    const surface = surfaceRef.current;
    if (!surface) return undefined;
    const focusables = () => [...surface.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true');
    const first = focusables()[0];
    requestAnimationFrame(() => (first || surface).focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) { event.preventDefault(); surface.focus(); return; }
      const firstItem = items[0], lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) { event.preventDefault(); lastItem.focus(); }
      else if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); firstItem.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (openerRef.current && document.contains(openerRef.current)) openerRef.current.focus();
    };
  }, []);

  const node = (
    <div className={className} onClick={(event) => {
      if (closeOnBackdrop && event.target === event.currentTarget) onCloseRef.current();
    }}>
      <div ref={surfaceRef} className={surfaceClassName} style={surfaceStyle} role="dialog" aria-modal="true"
        aria-labelledby={labelledBy} aria-describedby={describedBy} tabIndex="-1">
        {children}
      </div>
    </div>
  );
  return portal ? <AppOverlayPortal>{node}</AppOverlayPortal> : node;
}

function ConfirmationDialog({ title, description, confirmLabel = 'ยืนยัน', cancelLabel = 'ยกเลิก', onConfirm, onClose, tone = 'primary' }) {
  return (
    <AccessibleOverlay onClose={onClose} labelledBy="confirmation-dialog-title" describedBy="confirmation-dialog-description"
      surfaceClassName="sheet confirmation-dialog">
      <h2 id="confirmation-dialog-title">{title}</h2>
      {description && <p id="confirmation-dialog-description">{description}</p>}
      <div className="confirmation-actions">
        <button className="btn ghost" onClick={onClose}>{cancelLabel}</button>
        <button className={'btn ' + (tone === 'danger' ? 'danger' : '')} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </AccessibleOverlay>
  );
}

Object.assign(window, {
  AppIcon, StarCounter, LevelProgress, StatusBadge, EmptyState, LoadingSkeleton, ErrorState, Surface, IconButton,
  AccessibleOverlay, ConfirmationDialog,
});

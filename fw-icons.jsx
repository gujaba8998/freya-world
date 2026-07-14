/* fw-icons.jsx — Freya's World icon system
   One uniform stroke family (24x24 viewBox, stroke 1.9, round caps,
   currentColor) so structural UI never depends on OS emoji rendering.
   Emojis remain welcome in CONTENT (mascot, stickers, reward art,
   motivational copy) — this set covers navigation, section headers,
   tabs and action chrome only. Add new glyphs to FW_ICON_PATHS. */

const FW_ICON_PATHS = {
  home: (
    <path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
  ),
  pencil: (
    <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  ),
  image: (
    <g>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.6" />
      <path d="m21 15-5-5L5 21" />
    </g>
  ),
  gift: (
    <g>
      <path d="M20 12v10H4V12" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5A2.5 2.5 0 1 1 10 4.5C10.9 5.4 12 7 12 7z" />
      <path d="M12 7h4.5A2.5 2.5 0 1 0 14 4.5C13.1 5.4 12 7 12 7z" />
    </g>
  ),
  user: (
    <g>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 21v-1.5A4.5 4.5 0 0 1 8.5 15h7a4.5 4.5 0 0 1 4.5 4.5V21" />
    </g>
  ),
  target: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" />
    </g>
  ),
  map: (
    <g>
      <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
      <path d="M9 4v13" />
      <path d="M15 6.5v13" />
    </g>
  ),
  award: (
    <g>
      <circle cx="12" cy="9" r="6" />
      <path d="m8.8 14.2-1.3 7L12 18.6l4.5 2.6-1.3-7" />
    </g>
  ),
  package: (
    <g>
      <path d="M21 8v9.5l-9 4.5-9-4.5V8l9-4.5z" />
      <path d="m3 8 9 4.5L21 8" />
      <path d="M12 12.5V22" />
    </g>
  ),
  bed: (
    <g>
      <path d="M2 6v12" />
      <path d="M2 14h20v4" />
      <path d="M22 14v-3a3 3 0 0 0-3-3h-9v6" />
      <circle cx="6" cy="10" r="2" />
    </g>
  ),
  shirt: (
    <path d="M8 3 4.5 5.5 6 9l2-1v13h8V8l2 1 1.5-3.5L16 3a4 4 0 0 1-8 0z" />
  ),
  star: (
    <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z" />
  ),
  wallet: (
    <g>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M16 13.5h5" />
      <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </g>
  ),
  'book-open': (
    <g>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </g>
  ),
  inbox: (
    <g>
      <path d="M22 13h-5l-2 3h-6l-2-3H2" />
      <path d="M5 4h14l3 9v7H2v-7z" />
    </g>
  ),
  list: (
    <g>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </g>
  ),
  file: (
    <g>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
    </g>
  ),
  plus: (
    <g>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </g>
  ),
  store: (
    <g>
      <path d="M4 4h16l2 5H2z" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
    </g>
  ),
};

function FwIcon({ name, size = 18, style, className }) {
  const p = FW_ICON_PATHS[name];
  if (!p) return null;
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {p}
    </svg>
  );
}

Object.assign(window, { FwIcon, FW_ICON_PATHS });

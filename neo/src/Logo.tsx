export function Mark({ size = 36 }: { size?: number }) {
  return (<svg className="mark" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle className="ring" cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="3" pathLength="1"/>
    <path d="M16.5 32V16l15 16V16" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <circle cx="31.5" cy="16" r="3.6" fill="var(--accent)"/></svg>);
}
export function Logo() { return <span className="logo"><Mark /><b>NEO</b></span>; }

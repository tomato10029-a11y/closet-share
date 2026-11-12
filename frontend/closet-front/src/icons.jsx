// 심플한 라인 아이콘 (24x24, 선 두께 1.8, currentColor). 색은 부모의 color를 따라갑니다.
const P={
  search:<><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></>,
  plus:<path d="M12 5v14M5 12h14"/>,
  camera:<><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/></>,
  idcard:<><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.8-2.3 3-2.3s2.4.7 3 2.3M14.5 10h4M14.5 13.5h3"/></>,
  wallet:<><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17v3"/><path d="M4 7.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 1 4 7.5z"/><circle cx="16" cy="13.5" r="1"/></>,
  jacket:<><path d="M9 3.5L4.5 6 3 19h3.5L7 10.5V20h10v-9.5l.5 8.5H21L19.5 6 15 3.5 12 9z"/><path d="M12 9v11"/></>,
  dress:<><path d="M8.5 3.5L9 9.5 6 20q6 1.5 12 0L15 9.5l.5-6"/><path d="M8.5 3.5q3.5 3.5 7 0M9 9.5h6"/></>,
  sparkle:<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16v4M16.5 18h4"/></>,
  hanger:<><path d="M12 8V6.5a2 2 0 1 1 2 2"/><path d="M12 8l8.5 6.5a1.2 1.2 0 0 1-.7 2.2H4.2a1.2 1.2 0 0 1-.7-2.2z"/></>,
};
export function Icon({name,size=24,...p}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...p}>{P[name]||P.hanger}</svg>;
}

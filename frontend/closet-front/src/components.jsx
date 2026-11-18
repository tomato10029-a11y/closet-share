import {useState} from 'react';
import {won,ICON} from './mock/data.js';import {Icon} from './icons.jsx';
export const Chip=({on,...p})=><button className={'chip'+(on?' on':'')} {...p}/>;
export function Thumb({item,src,h=140,label}){
  return <div className="thumb" style={{height:h,background:src?'#000':`linear-gradient(135deg,${item.tone[0]},${item.tone[1]})`}}>
    {src?<img src={src} alt={item.name}/>:<span className="ico" aria-hidden><Icon name={ICON[item.category]||item.icon} size={28}/></span>}{label&&<em className="lbl">{label}</em>}</div>;
}
export function ItemCard({item,onClick}){
  return <button className="card icard" onClick={onClick}>
    <Thumb item={item} src={item.photos?.[0]} h={130}/>
    <h3>{item.name}</h3><div className="m"><span className="badge">{item.category}</span> {item.size} · {item.cond}</div>
    {item.trust&&<TrustLine t={item.trust}/>}
    <div className="p">{won(item.rent)} <small>/ 보증금 {won(item.deposit)}</small></div></button>;
}
// 전/후 사진 비교 슬라이더 (드래그해서 비교)
export function Compare({item,before,after}){
  const [x,setX]=useState(50);
  return <div className="cmp">
    <Thumb item={item} src={after} h="100%"/>
    <div style={{position:'absolute',inset:0,clipPath:`inset(0 ${100-x}% 0 0)`}}><Thumb item={item} src={before} h="100%"/></div>
    <span className="tag" style={{left:8}}>인수 전</span><span className="tag" style={{right:8}}>반납 후</span>
    <div className="bar" style={{left:x+'%'}}/>
    <input type="range" min="0" max="100" value={x} onChange={e=>setX(+e.target.value)} aria-label="전후 사진 비교"/></div>;
}

// 별점: 5개 별 위에 채운 별을 점수만큼 덮어서 소수점 점수도 표현해요.
export function Stars({value,size=13}){
  const pct=value==null?0:Math.max(0,Math.min(100,value/5*100));
  return <span className="stars" role="img" style={{fontSize:size}} aria-label={value==null?'별점 없음':`별점 5점 만점에 ${value.toFixed(1)}점`}>
    <span aria-hidden="true">★★★★★</span><span className="on" aria-hidden="true" style={{width:pct+'%'}}>★★★★★</span></span>;
}
// 둘러보기 카드용 한 줄 요약: 별점 · 후기 수 / 대여 횟수 · 무사고 여부
export function TrustLine({t}){
  if(t.isNew)return <div className="tr"><div className="r1"><span className="tchip new">새 옷</span><span>아직 대여 이력이 없어요</span></div></div>;
  return <div className="tr">
    <div className="r1">{t.avg==null?<span>후기 없음</span>:<><Stars value={t.avg}/><b>{t.avg.toFixed(1)}</b><span>({t.reviews.length})</span></>}</div>
    <div className="r2"><span>대여 {t.rentals}회</span>{t.incidents===0?<span className="tchip">무사고</span>:<span className="tchip warn">사고 {t.incidents}건</span>}</div>
  </div>;
}
// 상세 화면용: 수치 3칸 + 후기 목록
export function TrustSection({t}){
  return <>
    <h2>대여 이력과 후기</h2>
    {t.isNew?<div className="note">아직 대여 이력이 없는 새 옷이에요. 첫 대여가 끝나면 대여 횟수와 후기가 여기에 쌓여요.</div>:<>
      <div className="stats3">
        <div className="card">{t.avg==null?<><b>-</b><span className="cap">아직 별점이 없어요</span></>:<><b>{t.avg.toFixed(1)}</b><Stars value={t.avg} size={12}/><span className="cap">후기 {t.reviews.length}개</span></>}</div>
        <div className="card"><b>{t.rentals}회</b><span className="cap">대여 횟수</span></div>
        <div className="card">{t.incidents===0?<><b>무사고</b><span className="cap">{t.rentals}회 모두 이상 없이 반납</span></>:<><b className="warn">사고 {t.incidents}건</b><span className="cap">{t.rentals}회 중 {t.rentals-t.incidents}회 무사고</span></>}</div>
      </div>
      <p className="sm" style={{marginTop:8}}>사고는 반납할 때 오염·손상으로 보증금이 차감된 대여예요.</p>
      {t.reviews.length?<ul className="rv">{t.reviews.map((r,i)=><li key={i}><div className="h"><Stars value={r.stars}/><span>경북대 재학생</span></div><p>{r.text}</p></li>)}</ul>
        :<div className="note" style={{marginTop:10}}>아직 남겨진 후기가 없어요.</div>}
    </>}
  </>;
}

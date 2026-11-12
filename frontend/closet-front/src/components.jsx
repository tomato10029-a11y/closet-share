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

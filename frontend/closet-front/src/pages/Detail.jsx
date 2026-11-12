import {useEffect,useState} from 'react';import {useNavigate,useParams} from 'react-router-dom';
import {api} from '../api/client.js';import {COMP,won} from '../mock/data.js';import {Thumb} from '../components.jsx';
export default function Detail(){
  const {id}=useParams();const nav=useNavigate();const [it,setIt]=useState(null);const [from,setFrom]=useState('');const [to,setTo]=useState('');const [open,setOpen]=useState(false);const [busy,setBusy]=useState(false);
  useEffect(()=>{api.getItem(id).then(setIt);},[id]);
  if(!it)return <div className="pad"><p className="lead">불러오는 중이에요…</p></div>;
  const send=async()=>{setBusy(true);await api.createRental(it.id,from,to);nav('/handover');};
  return <div style={{paddingBottom:90}}>
    <div className="pad" style={{paddingBottom:8}}><button className="back" onClick={()=>nav(-1)}>← 목록</button></div>
    <div className="snap">{(it.photos?.length?it.photos:[null,null,null]).map((p,i)=><div key={i}><Thumb item={it} src={p} h={260} label={['정면','뒷면','디테일'][i]}/></div>)}</div>
    <div className="pad">
      <span className="badge">{it.category}</span><h1 style={{marginTop:6}}>{it.name}</h1>
      <p className="lead">사이즈 {it.size} · {it.cond} · {it.owner}</p>
      <div className="price"><div className="card"><b>{won(it.rent)}</b><span>대여료(1~3일)</span></div><div className="card"><b>{won(it.deposit)}</b><span>보증금(반납 시 환불)</span></div></div>
      <h2>보상 기준표</h2>
      {COMP.map(([t,d])=><details key={t}><summary>{t}</summary><p>{d}</p></details>)}
      <h2>대여 날짜</h2>
      <div className="row"><div><label className="sm" htmlFor="f">받는 날</label><input id="f" className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div>
        <div><label className="sm" htmlFor="t">반납일</label><input id="t" className="input" type="date" min={from} value={to} onChange={e=>setTo(e.target.value)}/></div></div>
    </div>
    <div className="fixed"><button className="btn" disabled={!from||!to} onClick={()=>setOpen(true)}>대여 요청하기</button></div>
    {open&&<div className="sheet" onClick={()=>setOpen(false)}><div onClick={e=>e.stopPropagation()}>
      <h2 style={{marginTop:0}}>이 조건으로 요청할까요?</h2>
      <p className="lead">{it.name} · {from} ~ {to}<br/>대여료 {won(it.rent)} + 보증금 {won(it.deposit)}<br/>인수·반납은 캠퍼스 안에서 만나서 해요. 보증금은 수동 송금으로 처리해요.</p>
      <button className="btn" disabled={busy} onClick={send}>{busy?'요청 중…':'대여 요청 보내기'}</button>
      <button className="btn ghost" style={{marginTop:8}} onClick={()=>setOpen(false)}>다시 볼게요</button></div></div>}
  </div>;
}

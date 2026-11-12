import {useEffect,useState} from 'react';import {api} from '../api/client.js';
import {CHECKS,STEPS,won} from '../mock/data.js';import {Compare} from '../components.jsx';
export default function Handover(){
  const [r,setR]=useState(null);const [it,setIt]=useState(null);const [chk,setChk]=useState([]);const [before,setBefore]=useState(null);const [after,setAfter]=useState(null);const [busy,setBusy]=useState(false);
  useEffect(()=>{api.getRental().then(x=>{setR(x);return api.getItem(x.itemId)}).then(setIt);},[]);
  if(!r||!it)return <div className="pad"><p className="lead">불러오는 중이에요…</p></div>;
  const url=f=>f?URL.createObjectURL(f):null;const kinds=['','handover','return','refund'];
  const done=r.step;const need=done===1?chk.length===CHECKS.length&&before:done===2?after:true;
  const labels=['','인수 완료 기록하기','반납 완료 기록하기','보증금 환불 처리하기'];
  const next=async()=>{setBusy(true);setR(await api.advance(r.id,kinds[done]));setBusy(false);};
  return <div className="pad">
    <h1>인수·반납 기록</h1><p className="lead">{it.name} · 보증금 {won(it.deposit)}</p>
    <ul className="tl">{STEPS.map((s,i)=><li key={s} className={i<done?'done':''}>{s}</li>)}</ul>
    <h2>상태 사진 비교</h2>
    <Compare item={it} before={url(before)} after={url(after)}/>
    <div className="row" style={{marginTop:8}}>
      <label className="btn ghost up">인수 전 사진<input type="file" accept="image/*" hidden onChange={e=>setBefore(e.target.files[0]||before)}/></label>
      <label className="btn ghost up">반납 후 사진<input type="file" accept="image/*" hidden onChange={e=>setAfter(e.target.files[0]||after)}/></label></div>
    <p className="sm" style={{marginTop:6}}>가운데 선을 좌우로 끌어 차이를 확인해요. 판정은 사람이 하고, 사진은 근거로만 써요.</p>
    <h2>인수 체크리스트</h2>
    {CHECKS.map((c,i)=><label key={c} className="chk"><input type="checkbox" disabled={done>1} checked={done>1||chk.includes(i)} onChange={()=>setChk(a=>a.includes(i)?a.filter(x=>x!==i):[...a,i])}/>{c}</label>)}
    {done<4?<button className="btn" style={{marginTop:16}} disabled={!need||busy} onClick={next}>{labels[done]}</button>
      :<div className="note" style={{marginTop:16}}>모든 과정이 끝났어요. 보증금이 환불되었어요.</div>}
  </div>;
}

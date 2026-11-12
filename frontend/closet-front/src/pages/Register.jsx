import {useRef,useState} from 'react';import {useNavigate} from 'react-router-dom';
import {api} from '../api/client.js';import {Icon} from '../icons.jsx';import {CATS,SIZES,MAX_PRICE,rentOf,depositOf,won} from '../mock/data.js';
export default function Register(){
  const nav=useNavigate();const [name,setName]=useState('');const [category,setCat]=useState(CATS[0]);const [size,setSize]=useState('M');const [price,setPrice]=useState('');
  const [files,setFiles]=useState([null,null,null]);const refs=useRef([]);const [busy,setBusy]=useState(false);
  const p=Number(price)||0;const over=p>MAX_PRICE;const n=files.filter(Boolean).length;const ok=name.trim()&&p>0&&!over&&n>=1;
  const pick=(i,f)=>{if(f)setFiles(a=>a.map((x,j)=>j===i?f:x));};
  const submit=async()=>{setBusy(true);await api.createItem({data:{name:name.trim(),category,size,price:p},files:files.filter(Boolean)});nav('/browse');};
  return <div className="pad">
    <h1>내 옷 등록</h1><p className="lead">안 입는 옷을 올리면 대여가를 자동으로 정해 드려요.</p>
    <div className="slots">{files.map((f,i)=><div key={i} className="slot" onClick={()=>refs.current[i].click()} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&refs.current[i].click()}>
      {f?<img src={URL.createObjectURL(f)} alt={`옷 사진 ${i+1}`}/>:<span><Icon name="plus" size={20}/>{['정면','뒷면','디테일'][i]}</span>}
      <input ref={el=>refs.current[i]=el} type="file" accept="image/*" hidden onChange={e=>pick(i,e.target.files[0])}/></div>)}</div>
    <p className="sm" style={{marginTop:6}}>정면 사진 1장은 꼭 필요해요. 얼굴이 나오지 않게 찍어 주세요.</p>
    <div className="field"><label htmlFor="nm">옷 이름</label><input id="nm" className="input" placeholder="예: 네이비 정장 자켓" value={name} onChange={e=>setName(e.target.value)}/></div>
    <div className="row"><div className="field"><label htmlFor="ct">용도</label><select id="ct" className="input" value={category} onChange={e=>setCat(e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="sz">사이즈</label><select id="sz" className="input" value={size} onChange={e=>setSize(e.target.value)}>{SIZES.map(s=><option key={s}>{s}</option>)}</select></div></div>
    <div className="field"><label htmlFor="pr">구매가 (원)</label><input id="pr" className="input" type="number" inputMode="numeric" placeholder="150000" value={price} onChange={e=>setPrice(e.target.value)}/></div>
    {over?<div className="calc warn">구매가 {won(MAX_PRICE)} 이하의 옷만 등록할 수 있어요.</div>
      :<div className="calc"><span>대여료 <b>{won(rentOf(p))}</b></span><span>보증금 <b>{won(depositOf(p))}</b></span></div>}
    <button className="btn" style={{marginTop:16}} disabled={!ok||busy} onClick={submit}>{busy?'등록 중…':'옷 등록하기'}</button>
  </div>;
}

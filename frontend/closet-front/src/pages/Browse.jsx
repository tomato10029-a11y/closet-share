import {useEffect,useState} from 'react';import {useNavigate} from 'react-router-dom';
import {api} from '../api/client.js';import {CATS,SIZES} from '../mock/data.js';import {Chip,ItemCard} from '../components.jsx';
export default function Browse(){
  const nav=useNavigate();const [items,setItems]=useState(null);const [cat,setCat]=useState('전체');const [size,setSize]=useState('전체');
  useEffect(()=>{api.listItems().then(setItems);},[]);
  const list=(items||[]).filter(i=>(cat==='전체'||i.category===cat)&&(size==='전체'||i.size===size));
  return <div className="pad">
    <h1>빌릴 옷 찾기</h1>
    <p className="lead">경북대 재학생이 올린 옷이에요.</p>
    <div className="chips" role="group" aria-label="용도">{['전체',...CATS].map(c=><Chip key={c} on={cat===c} onClick={()=>setCat(c)}>{c}</Chip>)}</div>
    <div className="chips" role="group" aria-label="사이즈">{['전체',...SIZES].map(s=><Chip key={s} on={size===s} onClick={()=>setSize(s)}>{s==='전체'?'사이즈 전체':s}</Chip>)}</div>
    {!items?<p className="lead">불러오는 중이에요…</p>:list.length?<div className="list">{list.map(i=><ItemCard key={i.id} item={i} onClick={()=>nav('/item/'+i.id)}/>)}</div>
      :<div className="note">조건에 맞는 옷이 아직 없어요. 필터를 바꾸거나 내 옷을 먼저 등록해 보세요.</div>}
  </div>;
}

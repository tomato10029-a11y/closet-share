// Flask 연동 지점. VITE_USE_MOCK=false 로 바꾸면 아래 엔드포인트를 호출합니다.
import {ITEMS,rentOf,depositOf,ICON} from '../mock/data.js';
const BASE=import.meta.env.VITE_API_URL||'';
export const USE_MOCK=import.meta.env.VITE_USE_MOCK!=='false';
const wait=v=>new Promise(r=>setTimeout(()=>r(v),250));
const J=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
async function req(path,opts){const r=await fetch(BASE+path,opts);if(!r.ok)throw new Error('API '+r.status);return r.json();}
let items=[...ITEMS];let rental={id:1,itemId:1,step:1};
export const api={
  sendCode:email=>USE_MOCK?wait({ok:true}):req('/api/auth/send-code',J('POST',{email})),
  verify:(email,code)=>USE_MOCK?wait({ok:code==='1234'}):req('/api/auth/verify',J('POST',{email,code})),
  listItems:()=>USE_MOCK?wait(items):req('/api/items'),
  getItem:id=>USE_MOCK?wait(items.find(i=>String(i.id)===String(id))):req('/api/items/'+id),
  createItem:async({data,files})=>{
    if(!USE_MOCK){const f=new FormData();f.append('data',JSON.stringify(data));files.forEach(x=>f.append('photos',x));return req('/api/items',{method:'POST',body:f});}
    const it={...data,id:Date.now(),rent:rentOf(data.price),deposit:depositOf(data.price),cond:'상태 좋음',tone:['#143F85','#6C93D6'],icon:ICON[data.category],owner:'나',photos:files.map(f=>URL.createObjectURL(f))};
    items=[it,...items];return wait(it);},
  createRental:(itemId,from,to)=>USE_MOCK?wait(rental={id:Date.now(),itemId,from,to,step:1}):req('/api/rentals',J('POST',{itemId,from,to})),
  getRental:()=>USE_MOCK?wait(rental):req('/api/rentals/current'),
  // kind: 'handover' | 'return' | 'refund'
  advance:(id,kind)=>USE_MOCK?wait(rental={...rental,step:rental.step+1}):req(`/api/rentals/${id}/${kind}`,J('PATCH',{})),
};

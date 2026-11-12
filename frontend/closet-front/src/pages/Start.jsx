import {useState} from 'react';import {useNavigate} from 'react-router-dom';import {api} from '../api/client.js';import {Icon} from '../icons.jsx';
export default function Start({onAuth}){
  const nav=useNavigate();const [step,setStep]=useState(0);const [email,setEmail]=useState('');const [code,setCode]=useState('');const [agree,setAgree]=useState(false);const [err,setErr]=useState('');
  const valid=/^[^@\s]+@knu\.ac\.kr$/.test(email.trim());
  const send=async()=>{await api.sendCode(email.trim());setStep(1);setErr('');};
  const verify=async()=>{const r=await api.verify(email.trim(),code);if(r.ok){onAuth();nav('/browse');}else setErr('인증코드가 맞지 않아요. 메일로 받은 4자리를 다시 확인해 주세요. (데모 코드: 1234)');};
  return <div className="pad">
    <h1 style={{fontSize:30,marginTop:24}}>동네옷장</h1>
    <p className="lead">한두 번 입는 옷, 사지 말고 이웃에게 빌려요.<br/>지금은 경북대 재학생끼리 시작해요.</p>
    <div className="rules">
      {[['idcard','재학생 인증','경북대 이메일로 인증한 사람만 빌리고 빌려줘요.'],['camera','상태 사진 기록','받을 때와 돌려줄 때 사진을 남겨 분쟁을 줄여요.'],['wallet','보증금 환불','이상 없이 반납하면 보증금을 돌려받아요.']].map(([i,t,d])=>
        <div className="rule card" key={t}><i><Icon name={i} size={20}/></i><div><b>{t}</b><span>{d}</span></div></div>)}
    </div>
    {step===0?<>
      <div className="field"><label htmlFor="em">경북대 이메일</label><input id="em" className="input" type="email" inputMode="email" placeholder="이름@knu.ac.kr" value={email} onChange={e=>setEmail(e.target.value)}/></div>
      <label className="chk"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/>대여 규칙과 보상 기준표에 동의해요</label>
      <p className="note" style={{margin:'12px 0'}}>이름·얼굴 사진은 받지 않아요. 학교 이메일은 재학생 확인에만 써요.</p>
      <button className="btn" disabled={!valid||!agree} onClick={send}>인증코드 받기</button>
      {email&&!valid&&<p className="err">@knu.ac.kr 주소만 사용할 수 있어요.</p>}
    </>:<>
      <div className="field"><label htmlFor="cd">인증코드 4자리</label><input id="cd" className="input" inputMode="numeric" maxLength={4} value={code} onChange={e=>setCode(e.target.value)}/></div>
      {err&&<p className="err">{err}</p>}
      <button className="btn" disabled={code.length<4} onClick={verify}>인증하고 시작하기</button>
      <button className="btn ghost" style={{marginTop:8}} onClick={()=>setStep(0)}>이메일 다시 입력</button>
    </>}
  </div>;
}

import {useState} from 'react';
import {Routes,Route,Navigate,NavLink,useLocation} from 'react-router-dom';
import Start from './pages/Start.jsx';import Browse from './pages/Browse.jsx';import Detail from './pages/Detail.jsx';
import {Icon} from './icons.jsx';import Register from './pages/Register.jsx';import Handover from './pages/Handover.jsx';
const TABS=[['/browse','둘러보기','search'],['/register','내 옷 등록','plus'],['/handover','인수·반납','camera']];
const Guard=({ok,children})=>ok?children:<Navigate to="/" replace/>;
export default function App(){
  const [ok,setOk]=useState(false);const {pathname}=useLocation();
  return <div className="app">
    <Routes>
      <Route path="/" element={<Start onAuth={()=>setOk(true)}/>}/>
      <Route path="/browse" element={<Guard ok={ok}><Browse/></Guard>}/>
      <Route path="/item/:id" element={<Guard ok={ok}><Detail/></Guard>}/>
      <Route path="/register" element={<Guard ok={ok}><Register/></Guard>}/>
      <Route path="/handover" element={<Guard ok={ok}><Handover/></Guard>}/>
    </Routes>
    {TABS.some(t=>t[0]===pathname)&&<nav className="tabbar">{TABS.map(([to,t,i])=><NavLink key={to} to={to}><span><Icon name={i} size={22}/></span>{t}</NavLink>)}</nav>}
  </div>;
}

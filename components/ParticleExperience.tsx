'use client';
import {useState,useEffect,useCallback,useRef} from 'react';
import dynamic from 'next/dynamic';
import {motion,AnimatePresence} from 'framer-motion';
import {createPortal} from 'react-dom';
import FallbackCloud from './FallbackCloud';
const ParticleScene=dynamic(()=>import('./ParticleScene'),{ssr:false});
type ProgressRef={current:number};
export default function ParticleExperience({progressRef,small=false}: {progressRef:ProgressRef;small?:boolean}){
 const [mounted,setMounted]=useState(false);
 const [status,setStatus]=useState<'checking'|'webgl'|'fallback'>('checking');
 const [ready,setReady]=useState(false);const [quality,setQuality]=useState<'high'|'eco'>('high');
 const done=useRef(false);
 useEffect(()=>{
  setMounted(true);
  try{
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const c=document.createElement('canvas');const gl=c.getContext('webgl2')||c.getContext('webgl');
   const memory=(navigator as Navigator & {deviceMemory?:number}).deviceMemory;
   const low=window.innerWidth<600 || (memory!==undefined && memory<=2);
   if(reduce||!gl||low){setStatus('fallback');setReady(true);}else setStatus('webgl');
  }catch{setStatus('fallback');setReady(true);}
  const limit=window.setTimeout(()=>{if(!done.current){setStatus('fallback');setReady(true);}},9000);
  return()=>window.clearTimeout(limit);
 },[]);
 const complete=useCallback(()=>{done.current=true;setReady(true);},[]);
 return <div className={'particle-holder'+(small?' particle-holder-small':'')} aria-label="Трёхмерная модель кофе из светящихся синих частиц" role="img">
  <div className="particle-aura"/>
  {status==='webgl'&& <ParticleScene progressRef={progressRef} onReady={complete} quality={quality}/>}
  {status==='fallback'&& <FallbackCloud progressRef={progressRef} small={small}/>}
  {!small&&<div className="graphic-switch"><button type="button" aria-label="Переключить детализацию графики" onClick={()=>setQuality(q=>q==='eco'?'high':'eco')}>ГРАФИКА / {quality==='eco'?'ECO':'ULTRA'}</button></div>}
  {mounted&&createPortal(<AnimatePresence>{!ready&&!small&&<motion.div className="scene-loader" initial={{opacity:1}} exit={{opacity:0,transition:{duration:.7}}}>
   <div className="loader-orbit"><span/><span/><span/></div>
   <div className="loader-word">DRIP<span> / </span>ORIGIN</div>
   <div className="loader-label">СОБИРАЕМ ПРОСТРАНСТВО ИЗ ЧАСТИЦ <span className="loading-ellipsis">•••</span></div>
   <div className="loader-line"><i/></div>
  </motion.div>}</AnimatePresence>,document.body)}
 </div>;
}


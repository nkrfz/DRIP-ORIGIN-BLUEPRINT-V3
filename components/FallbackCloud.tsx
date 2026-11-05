'use client';
import {useEffect,useMemo,useRef} from 'react';
import {makeCloud} from './ParticleShapes';

type Handle={destroy:()=>void};
type CloudFactory={mount:(canvas:HTMLCanvasElement,opts:{data:ReturnType<typeof makeCloud>;progress:()=>number;small?:boolean})=>Handle};
declare global{interface Window{DripFallback?:CloudFactory}}

export default function FallbackCloud({progressRef,small=false}:{progressRef:{current:number};small?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 const data=useMemo(()=>makeCloud(small?5500:10500),[small]);
 useEffect(()=>{
  let disposed=false,handle:Handle|undefined;
  const start=()=>{if(!disposed&&ref.current&&window.DripFallback&&!handle)
    handle=window.DripFallback.mount(ref.current,{data,progress:()=>progressRef.current,small});};
  if(window.DripFallback)start();
  else{
   const script=document.createElement('script');script.src='/effects/fallback-cloud.js';script.async=true;
   script.addEventListener('load',start);document.head.appendChild(script);
   return()=>{disposed=true;handle?.destroy();script.removeEventListener('load',start);};
  }
  return()=>{disposed=true;handle?.destroy();};
 },[data,progressRef,small]);
 return <canvas ref={ref} className="fallback-cloud-canvas" aria-label="Анимированная модель кофе из синих точек"/>;
}

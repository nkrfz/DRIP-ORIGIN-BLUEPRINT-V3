'use client';
import {useEffect,useRef} from 'react';

type AtmosphereHandle={destroy:()=>void};
type AtmosphereFactory={mount:(element:HTMLElement,options:{progress:()=>number})=>AtmosphereHandle};
declare global{interface Window{DripAtmosphere?:AtmosphereFactory}}

/** One shared atmosphere engine runs in the Next.js site and the standalone offline preview. */
export default function SceneAtmosphere({progressRef}:{progressRef:{current:number}}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!host.current)return;
  let disposed=false;
  let handle:AtmosphereHandle|undefined;
  const start=()=>{
    if(!disposed&&host.current&&window.DripAtmosphere&&!handle)
      handle=window.DripAtmosphere.mount(host.current,{progress:()=>progressRef.current});
  };
  if(window.DripAtmosphere)start();
  else{
    const script=document.createElement('script');
    script.src='/effects/atmosphere.js';script.async=true;
    script.addEventListener('load',start);
    document.head.appendChild(script);
    return()=>{disposed=true;handle?.destroy();script.removeEventListener('load',start);};
  }
  return()=>{disposed=true;handle?.destroy();};
 },[progressRef]);
 return <div ref={host} className="scene-atmosphere" aria-hidden="true"/>;
}

'use client';
import {useMemo,useRef,useEffect} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {makeCloud,morphProgress} from './ParticleShapes';
type ProgressRef={current:number};
type SceneProps={progressRef:ProgressRef;onReady?:()=>void;quality?:'high'|'eco'};
const vertex=`
precision highp float;
attribute vec3 a0;attribute vec3 a1;attribute vec3 a2;attribute vec3 a3;attribute vec3 a4;attribute vec3 a5;
attribute float aSeed;
uniform float uMorph;uniform float uTime;uniform float uDpr;
varying float vSeed;varying float vShade;
void main(){
 float p=clamp(uMorph,0.0,4.99999),i=floor(p),t=fract(p);
 vec3 a=i<.5?a0:i<1.5?a1:i<2.5?a2:i<3.5?a3:a4;
 vec3 b=i<.5?a1:i<1.5?a2:i<2.5?a3:i<3.5?a4:a5;
 if(uMorph>=5.0){a=a5;b=a5;t=0.;}
 float k=t*t*(3.-2.*t);vec3 pos=mix(a,b,k);
 float burst=pow(sin(t*3.14159265),1.6);
 float spin=6.28318*aSeed+uTime*.23;
 pos.xy+=burst*vec2(sin(spin+pos.y*2.2),cos(spin*1.3+pos.x*1.7))*(.18+.38*aSeed);
 pos.z+=burst*sin(spin*1.9+pos.y*4.)*.28;
 pos.x+=.017*sin(uTime*.8+aSeed*53.+pos.y*2.9);
 pos.y+=.019*cos(uTime*.7+aSeed*35.+pos.x*2.2);
 vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);
 float size=mix(2.0,3.6,fract(aSeed*157.31))*uDpr;
 gl_PointSize=min(11.,size*(10./max(3.,-mvPosition.z)));
 gl_Position=projectionMatrix*mvPosition;
 vSeed=aSeed;vShade=clamp((pos.y+1.8)/4.,0.,1.);
}`;
const fragment=`
precision highp float;
uniform float uTime;varying float vSeed;varying float vShade;
void main(){vec2 c=gl_PointCoord-.5;float r=length(c);if(r>.49)discard;
 float glow=exp(-r*r*10.);vec3 deep=vec3(.16,.48,1.);
 vec3 cyan=vec3(.38,1.,1.);vec3 silver=vec3(.72,.98,1.);
 vec3 color=mix(deep,cyan,smoothstep(.03,.91,vShade)*.69+.16);
 color=mix(color,silver,pow(vSeed,7.)*.67);
 float shimmer=.88+.12*sin(uTime*2.1+vSeed*35.);
 gl_FragColor=vec4(color*shimmer*1.25,glow*(.87+.13*vSeed));}
`;
function MorphingCloud({progressRef,onReady,quality='high'}:SceneProps){
 const pointCount=useMemo(()=>quality==='eco'?14000:(typeof window!=='undefined'&&window.innerWidth<900?26000:68000),[quality]);
 const data=useMemo(()=>makeCloud(pointCount),[pointCount]);
 const geometry=useMemo(()=>{
  const g=new THREE.BufferGeometry();
  for(const [attr,key] of [['a0','a'],['a1','b'],['a2','c'],['a3','d'],['a4','e'],['a5','f']] as const){g.setAttribute(attr,new THREE.BufferAttribute(data[key],3));}
  g.setAttribute('position',new THREE.BufferAttribute(data.a,3));
  g.setAttribute('aSeed',new THREE.BufferAttribute(data.seed,1));
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,0,0),7);
  return g;
 },[data]);
 const material=useMemo(()=>new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uMorph:{value:0},uTime:{value:0},uDpr:{value:typeof window!=='undefined'?Math.min(window.devicePixelRatio||1,1.55):1}}}),[]);
 useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
 const group=useRef<THREE.Group>(null);const readyOnce=useRef(false);
 const pointer=useRef({x:0,y:0,dragging:false,lastX:0,lastY:0,spin:0,pitch:0});
 useEffect(()=>{
  const move=(e:PointerEvent)=>{
   const q=pointer.current;q.x=e.clientX/window.innerWidth*2-1;q.y=e.clientY/window.innerHeight*2-1;
   if(q.dragging){q.spin+=(e.clientX-q.lastX)*.008;q.pitch=THREE.MathUtils.clamp(q.pitch+(e.clientY-q.lastY)*.004,-.9,.9);q.lastX=e.clientX;q.lastY=e.clientY;}
  };
  const down=(e:PointerEvent)=>{
   const target=e.target as Element | null;
   if(e.button!==0||target?.closest('button,a,input,nav,header,.scene-scrubber,.site-header'))return;
   const q=pointer.current;q.dragging=true;q.lastX=e.clientX;q.lastY=e.clientY;
  };
  const up=()=>{pointer.current.dragging=false;};
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',down,{passive:true});window.addEventListener('pointerup',up,{passive:true});
  return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);};
 },[]);
 useFrame(({clock},delta)=>{
  if(!readyOnce.current){readyOnce.current=true;onReady?.();}
  const morph=morphProgress(progressRef.current);
  material.uniforms.uMorph.value=THREE.MathUtils.damp(material.uniforms.uMorph.value,morph,4.5,delta);
  material.uniforms.uTime.value=clock.elapsedTime;
  if(group.current){
   const q=pointer.current;
   group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,q.spin+q.x*.24+Math.sin(clock.elapsedTime*.16)*.13+morph*.07,4,delta);
   group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,q.pitch-q.y*.14,4,delta);
   const compact=window.innerWidth<700;
   const keyMix=Math.max(0,Math.min(1,(morph-4.8)/.2));
   const treeMix=Math.max(0,1-Math.abs(morph-4)/.32);
   group.current.position.x=THREE.MathUtils.damp(group.current.position.x,compact?0:1.48*Math.cos(Math.PI*morph)-.34*keyMix,3.7,delta);
   group.current.position.y=THREE.MathUtils.damp(group.current.position.y,compact?1.1:-.12,2,delta);
   group.current.scale.setScalar((compact?.87:1.13)*(1-.12*keyMix-.10*treeMix));
  }
 });
 return <group ref={group}><points geometry={geometry} material={material} frustumCulled={false}/></group>;
}
export default function ParticleScene({progressRef,onReady,quality='high'}:SceneProps){
 return <Canvas className="particle-canvas" dpr={[1,quality==='eco'?1.1:1.55]} frameloop="always" camera={{position:[0,0,9],fov:41,near:.1,far:40}} gl={{alpha:true,antialias:false,powerPreference:'high-performance'}} style={{background:'transparent'}}>
  <MorphingCloud progressRef={progressRef} onReady={onReady} quality={quality}/>
 </Canvas>;
}

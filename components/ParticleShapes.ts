// Deterministic procedural surface sampling. No external GLB or network request required.
// Each dot has a real 3D coordinate on one of six shapes; the GPU interpolates them.
type Point=[number,number,number];
type Rng=()=>number;
function random(seed:number):Rng {return ()=>{seed|=0; seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed ^ seed>>>15,1|seed);t=(t+Math.imul(t ^ t>>>7,61|t))^t;return ((t ^ t>>>14)>>>0)/4294967296;};}
const TAU=Math.PI*2;
function sphere(r:Rng,c:Point,scale:Point):Point {const z=r()*2-1,a=r()*TAU,k=Math.sqrt(Math.max(0,1-z*z));return [c[0]+k*Math.cos(a)*scale[0],c[1]+z*scale[1],c[2]+k*Math.sin(a)*scale[2]];}
function tube(r:Rng,a:Point,b:Point,radius:number):Point {const t=r(),th=r()*TAU;const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const norm=Math.hypot(dx,dy,dz)||1;const ref=Math.abs(dy/norm)>.8?[1,0,0] as Point:[0,1,0] as Point;const ux=(dy*ref[2]-dz*ref[1])/norm,uy=(dz*ref[0]-dx*ref[2])/norm,uz=(dx*ref[1]-dy*ref[0])/norm;const ul=Math.hypot(ux,uy,uz)||1;const vx=(dy*uz-dz*uy)/norm,vy=(dz*ux-dx*uz)/norm,vz=(dx*uy-dy*ux)/norm;const p=radius*(0.25+0.75*(1-t));return [a[0]+dx*t+p*(Math.cos(th)*ux/ul+Math.sin(th)*vx),a[1]+dy*t+p*(Math.cos(th)*uy/ul+Math.sin(th)*vy),a[2]+dz*t+p*(Math.cos(th)*uz/ul+Math.sin(th)*vz)];}
function bean(r:Rng):Point{
 if(r()<.115){const y=(r()*2-1)*1.48;const x=.12+.17*Math.sin(y*1.83);return [x+(r()-.5)*.065,y,.58-.16*Math.cos(y*1.5)+(r()-.5)*.05];}
 const u=r()*TAU, z=r()*2-1, k=Math.sqrt(1-z*z);
 let x=Math.cos(u)*k*.92, y=z*1.47, depth=Math.sin(u)*k*.65;
 // Deep organic cleavage along the front-facing surface.
 const seam=.12+.17*Math.sin(y*1.83);
 if(depth>0)depth-=.24*Math.exp(-Math.pow((x-seam)/.16,2));
 x+=.10*Math.sin(y*1.4);y+=.07*Math.sin(u*2);
 return [x,y,depth];
}
function drip(r:Rng):Point {
 const part=r();let x=0,y=0,z=0;
 if(part<.65){
  y=(r()*2-1)*1.24;
  const width=1.07+.20*(1.2-y)/2.4;
  x=(r()*2-1)*width;
  const face=r();
  z=face<.48?.20+.055*Math.cos(x*1.5):face<.96?-.20-.035*Math.cos(x*1.5):(r()*2-1)*.2;
  if(y>1.05) z+=(r()-.5)*.08;
 } else if(part<.81){
  y=1.08+(r()-.5)*.18;x=(r()*2-1)*1.07;z=(r()-.5)*.35;
 } else if(part<.96){
  const side=r()<.5?-1:1,t=r();
  // suspended paper wings of a drip filter
  x=side*(1.02+.47*Math.sin(t*Math.PI));y=.9+.34*Math.cos(t*Math.PI*2);z=.07+(r()-.5)*.07;
 } else {
  x=(r()*2-1)*.9;y=-1.26+(r()-.5)*.1;z=(r()-.5)*.4;
 }
 return [x,y,z];
}
function cup(r:Rng):Point{
 const part=r();
 if(part<.60){const t=r(),th=r()*TAU;const radius=.72+.36*t;return [(radius+.01*(r()-.5))*Math.cos(th),-1.00+1.58*t,(radius+.01*(r()-.5))*Math.sin(th)];}
 if(part<.73){const a=r()*TAU,rad=.96+r()*.13;return [rad*Math.cos(a),.61+(r()-.5)*.07,rad*Math.sin(a)];}
 if(part<.80){const a=r()*TAU,k=Math.sqrt(r())*.94;return [Math.cos(a)*k,.54+(r()-.5)*.02,Math.sin(a)*k];}
 if(part<.92){const a=r()*TAU,ring=.52+(r()-.5)*.17;return [1.32+ring*Math.cos(a),-.2+.63*Math.sin(a),(r()-.5)*.12];}
 // steam
 const t=r(),h=.8+t*1.35;return [.25*Math.sin(t*12+r()*.3)+(r()-.5)*.12,h,.10*Math.cos(t*12)+(r()-.5)*.14];
}
const branchSegments:[Point,Point,number][]=[
 [[0,-1.60,0],[.04,-.28,0],.23],[[.04,-.28,0],[.08,1.02,0],.16],
 [[.03,.05,0],[-.97,1.08,.18],.12],[[.08,.41,0],[1.01,1.18,-.08],.11],
 [[-.53,.73,.08],[-1.29,1.38,.22],.07],[[.54,.81,-.05],[1.48,1.48,-.12],.07],
 [[.07,.75,0],[-.21,1.83,.1],.08],[[.04,1.0,0],[.54,1.87,.17],.075]
];
const foliage:[Point,Point][]=[
 [[-1.32,1.41,.16],[.48,.45,.47]],[[-.78,1.68,.20],[.56,.57,.43]],
 [[-.24,1.99,.06],[.52,.58,.48]],[[.42,2.08,-.07],[.60,.56,.50]],
 [[1.04,1.61,.01],[.52,.48,.48]],[[1.42,1.27,-.10],[.38,.40,.38]],
 [[.33,1.30,.47],[.62,.49,.45]],[[-.62,1.20,-.34],[.48,.40,.40]]
];
function tree(r:Rng):Point{
 const p=r();
 if(p<.23){const b=branchSegments[Math.floor(r()*branchSegments.length)];return tube(r,b[0],b[1],b[2]);}
 if(p<.93){const leaf=foliage[Math.floor(r()*foliage.length)];return sphere(r,leaf[0],leaf[1]);}
 const chosen=foliage[Math.floor(r()*foliage.length)][0];return sphere(r,[chosen[0]+.1,chosen[1]-.23,chosen[2]+.3],[.11,.13,.1]);
}
// Two new silhouettes for the six-scene narrative: cherries and a hotel-room key.
function cherry(r:Rng):Point {
 const q=r();
 if(q<.70){
  const c=q<.245?[-.57,-.38,.10] as Point:q<.49?[.58,-.43,-.08] as Point:[.10,.11,-.12] as Point;
  return sphere(r,c,[.58,.72,.55]);
 }
 if(q<.87){
  const n=Math.floor(r()*3); const ends:Point[]=[[-.57,.02,.10],[.58,-.04,-.08],[.10,.70,-.12]];
  return tube(r,ends[n],[.01,1.37,0],.05);
 }
 const n=Math.floor(r()*3);const centers:Point[]=[[-.75,1.13,.12],[.70,1.22,-.12],[.05,1.64,-.01]];
 return sphere(r,centers[n],[.48,.14,.29]);
}
function hotelKey(r:Rng):Point {
 const p=r();
 if(p<.46){
  const t=r()*TAU,rad=.67+(r()-.5)*.06,side=r()<.5?1:-1;
  return [-.89+rad*Math.cos(t),.45+rad*Math.sin(t),(r()-.5)*.22+side*.03];
 }
 if(p<.78){
  const x=-.28+r()*1.93;
  return [x,.43+(r()-.5)*.16,(r()-.5)*.22];
 }
 if(p<.94){
  const x=r()<.5?1.16:1.54;
  return [x+(r()-.5)*.16,.42-r()*.88,(r()-.5)*.18];
 }
 const x=.88+r()*.74;
 return [x,-.38+(r()-.5)*.12,(r()-.5)*.18];
}

export const SCENE_COUNT=6;
/** Each scene owns ~79% of its scroll distance; morphing happens in the final 21%. */
export function morphProgress(raw:number):number {
 const p=Math.max(0,Math.min(SCENE_COUNT,raw));
 const i=Math.min(SCENE_COUNT-1,Math.floor(p));
 if(i===SCENE_COUNT-1)return i;
 const t=Math.max(0,Math.min(1,(p-i-.79)/.21));
 return i+t*t*(3-2*t);
}
export type CloudData={a:Float32Array;b:Float32Array;c:Float32Array;d:Float32Array;e:Float32Array;f:Float32Array;seed:Float32Array};
export function makeCloud(count:number):CloudData {
 const r=random(38021), a=new Float32Array(count*3),b=new Float32Array(count*3),c=new Float32Array(count*3),d=new Float32Array(count*3),e=new Float32Array(count*3),f=new Float32Array(count*3),seed=new Float32Array(count);
 const fn=[bean,cherry,drip,cup,tree,hotelKey],arr=[a,b,c,d,e,f];
 for(let i=0;i<count;i++){seed[i]=r();for(let j=0;j<SCENE_COUNT;j++){const pt=fn[j](r);arr[j].set(pt,i*3);}}
 return {a,b,c,d,e,f,seed};
}

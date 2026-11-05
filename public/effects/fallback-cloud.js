/* 2D particle cloud for reduced motion and devices without working WebGL.
   Takes the same shape arrays as the GPU scene; never degrades to a static bean silhouette. */
(function(root){
 'use strict';
 if(root.DripFallback)return;
 function mount(canvas,{data,progress,small=false}={}){
  if(!canvas||!data||typeof progress!=='function')return{destroy(){}};
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return{destroy(){}};
  let alive=true,raf=0,last=0,w=1,h=1,dpr=1,mouse={x:0,y:0},orbit=0,tilt=0,drag=false,lastX=0,lastY=0;
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count=data.seed.length;
  function resize(){const box=canvas.getBoundingClientRect();w=box.width||innerWidth;h=box.height||innerHeight;dpr=Math.min(1.25,devicePixelRatio||1);canvas.width=Math.max(1,Math.floor(w*dpr));canvas.height=Math.max(1,Math.floor(h*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);}
  function move(e){
   mouse.x=e.clientX/innerWidth*2-1;mouse.y=e.clientY/innerHeight*2-1;
   if(drag){orbit+=(e.clientX-lastX)*.008;tilt=Math.max(-.9,Math.min(.9,tilt+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;}
  }
  function down(e){const target=e.target;if(e.button!==0||target?.closest?.('button,a,input,nav,header'))return;drag=true;lastX=e.clientX;lastY=e.clientY;}
  function up(){drag=false;}
  function getMorph(raw){const p=Math.max(0,Math.min(6,raw)),n=Math.min(5,Math.floor(p));if(n===5)return 5;const t=Math.max(0,Math.min(1,(p-n-.79)/.21));return n+t*t*(3-2*t);}

  function lerp(a,b,t){return a+(b-a)*t;}
  function draw(now){
   if(!alive)return;raf=requestAnimationFrame(draw);if(document.hidden||now-last<34)return;last=now;
   ctx.clearRect(0,0,w,h);
   const v=getMorph(progress()),seg=Math.min(4,Math.floor(v)),frac=v-seg,k=frac*frac*(3-2*frac);
   const arr=[data.a,data.b,data.c,data.d,data.e,data.f],a=arr[seg],b=arr[seg+1];
   const desktop=w>700&&!small;const keyMix=Math.max(0,Math.min(1,(v-4.8)/.2)),treeMix=Math.max(0,1-Math.abs(v-4)/.32);
   const scale=Math.min(h*.22,w*.17)*(desktop?1.12:.95)*(1-.12*keyMix-.10*treeMix);
   const shift=desktop?(w*.15*Math.cos(Math.PI*v)-w*.035*keyMix):0;
   const yaw=mouse.x*.16+orbit+v*.08;const cos=Math.cos(yaw),sin=Math.sin(yaw);
   const burst=Math.pow(Math.sin(Math.PI*frac),1.65);
   const time=reduced?0:now/1000;
   ctx.globalCompositeOperation='lighter';
   ctx.fillStyle='#58d9fb';ctx.globalAlpha=.83;
   for(let i=0;i<count;i++){
    const j=i*3,s=data.seed[i];
    let x=lerp(a[j],b[j],k),y=lerp(a[j+1],b[j+1],k),z=lerp(a[j+2],b[j+2],k);
    x+=burst*Math.sin(s*37+time*.5)*(.18+.25*s);
    y+=burst*Math.cos(s*71+time*.2)*(.18+.25*s);
    x+=.017*Math.sin(time*.65+s*60);
    y+=.017*Math.cos(time*.62+s*53);
    const xr=x*cos+z*sin,zr=-x*sin+z*cos;const yr=y*Math.cos(tilt)-zr*Math.sin(tilt);
    const factor=9/(9-zr);
    const px=w*.5+shift+xr*scale*factor,py=h*(desktop?.51:.31)-yr*scale*factor;
    if(px<0||px>w||py<0||py>h)continue;
    if(i%7===0){ctx.fillStyle='#b7faff';ctx.globalAlpha=.9;}
    else{ctx.fillStyle='#58d9fb';ctx.globalAlpha=.75;}
    const radius=(i%6===0?2.0:1.38)*factor;
    ctx.fillRect(px,py,radius,radius);
   }
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  }
  resize();window.addEventListener('resize',resize,{passive:true});window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',down,{passive:true});window.addEventListener('pointerup',up,{passive:true});raf=requestAnimationFrame(draw);
  return{destroy(){alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);}};
 }
 root.DripFallback={mount};
})(typeof window!=='undefined'?window:this);

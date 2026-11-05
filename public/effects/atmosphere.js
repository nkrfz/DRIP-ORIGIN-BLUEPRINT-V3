/* DRIP / ORIGIN: shared zero-dependency atmospheric effects for Next.js and offline preview.
   Bean / coffee cherry -> infusion drops -> coffee ripples -> foliage / key.
   V3: dense repulsive micro-objects + translucent smoke that disperses under the pointer.
   Designed for fixed full-screen scenes, GPU morph cloud sits above this layer. */
(function (root) {
  'use strict';
  if (root.DripAtmosphere) return;
  const TAU = Math.PI * 2;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const rand = (a, b) => a + Math.random() * (b - a);
  const morph = raw => {
    const p=clamp(raw,0,6),i=Math.min(5,Math.floor(p));
    if(i===5)return 5;
    const v=smooth(0,1,(p-i-.79)/.21);
    return i+v;
  };

  const fluidVertex = `
    attribute vec2 aPosition;
    void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
  `;
  const fluidFragment = `
    precision mediump float;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec3 uImpacts[8];
    float wave(vec2 p, vec2 c, float age) {
      vec2 d = p-c;
      d.x *= uResolution.x / uResolution.y;
      float dist = length(d);
      float front = dist-age*0.27;
      float envelope = exp(-abs(front)*17.0)*exp(-age*0.50);
      float trail = sin((dist-age*0.27)*49.0);
      return trail * envelope;
    }
    void main() {
      vec2 uv = gl_FragCoord.xy/uResolution;
      float t=uTime;
      vec2 flow = uv*vec2(3.8, 3.0);
      flow.x += 0.13*sin(uv.y*7.2+t*0.18);
      flow.y += 0.12*cos(uv.x*6.7-t*0.14);
      float n=sin(flow.x*2.1+sin(flow.y*1.2+t*.24));
      n+=0.5*sin(flow.x*3.8-flow.y*2.9-t*.29);
      n+=0.25*sin(flow.y*8.1+flow.x*4.2+t*.4);
      float ripple = 0.0;
      for (int i=0;i<8;i++) {
        float age=uImpacts[i].z;
        if(age>=0.0 && age<3.8) ripple += wave(uv,uImpacts[i].xy,age);
      }
      vec2 center=(uv-vec2(.55,.51));
      center.x *= uResolution.x/uResolution.y;
      float spot=exp(-dot(center,center)*1.32);
      float veins = .5+.5*sin(14.0*uv.x + 8.0*sin(uv.y*4.0+t*.12)+n*1.7);
      vec3 deep=vec3(.013,.028,.039);
      vec3 coffee=vec3(.17,.095,.070);
      vec3 honey=vec3(.35,.205,.104);
      vec3 teal=vec3(.06,.33,.39);
      float liquid=.37+.18*n+.08*veins;
      vec3 color=mix(deep,coffee,clamp(liquid*spot+.10,0.,1.));
      float light=pow(clamp(.55+.5*n+.2*ripple,0.,1.),3.0)*spot;
      color=mix(color,honey,light*.47);
      float crests=pow(abs(ripple),1.17);
      color+=honey*crests*.42+teal*crests*.44;
      float chrome=pow(clamp(.7+.18*n+.78*ripple,0.,1.),11.0);
      color+=vec3(.12,.68,.74)*chrome*.37*spot;
      color+=vec3(.025,.10,.13)*pow(veins,9.)*spot*.18;
      float edge=1.-smoothstep(.42,1.22,length(center));
      float alpha=clamp(.48*spot+.22*edge+.22*crests,.0,.80);
      gl_FragColor=vec4(color,alpha);
    }
  `;
  function initFluid(canvas) {
    let gl;
    try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' }); } catch (e) { return null; }
    if (!gl) return null;
    function shader(type, source) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, source); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    }
    try {
      const program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, fluidVertex));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fluidFragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      gl.useProgram(program);
      const loc = gl.getAttribLocation(program, 'aPosition'); gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      return { gl, program, uniforms: {
        time:gl.getUniformLocation(program,'uTime'),
        resolution:gl.getUniformLocation(program,'uResolution'),
        impacts:gl.getUniformLocation(program,'uImpacts[0]')
      }};
    } catch (err) { console.warn('Fluid shader fallback:',err); return null; }
  }

  function mount(host, options) {
    if (!host) return { destroy:()=>{} };
    options=options||{};
    let running=true, raf=0, width=1,height=1,last=0,lastRipple=0,lastMouse=0;
    const getProgress=typeof options.progress==='function'?options.progress:()=>0;
    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile=window.innerWidth<720;
    let pointer={x:-1000,y:-1000,px:-1000,py:-1000,active:false};
    const atmosphere=document.createElement('canvas');
    const liquid=document.createElement('canvas');
    const smoke=document.createElement('canvas');
    atmosphere.className='atmosphere-beans';liquid.className='atmosphere-fluid';smoke.className='atmosphere-smoke';
    for (const el of [liquid,atmosphere,smoke]) {
      el.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block;';
      host.appendChild(el);
    }
    atmosphere.style.zIndex='2';liquid.style.zIndex='1';smoke.style.zIndex='3';smoke.style.opacity='.69';smoke.style.mixBlendMode='screen';
    atmosphere.style.opacity='1';liquid.style.opacity='0';
    const ctx=atmosphere.getContext('2d',{alpha:true});
    const haze=smoke.getContext('2d',{alpha:true});
    const wake=[];
    const fluid=initFluid(liquid);
    const liquid2d=fluid?null:liquid.getContext('2d',{alpha:true});
    const impacts=[];
    const data=new Float32Array(8*3).fill(-10);
    const density=reduced?140:(mobile?275:Math.min(1050,Math.max(630,Math.round(window.innerWidth*window.innerHeight/2050))));
    const motes=[];
    for(let i=0;i<density;i++){
      motes.push({u:Math.random(),v:Math.random(),x:0,y:0,vx:0,vy:0,
        size:rand(2.1,7.3),turn:rand(-3.1,3.1),seed:Math.random()*TAU,
        depth:rand(.45,1.5),speed:rand(.25,1.1)});
    }
    function resize(){
      const box=host.getBoundingClientRect();
      width=Math.max(1,box.width||innerWidth);height=Math.max(1,box.height||innerHeight);
      const dpr=Math.min(window.devicePixelRatio||1,mobile?1.15:1.5);
      atmosphere.width=Math.max(1,Math.floor(width*dpr));atmosphere.height=Math.max(1,Math.floor(height*dpr));
      ctx&&ctx.setTransform(dpr,0,0,dpr,0,0);
      const sf=Math.min(.7,(window.devicePixelRatio||1)*.58);
      smoke.width=Math.max(1,Math.floor(width*sf));smoke.height=Math.max(1,Math.floor(height*sf));
      haze&&haze.setTransform(sf,0,0,sf,0,0);
      if(fluid){
        const ratio=Math.min(window.devicePixelRatio||1,1.0)*.70;
        liquid.width=Math.max(1,Math.floor(width*ratio));liquid.height=Math.max(1,Math.floor(height*ratio));
        fluid.gl.viewport(0,0,liquid.width,liquid.height);
      } else if(liquid2d){
        const ratio=Math.min(window.devicePixelRatio||1,1.0);
        liquid.width=Math.max(1,Math.floor(width*ratio));liquid.height=Math.max(1,Math.floor(height*ratio));
        liquid2d.setTransform(ratio,0,0,ratio,0,0);
      }
      for(const p of motes){p.x=p.u*width;p.y=p.v*height;p.vx=0;p.vy=0;}
    }
    function pointermove(e){
      if(e.pointerType==='touch')return;
      const rect=host.getBoundingClientRect();
      pointer.px=pointer.x;pointer.py=pointer.y;
      pointer.x=e.clientX-rect.left;pointer.y=e.clientY-rect.top;
      pointer.active=pointer.x>=0&&pointer.x<=width&&pointer.y>=0&&pointer.y<=height;
      lastMouse=performance.now();
      if(!pointer.active)return;
      const p=morph(getProgress());
      if(p>2.78&&p<3.93){
        const dist=Math.hypot(pointer.x-pointer.px,pointer.y-pointer.py);
        const now=performance.now();
        if(now-lastRipple>Math.max(75,145-dist*.23) && (dist>5||!impacts.length)){
          impacts.push({x:clamp(pointer.x/width,0,1),y:clamp(1-pointer.y/height,0,1),start:now});
          if(impacts.length>8)impacts.shift();lastRipple=now;
        }
      }
      if(!reduced&&Math.hypot(pointer.x-pointer.px,pointer.y-pointer.py)>2){
        wake.push({x:pointer.x,y:pointer.y,born:performance.now()});if(wake.length>28)wake.shift();
      }
    }
    function drawBean(p,opacity,t){
      const r=p.size*p.depth;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.turn+.07*Math.sin(t*.4+p.seed));
      ctx.globalAlpha=opacity;
      ctx.shadowColor='rgba(79,211,255,.31)';ctx.shadowBlur=r>7?3:0;
      ctx.strokeStyle='rgba(108,214,244,.89)';ctx.lineWidth=.82;
      ctx.fillStyle='rgba(34,124,159,.16)';
      ctx.beginPath();ctx.ellipse(0,0,r*.65,r*1.07,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.shadowBlur=0;ctx.strokeStyle='rgba(186,241,250,.72)';ctx.lineWidth=.72;
      ctx.beginPath();ctx.moveTo(-r*.06,-r*.75);
      ctx.bezierCurveTo(r*.33,-r*.25,-r*.33,r*.12,r*.10,r*.78);ctx.stroke();ctx.restore();
    }
    function drawDrop(p,opacity,t){
      const r=p.size*p.depth*.75;
      ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=opacity;
      ctx.rotate(.05*Math.sin(t+p.seed));
      ctx.strokeStyle='rgba(100,221,251,.83)';ctx.lineWidth=.8;
      ctx.shadowBlur=4;ctx.shadowColor='rgba(56,185,245,.25)';
      ctx.beginPath();ctx.moveTo(0,-r*1.25);ctx.bezierCurveTo(-r*.3,-r*.5,-r*.7,r*.22,0,r*.92);
      ctx.bezierCurveTo(r*.7,r*.2,r*.3,-r*.5,0,-r*1.25);ctx.stroke();
      ctx.restore();
    }
    function drawSpore(p,opacity,t){
      const r=p.size*p.depth*.6;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.turn+Math.sin(t*.18+p.seed)*.23);
      ctx.globalAlpha=opacity;ctx.strokeStyle='rgba(115,239,221,.75)';ctx.fillStyle='rgba(51,193,168,.17)';
      ctx.lineWidth=.85;ctx.shadowBlur=3;ctx.shadowColor='rgba(87,255,229,.22)';
      ctx.beginPath();ctx.moveTo(-r*.9,0);ctx.quadraticCurveTo(0,-r*.75,r*.9,0);ctx.quadraticCurveTo(0,r*.75,-r*.9,0);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(-r*.7,0);ctx.lineTo(r*.8,0);ctx.stroke();ctx.restore();
    }
    function drawCherry(p,opacity,t){
      const r=p.size*p.depth;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.turn);
      ctx.globalAlpha=opacity;ctx.strokeStyle='rgba(110,229,255,.89)';ctx.lineWidth=.82;
      ctx.fillStyle='rgba(34,142,182,.15)';
      ctx.beginPath();ctx.arc(0,r*.2,r*.68,0,TAU);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-r*.55);ctx.quadraticCurveTo(r*.5,-r*1.2,r*.85,-r*1.05);ctx.stroke();
      ctx.restore();
    }
    function drawKey(p,opacity,t){
      const r=p.size*p.depth;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.turn*.5);
      ctx.globalAlpha=opacity;ctx.strokeStyle='rgba(114,223,250,.9)';ctx.lineWidth=.85;
      ctx.beginPath();ctx.arc(-r*.56,0,r*.40,0,TAU);ctx.moveTo(-r*.14,0);
      ctx.lineTo(r*.7,0);ctx.lineTo(r*.7,r*.33);ctx.moveTo(r*.4,0);ctx.lineTo(r*.4,r*.25);ctx.stroke();ctx.restore();
    }
    function drawSmoke(now,p){
      if(!haze)return;
      haze.clearRect(0,0,width,height);
      const strength=Math.max(.12,Math.max(1-smooth(.2,.98,Math.abs(p-0)),1-smooth(.2,.98,Math.abs(p-1)),1-smooth(.2,.98,Math.abs(p-4))));
      smoke.style.opacity=(.49+.22*strength).toFixed(3);
      const t=now*.00024;
      haze.globalCompositeOperation='screen';
      // Light, low-resolution smoke filaments: they sit ABOVE tiny beans/leaves, BELOW the hero model.
      for(let k=0;k<26;k++){
        const anchorY=height*(k/25),base=width*(.20+.64*(k%7)/7);
        const x=base+Math.sin(k*1.8+t*.45)*width*.21;
        const y=anchorY+Math.sin(t*1.12+k*1.8)*height*.13;
        const rr=Math.min(width,height)*(.14+.12*(k%5)/5);
        const grad=haze.createRadialGradient(x,y,0,x,y,rr);
        const alpha=(.047+.025*Math.sin(k*1.4+t*2.)**2)*strength;
        grad.addColorStop(0,`rgba(104,200,225,${alpha})`);
        grad.addColorStop(.44,`rgba(63,134,180,${alpha*.42})`);
        grad.addColorStop(1,'rgba(30,88,140,0)');
        haze.fillStyle=grad;haze.fillRect(x-rr,y-rr,2*rr,2*rr);
      }
      // Broad, drifting translucent smoke tendrils, brighter than the ambient fog.
      haze.save();
      haze.globalCompositeOperation='screen';
      for(let k=0;k<8;k++){
        const y=height*(.15+k*.108),wiggle=Math.sin(t*1.18+k*1.91)*height*.060;
        const x=-width*.08;
        const ribbon=haze.createLinearGradient(0,y,width,y+wiggle);
        ribbon.addColorStop(0,'rgba(62,159,204,0)');
        ribbon.addColorStop(.23,`rgba(75,177,210,${.024*strength})`);
        ribbon.addColorStop(.57,`rgba(105,204,232,${.055*strength})`);
        ribbon.addColorStop(.84,`rgba(68,160,196,${.025*strength})`);
        ribbon.addColorStop(1,'rgba(75,156,190,0)');
        haze.strokeStyle=ribbon;haze.lineWidth=30+(k%3)*14;
        haze.beginPath();haze.moveTo(x,y+wiggle);
        haze.bezierCurveTo(width*.30,y+Math.sin(t+k)*95,width*.62,y-60+wiggle,width*1.12,y+Math.cos(t*.7+k)*66);
        haze.stroke();
      }
      haze.restore();
      haze.globalCompositeOperation='destination-out';
      for(let i=wake.length-1;i>=0;i--){
        const w=wake[i];const age=(now-w.born)/1700;
        if(age>=1){wake.splice(i,1);continue;}
        const rad=(mobile?85:145)*(1+age*.75),g=haze.createRadialGradient(w.x,w.y,5,w.x,w.y,rad);
        g.addColorStop(0,`rgba(0,0,0,${.93*(1-age)})`);
        g.addColorStop(.5,`rgba(0,0,0,${.52*(1-age)})`);
        g.addColorStop(1,'rgba(0,0,0,0)');haze.fillStyle=g;
        haze.beginPath();haze.arc(w.x,w.y,rad,0,TAU);haze.fill();
      }
      haze.globalCompositeOperation='source-over';
    }
    function updateMotes(dt,t,p){
      if(!ctx)return;
      ctx.clearRect(0,0,width,height);
      const v=morph(p);
      const weight=i=>1-smooth(.07,.98,Math.abs(v-i));
      const beanAlpha=weight(0),cherryAlpha=weight(1),dripAlpha=weight(2);
      const sporeAlpha=weight(4),keyAlpha=weight(5);
      if(beanAlpha+cherryAlpha+dripAlpha+sporeAlpha+keyAlpha<.006)return;
      const moveX=pointer.x,moveY=pointer.y;
      const radius=mobile?110:175;const radiusSq=radius*radius;
      const speed=Math.min(2.4,Math.max(.5,dt*60));
      for(let i=0;i<motes.length;i++){
        const m=motes[i];
        const homeX=m.u*width+Math.sin(t*.27+m.seed)*6*m.depth;
        const homeY=m.v*height+Math.cos(t*.21+m.seed)*8*m.depth;
        const dx=m.x-moveX,dy=m.y-moveY,d2=dx*dx+dy*dy;
        if(pointer.active&&d2<radiusSq){
          const d=Math.max(8,Math.sqrt(d2));
          const f=(1-d/radius); const push=f*f*11*speed;
          m.vx+=(dx/d)*push;m.vy+=(dy/d)*push;
        }
        m.vx+=(homeX-m.x)*.012*speed;
        m.vy+=(homeY-m.y)*.012*speed;
        m.vx*=Math.pow(.87,speed);m.vy*=Math.pow(.87,speed);
        m.x+=m.vx*speed;m.y+=m.vy*speed;
        const opacity=(.26+.40*(.5+.5*Math.sin(t*.48+m.seed)))*m.depth;
        if(beanAlpha>.006)drawBean(m,beanAlpha*opacity,t);
        if(cherryAlpha>.006){if(i%3===0)drawSpore(m,cherryAlpha*opacity*.9,t);else drawCherry(m,cherryAlpha*opacity,t);}
        if(dripAlpha>.006)drawDrop(m,dripAlpha*opacity*.85,t);
        if(sporeAlpha>.006)drawSpore(m,sporeAlpha*opacity*.94,t);
        if(keyAlpha>.006)drawKey(m,keyAlpha*opacity*.84,t);
      }
    }
    function drawFluid2d(now){
      if(!liquid2d)return;
      const c=liquid2d,t=now*.001;
      c.clearRect(0,0,width,height);
      const wash=c.createRadialGradient(width*.63,height*.48,18,width*.57,height*.52,width*.76);
      wash.addColorStop(0,'rgba(112,66,37,.33)');
      wash.addColorStop(.44,'rgba(35,86,100,.23)');
      wash.addColorStop(1,'rgba(2,9,15,0)');
      c.fillStyle=wash;c.fillRect(0,0,width,height);
      for(let k=0;k<16;k++){
        const y=height*(k/15);const phase=t*.2+k*.71;
        c.beginPath();
        for(let x=0;x<=width+14;x+=14){
          const py=y+Math.sin(x*.008+phase)*22+Math.sin(x*.019-phase*.67)*8;
          if(x===0)c.moveTo(x,py);else c.lineTo(x,py);
        }
        c.strokeStyle=k%3===0?'rgba(96,200,210,.065)':'rgba(173,112,63,.045)';
        c.lineWidth=k%3===0?2:1;c.stroke();
      }
      for(const impact of impacts){
        const age=(now-impact.start)/1000;if(age>3.6||age<0)continue;
        const cx=impact.x*width,cy=(1-impact.y)*height;
        const alpha=Math.pow(1-age/3.6,1.6);
        const radius=age*Math.min(width,height)*.24;
        for(let ring=0;ring<3;ring++){
          const rr=radius-ring*12;if(rr<=0)continue;
          c.beginPath();c.ellipse(cx,cy,rr,rr*.50,0,0,TAU);
          c.strokeStyle=ring===0?`rgba(118,226,238,${alpha*.50})`:`rgba(213,155,92,${alpha*.34})`;
          c.lineWidth=ring===0?1.7:1.1;c.stroke();
        }
      }
    }
    function drawFluid(now,p){
      const m=morph(p);const amount=smooth(2.72,3.0,m)*(1-smooth(3.72,4.0,m));
      liquid.style.opacity=amount.toFixed(3);
      if(amount<.008)return;
      if(!fluid){drawFluid2d(now);return;}
      const gl=fluid.gl;
      for(let i=0;i<8;i++){
        const impact=impacts[impacts.length-1-i];
        data[i*3]=impact?impact.x:-10;
        data[i*3+1]=impact?impact.y:-10;
        data[i*3+2]=impact?(now-impact.start)/1000:-10;
      }
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(fluid.program);
      gl.uniform1f(fluid.uniforms.time,now/1000);
      gl.uniform2f(fluid.uniforms.resolution,liquid.width,liquid.height);
      gl.uniform3fv(fluid.uniforms.impacts,data);
      gl.drawArrays(gl.TRIANGLES,0,6);
    }
    function frame(now){
      if(!running)return;
      raf=requestAnimationFrame(frame);
      if(document.hidden)return;
      // Keep the backdrop around 30 fps; cloud morphing renders separately on GPU.
      if(now-last<30)return;
      const dt=last?Math.min(.07,(now-last)/1000):.033;
      last=now;
      const p=clamp(getProgress(),0,6);
      const t=reduced?0:now*.001;
      updateMotes(reduced?0:dt,t,p);
      drawFluid(now,p);
      drawSmoke(now,morph(p));
    }
    resize();
    root.addEventListener('resize',resize,{passive:true});
    root.addEventListener('pointermove',pointermove,{passive:true});
    if(!reduced)raf=requestAnimationFrame(frame);
    else {updateMotes(0,0,getProgress());}
    return {destroy(){running=false;cancelAnimationFrame(raf);
      root.removeEventListener('resize',resize);root.removeEventListener('pointermove',pointermove);
      atmosphere.remove();liquid.remove();smoke.remove();},
      refresh(){resize()},
      addRipple(x,y){impacts.push({x:clamp(x,0,1),y:clamp(1-y,0,1),start:performance.now()});if(impacts.length>8)impacts.shift();}
    };
  }
  root.DripAtmosphere={mount};
})(typeof window!=='undefined'?window:this);

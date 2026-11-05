'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {AnimatePresence,motion} from 'framer-motion';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Link from 'next/link';
import {ArrowDownRight,ArrowUpRight,MoveDown} from 'lucide-react';
import ParticleExperience from './ParticleExperience';
import SceneAtmosphere from './SceneAtmosphere';
import {SCENE_COUNT} from './ParticleShapes';
gsap.registerPlugin(ScrollTrigger);
const stages=[
 {id:'01',sub:'НАЧАЛО / 01',headline:['Всё начинается','с одного зерна.'],copy:'Пять происхождений. Бесконечное количество оттенков вкуса. Выбираем кофе, который хочется запомнить.',cta:'Происхождение',url:'/origins'},
 {id:'02',sub:'СОЗРЕВАНИЕ / 02',headline:['Природа знает','своё дело.'],copy:'Внутри каждой кофейной ягоды – будущее незабываемого вкуса. Всё начинается задолго до первой чашки.',cta:'Наша философия',url:'/about'},
 {id:'03',sub:'ФОРМА / 03',headline:['Идеальная чашка.','Везде.'],copy:'Кофе высокого качества без кофемашины. Один дрип-пакет – одно точное мгновение.',cta:'Открыть каталог',url:'/catalog'},
 {id:'04',sub:'РИТУАЛ / 04',headline:['Вкус, который','остаётся.'],copy:'Простой ритуал, который превращает обычное утро гостя в особенное.',cta:'Выбрать кофе',url:'/catalog'},
 {id:'05',sub:'ИСТОКИ / 05',headline:['Ближе к истокам.','Ближе к людям.'],copy:'Кофейное дерево, урожай и мастерство. Мы бережно сохраняем историю каждого происхождения.',cta:'О нас',url:'/about'},
 {id:'06',sub:'ГОСТЕПРИИМСТВО / 06',headline:['Маленькая деталь.','Большое чувство.'],copy:'Кофе, который встречает гостя там, где начинается его дом вдали от дома. Создано для HoReCa.',cta:'Для вашего бизнеса',url:'/b2b'}
];
export default function ImmersiveHome(){
 const wrap=useRef<HTMLDivElement>(null);const progress=useRef(0);const [active,setActive]=useState(0);const [sliderValue,setSliderValue]=useState(0);const activeRef=useRef(0);
 useEffect(()=>{
  const ctx=gsap.context(()=>{
   ScrollTrigger.create({trigger:wrap.current,start:'top top',end:'bottom bottom',scrub:.6,
    onUpdate:self=>{
     const p=self.progress*SCENE_COUNT;progress.current=p;setSliderValue(p);
     const next=Math.min(SCENE_COUNT-1,Math.floor(Math.min(SCENE_COUNT-.00001,p)));
     if(next!==activeRef.current){activeRef.current=next;setActive(next);}
    }
   });
  },wrap);
  return()=>ctx.revert();
 },[]);
 const navigateScene=(position:number,instant=false)=>{
  if(!wrap.current)return;
  const top=wrap.current.getBoundingClientRect().top+window.scrollY;
  const length=Math.max(1,wrap.current.offsetHeight-window.innerHeight);
  const pos=Math.max(0,Math.min(SCENE_COUNT,position));
  progress.current=pos;setSliderValue(pos);
  window.scrollTo({top:top+(pos/SCENE_COUNT)*length,behavior:instant?'instant':'smooth'});
 };
 const scene=stages[active];
 return <main className="home-scroll" ref={wrap}>
  <section className={'home-sticky'+(active%2?' scene-flip':'')} aria-label="Шесть иммерсивных сцен о кофе">
   <div className="vignette"/><div className="blue-noise"/>
   <SceneAtmosphere progressRef={progress}/>
   <ParticleExperience progressRef={progress}/>
   <div className="hero-copy">
    <AnimatePresence mode="wait">
     <motion.div key={active} initial={{opacity:0,y:25,filter:'blur(8px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} exit={{opacity:0,y:-22,filter:'blur(7px)'}} transition={{duration:.55,ease:[.2,.8,.2,1]}}>
      <div className="eyebrow"><span className="eyebrow-dot"/>{scene.sub}<span className="eyebrow-line"/> SPECIALTY COFFEE / HORECA</div>
      <h1>{scene.headline[0]}<br/><em>{scene.headline[1]}</em></h1>
      <p className="hero-description">{scene.copy}</p>
      <div className="hero-actions"><Link className="main-cta" href={scene.url}>{scene.cta}<ArrowUpRight size={19}/></Link><Link className="plain-link" href="/cart">Корзина <ArrowUpRight size={15}/></Link></div>
     </motion.div>
    </AnimatePresence>
   </div>
   <div className="scene-scrubber" aria-label="Управление сценами">
    <span className="scrub-caption">SCENE / SCRUB</span>
    <div className="scrub-track-box">
     <input type="range" min="0" max={SCENE_COUNT} step="0.001" value={sliderValue} onChange={e=>navigateScene(Number(e.target.value),true)} style={{'--scrub-fill':`${sliderValue/SCENE_COUNT*100}%`} as CSSProperties} aria-label="Пролистать шесть сцен"/>
     {Array.from({length:SCENE_COUNT+1},(_,i)=><span className="scrub-tick" key={i} style={{top:`${i/SCENE_COUNT*100}%`}}/>)}
    </div>
    <span className="scrub-number">0{active+1} <span>/ 06</span></span>
   </div>
   <div className="scene-right-caption"><span className="crosshair">✳</span><span>КРУТИТЕ МОДЕЛЬ<br/>ДВИЖЕНИЕМ МЫШИ</span></div>
   <div className="story-controls">
    <div className="story-left"><span className="micro-mark"/><span>SCROLL · DRAG TO ROTATE</span><MoveDown size={15}/></div>
    <div className="steps" aria-label="Выбрать сцену">{stages.map((item,i)=><button type="button" key={item.id} className={active===i?'step step-current':'step'} onClick={()=>navigateScene(i+.012)} aria-label={`Сцена ${i+1} из ${SCENE_COUNT}`} aria-current={active===i?'step':undefined}><span className="step-index">{item.id}</span><span className="step-line"/></button>)}</div>
    <div className="story-right"><span>0{active+1} / 06</span><ArrowDownRight size={17}/></div>
   </div>
  </section><div className="home-scroll-spacer" aria-hidden="true"/>
 </main>;
}

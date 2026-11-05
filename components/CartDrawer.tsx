'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {AnimatePresence,motion} from 'framer-motion';
import {ArrowUpRight,Minus,Plus,X} from 'lucide-react';
import {useCart} from '@/lib/cart';
import {money,products} from '@/lib/data';
export default function CartDrawer(){
 const open=useCart(s=>s.open),setOpen=useCart(s=>s.setOpen);
 const lines=useCart(s=>s.lines),setQuantity=useCart(s=>s.setQuantity),remove=useCart(s=>s.remove);
 const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);
 useEffect(()=>{if(!open)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};window.addEventListener('keydown',escape);const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',escape);};},[open,setOpen]);
 const total=lines.reduce((sum,l)=>sum+(products.find(p=>p.id===l.id)?.price??0)*l.quantity,0);
 if(!mounted)return null;
 return <AnimatePresence>{open&&<>
  <motion.button className="drawer-dim" aria-label="Закрыть корзину" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setOpen(false)}/>
  <motion.aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Корзина" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'tween',duration:.45,ease:[.22,1,.36,1]}}>
   <div className="drawer-head"><span className="section-eyebrow">ВАШ ВЫБОР / {String(lines.length).padStart(2,'0')}</span><button onClick={()=>setOpen(false)} aria-label="Закрыть корзину"><X size={24}/></button></div>
   <h2 className="drawer-title">Корзина<span>.</span></h2>
   <div className="drawer-lines">{lines.length===0?<div className="drawer-empty">Пока здесь ничего нет.<br/><Link href="/catalog" onClick={()=>setOpen(false)}>Перейти к коллекции ↗</Link></div>:lines.map(l=>{
    const p=products.find(p=>p.id===l.id);if(!p)return null;
    return <div className="drawer-line" key={l.id}><Link href={'/product/'+p.slug} onClick={()=>setOpen(false)}><small>{p.type} / {p.origin}</small><strong>{p.name}</strong></Link><div className="drawer-line-bottom"><div className="qty-control"><button onClick={()=>setQuantity(l.id,l.quantity-1)} aria-label="Уменьшить"><Minus size={13}/></button><span>{l.quantity}</span><button onClick={()=>setQuantity(l.id,l.quantity+1)} aria-label="Увеличить"><Plus size={13}/></button></div><span>{money(p.price*l.quantity)}</span><button className="remove-link" onClick={()=>remove(l.id)}>Убрать</button></div></div>;
   })}</div>
   <div className="drawer-footer"><div className="cart-total"><span>Итого</span><strong>{money(total)}</strong></div>{lines.length>0?<Link href="/checkout" className="main-cta" onClick={()=>setOpen(false)}>Оформить заказ <ArrowUpRight size={19}/></Link>:<Link href="/catalog" className="main-cta" onClick={()=>setOpen(false)}>Выбрать кофе <ArrowUpRight size={19}/></Link>}<p>Демонстрационная корзина. Без онлайн-оплаты и отправки заказов.</p></div>
  </motion.aside>
 </>}</AnimatePresence>;
}

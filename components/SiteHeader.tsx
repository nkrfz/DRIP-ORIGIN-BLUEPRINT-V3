'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Menu,ShoppingBag,X,ArrowUpRight} from 'lucide-react';
import {useCart} from '@/lib/cart';
const nav=[['Коллекция','/catalog'],['Происхождение','/origins'],['О нас','/about'],['Для бизнеса','/b2b']];
export default function SiteHeader(){
 const [mounted,setMounted]=useState(false);const [menu,setMenu]=useState(false);
 const qty=useCart(s=>s.lines.reduce((a,x)=>a+x.quantity,0));const open=useCart(s=>s.setOpen);
 useEffect(()=>setMounted(true),[]);
 return <>
  <header className="site-header">
   <Link className="wordmark" href="/" onClick={()=>setMenu(false)} aria-label="DRIP ORIGIN – главная"><span className="wordmark-icon">✳</span> DRIP<span className="wordmark-separator">/</span>ORIGIN <small>®</small></Link>
   <nav className="desktop-nav" aria-label="Главное меню">{nav.map(([name,href])=><Link href={href} key={href}>{name}</Link>)}</nav>
   <div className="header-actions"><button className="header-cart" onClick={()=>open(true)} aria-label="Открыть корзину">КОРЗИНА <span className="cart-amount">{mounted?String(qty).padStart(2,'0'):'00'}</span><ShoppingBag size={17}/></button><button className="mobile-menu-toggle" aria-label={menu?'Закрыть меню':'Открыть меню'} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
  </header>
  {menu&&<nav className="mobile-nav">{nav.map(([name,href])=><Link onClick={()=>setMenu(false)} href={href} key={href}>{name}<ArrowUpRight/></Link>)}<Link onClick={()=>setMenu(false)} href="/journal">Журнал<ArrowUpRight/></Link></nav>}
 </>;
}

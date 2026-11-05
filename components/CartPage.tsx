'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Minus,Plus} from 'lucide-react';
import {money,products} from '@/lib/data';
import {useCart} from '@/lib/cart';
export default function CartPage(){
 const lines=useCart(s=>s.lines),setQty=useCart(s=>s.setQuantity),remove=useCart(s=>s.remove);const [mounted,setMounted]=useState(false);
 useEffect(()=>setMounted(true),[]);
 const total=lines.reduce((n,l)=>n+(products.find(p=>p.id===l.id)?.price||0)*l.quantity,0);
 return <main className="plain-page"><div className="section-eyebrow">ВАША КОЛЛЕКЦИЯ / КОРЗИНА</div><h1 className="page-title">Вы выбрали<span className="accent">.</span></h1>
 {!mounted?<p className="lead">Загружаем корзину...</p>:lines.length===0?<div className="empty-cart"><p>Ваша корзина пока пуста.</p><Link className="main-cta" href="/catalog">Открыть коллекцию <ArrowUpRight/></Link></div>:<>
  <div className="cart-page-lines">{lines.map((line,i)=>{const p=products.find(x=>x.id===line.id);if(!p)return null;return <div className="cart-page-row" key={line.id}><span className="row-number">{String(i+1).padStart(2,'0')}</span><div><Link href={'/product/'+p.slug}>{p.name}</Link><small>{p.type} / {p.origin}</small></div><div className="qty-control"><button onClick={()=>setQty(p.id,line.quantity-1)} aria-label="Уменьшить"><Minus size={14}/></button><span>{line.quantity}</span><button onClick={()=>setQty(p.id,line.quantity+1)} aria-label="Увеличить"><Plus size={14}/></button></div><strong>{money(p.price*line.quantity)}</strong><button className="remove-link" onClick={()=>remove(p.id)}>Убрать</button></div>;})}</div>
  <div className="cart-checkout"><span>ИТОГО <b>{money(total)}</b></span><Link href="/checkout" className="main-cta">Оформить заказ <ArrowUpRight size={18}/></Link></div></>}
 </main>;
}

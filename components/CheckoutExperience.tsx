'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {money,products} from '@/lib/data';
import {useCart} from '@/lib/cart';
export default function CheckoutExperience(){
 const lines=useCart(s=>s.lines),clear=useCart(s=>s.clear);
 const [mounted,setMounted]=useState(false),[success,setSuccess]=useState(false),[name,setName]=useState(''),[company,setCompany]=useState(''),[email,setEmail]=useState('');
 useEffect(()=>setMounted(true),[]);
 const total=lines.reduce((n,l)=>n+(products.find(p=>p.id===l.id)?.price||0)*l.quantity,0);
 return <main className="plain-page checkout-page"><div className="section-eyebrow">ЗАВЕРШЕНИЕ / ДЕМО</div><h1 className="page-title">Почти готово<span className="accent">.</span></h1>
 {success?<div className="checkout-done"><p>Демонстрационный заказ оформлен.</p><span>Данные не отправлены на сервер и оплата не списана.</span><Link className="main-cta" href="/catalog">Вернуться к коллекции <ArrowUpRight/></Link></div>:!mounted?<p>Загружаем заказ...</p>:lines.length===0?<div className="empty-cart"><p>В корзине нет товаров.</p><Link href="/catalog" className="main-cta">Открыть коллекцию <ArrowUpRight/></Link></div>:<form className="checkout-form" onSubmit={e=>{e.preventDefault();clear();setSuccess(true);}}>
 <label>ВАШЕ ИМЯ<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Как к Вам обращаться"/></label>
 <label>КОМПАНИЯ / ОТЕЛЬ<input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Название компании"/></label>
 <label>EMAIL<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label>
 <div className="checkout-total">ИТОГО <strong>{money(total)}</strong></div><button className="main-cta" type="submit">Завершить демо-заказ <ArrowUpRight/></button><small>Это демонстрация интерфейса. Ничего не отправляется и не оплачивается.</small>
 </form>}
 </main>;
}

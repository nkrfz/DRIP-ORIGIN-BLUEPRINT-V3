'use client';
import Link from 'next/link';
import {useRef,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Minus,Plus} from 'lucide-react';
import type {Product} from '@/lib/types';
import {money} from '@/lib/data';
import {useCart} from '@/lib/cart';
import ParticleExperience from './ParticleExperience';
export default function ProductExperience({product:p}:{product:Product}){
 const [qty,setQty]=useState(1);const progress=useRef(p.type==='Дрип-пакеты'?1:p.type==='Аксессуары'?2:0);const add=useCart(s=>s.add);
 return <main className="inner-page product-page"><div className="inner-glow"/><div className="product-art"><ParticleExperience progressRef={progress} small/></div><div className="product-content"><Link href="/catalog" className="back-link"><ArrowLeft size={16}/> НАЗАД К КОЛЛЕКЦИИ</Link>
  <div className="section-eyebrow"><span className="eyebrow-dot"/> {p.origin.toUpperCase()} / {p.type.toUpperCase()}</div>
  <h1>{p.name.split(' / ')[0]}<em>{p.name.split(' / ')[1]||''}</em></h1>
  <p className="product-description">{p.description}</p>
  <div className="tasting-notes"><span>ПРОФИЛЬ ВКУСА</span><p>{p.notes.join(' · ')}</p></div>
  <div className="product-info-line"><span>КОЛИЧЕСТВО В УПАКОВКЕ</span><strong>{p.amount} {p.type==='Кофе в зернах'?'г':'шт.'}</strong></div>
  <div className="product-info-line"><span>СТРАНА</span><strong>{p.origin}</strong></div>
  <div className="buy-line"><div className="product-price">{money(p.price)}</div><div className="qty-control"><button onClick={()=>setQty(Math.max(1,qty-1))} aria-label="Уменьшить количество"><Minus size={14}/></button><span>{qty}</span><button onClick={()=>setQty(qty+1)} aria-label="Увеличить количество"><Plus size={14}/></button></div><button className="main-cta" onClick={()=>add(p.id,qty)}>Добавить в корзину <ArrowUpRight size={18}/></button></div>
  <div className="product-footnote">Демонстрационный магазин · покупки без оплаты</div>
 </div></main>;
}

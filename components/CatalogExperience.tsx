'use client';
import {useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Plus,SlidersHorizontal,Search} from 'lucide-react';
import {products,money} from '@/lib/data';
import {useCart} from '@/lib/cart';
import ParticleExperience from './ParticleExperience';
import type {Product} from '@/lib/types';
const types=['Все','Дрип-пакеты','Кофе в зернах','Наборы','Аксессуары'];
const countries=['Все страны','Колумбия','Эфиопия','Никарагуа','Гондурас','Индия'];
export default function CatalogExperience(){
 const [type,setType]=useState('Все');const [query,setQuery]=useState('');const [country,setCountry]=useState('Все страны');const [sort,setSort]=useState('popular');const [limit,setLimit]=useState(9);
 const [selected,setSelected]=useState<string>(products[0].id);const progress=useRef(0);const add=useCart(s=>s.add);
 const filtered=useMemo(()=>{
  const needle=query.trim().toLowerCase();
  const list=products.filter(p=>(type==='Все'||p.type===type)&&(country==='Все страны'||p.origin===country)&&(!needle||(p.name+' '+p.origin+' '+p.type+' '+p.notes.join(' ')).toLowerCase().includes(needle))); 
  return sort==='asc'?list.sort((a,b)=>a.price-b.price):sort==='desc'?list.sort((a,b)=>b.price-a.price):list;
 },[type,country,sort,query]);
 const choose=(p:Product)=>{setSelected(p.id);progress.current=p.type==='Дрип-пакеты'?1:p.type==='Аксессуары'?2:0;};
 return <main className="inner-page catalog-page"><div className="inner-glow"/><div className="catalog-art"><ParticleExperience progressRef={progress} small/></div>
  <div className="catalog-content">
   <div className="section-eyebrow"><span className="eyebrow-dot"/> HOSPITALITY COLLECTION <span className="filter-count">{filtered.length} ПОЗИЦИЙ</span></div>
   <div className="catalog-heading"><h1>Коллекция<span className="accent">.</span></h1><p>Пять происхождений. Свой характер у каждой чашки. Выберите ваш вкус.</p></div>
   <div className="catalog-filters" aria-label="Фильтры каталога"><div className="filter-items">{types.map(t=><button key={t} className={type===t?'filter-active':''} onClick={()=>{setType(t);setLimit(9);}}>{t}</button>)}</div><div className="filter-selects"><label className="catalog-search"><Search size={14}/><input value={query} onChange={e=>{setQuery(e.target.value);setLimit(9);}} placeholder="Поиск кофе" aria-label="Поиск кофе" /></label><label><SlidersHorizontal size={14}/><select aria-label="Страна происхождения" value={country} onChange={e=>{setCountry(e.target.value);setLimit(9);}}>{countries.map(c=><option key={c}>{c}</option>)}</select></label><label><select aria-label="Сортировать" value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">По умолчанию</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option></select></label></div></div>
   <div className="catalog-list">{filtered.slice(0,limit).map((p,i)=><div onMouseEnter={()=>choose(p)} onFocus={()=>choose(p)} className={'catalog-row'+(selected===p.id?' catalog-row-active':'')} key={p.id}><span className="row-number">{String(i+1).padStart(2,'0')}</span><div className="row-main"><Link href={'/product/'+p.slug} onClick={()=>choose(p)}>{p.name}<ArrowUpRight size={20}/></Link><span>{p.type} · {p.origin} · {p.notes.join(' / ')}</span></div><strong>{money(p.price)}</strong><button className="row-add" aria-label={'Добавить '+p.name+' в корзину'} onClick={()=>add(p.id)}><Plus size={21}/></button></div>)}</div>
   {filtered.length===0&&<p className="empty-filter">По таким фильтрам ничего нет. Попробуйте другую страну.</p>}
   {filtered.length>limit&&<button className="load-more" onClick={()=>setLimit(l=>l+12)}>ПОКАЗАТЬ ЕЩЁ <Plus size={16}/></button>}
   <p className="catalog-note">Все товары и цены демонстрационные. Заказ сохраняется только в этом браузере.</p>
  </div>
 </main>;
}

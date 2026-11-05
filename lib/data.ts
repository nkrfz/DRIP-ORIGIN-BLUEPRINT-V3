import productsJson from '@/data/products.json';
import journalJson from '@/data/journal.json';
import type { Product, JournalEntry } from './types';
export const products = productsJson as Product[];
export const journal = journalJson as JournalEntry[];
export const origins = [
 {slug:'colombia',name:'Колумбия',region:'Huila',text:'Мягкая сладость, карамель и красное яблоко.',number:'01'},
 {slug:'ethiopia',name:'Эфиопия',region:'Sidama',text:'Цветочный аромат, цитрус и лёгкость.',number:'02'},
 {slug:'nicaragua',name:'Никарагуа',region:'Jinotega',text:'Орех, сахар и спелые фрукты.',number:'03'},
 {slug:'honduras',name:'Гондурас',region:'Marcala',text:'Мёд, какао и долгое послевкусие.',number:'04'},
 {slug:'india',name:'Индия',region:'Malabar',text:'Плотное тело, специи и тёмный шоколад.',number:'05'}
];
export const money = (n:number) => new Intl.NumberFormat('ru-RU').format(n)+' ₽';
export const getProduct = (slug:string) => products.find(p => p.slug===slug);

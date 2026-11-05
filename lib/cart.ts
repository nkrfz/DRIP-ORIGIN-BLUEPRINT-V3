'use client';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {CartLine} from './types';
type CartState={lines:CartLine[];open:boolean;add:(id:string,amount?:number)=>void;remove:(id:string)=>void;setQuantity:(id:string,quantity:number)=>void;clear:()=>void;setOpen:(open:boolean)=>void};
export const useCart=create<CartState>()(persist((set)=>({
 lines:[],open:false,
 add:(id,amount=1)=>set(s=>({lines:s.lines.some(p=>p.id===id)?s.lines.map(p=>p.id===id?{...p,quantity:p.quantity+amount}:p):[...s.lines,{id,quantity:amount}],open:true})),
 remove:(id)=>set(s=>({lines:s.lines.filter(p=>p.id!==id)})),
 setQuantity:(id,quantity)=>set(s=>({lines:quantity<=0?s.lines.filter(p=>p.id!==id):s.lines.map(p=>p.id===id?{...p,quantity}:p)})),
 clear:()=>set({lines:[]}),setOpen:(open)=>set({open})
}),{name:'drip-origin-cart-v2',partialize:(s)=>({lines:s.lines})}));

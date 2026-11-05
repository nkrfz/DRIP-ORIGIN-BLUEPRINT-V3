import {notFound} from 'next/navigation';import Editorial from '@/components/Editorial';import {journal} from '@/lib/data';
export function generateStaticParams(){return journal.map(a=>({slug:a.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:journal.find(a=>a.slug===slug)?.title||'Статья'};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const a=journal.find(x=>x.slug===slug);if(!a)notFound();return <Editorial kicker={a.category.toUpperCase()} title={a.title} lead={a.lead} shape={2}><article className="story-article">{a.body.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</article></Editorial>;}

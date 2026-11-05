import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import InteriorStage from './InteriorStage';
import SiteFooter from './SiteFooter';
export default function Editorial({kicker,title,lead,shape=3,children}:{kicker:string;title:string;lead:string;shape?:number;children:React.ReactNode}){
 return <main className="editorial-page"><div className="editorial-art"><InteriorStage shape={shape}/></div><div className="editorial-hero"><div className="section-eyebrow"><span className="eyebrow-dot"/>{kicker}</div><h1>{title}<span className="accent">.</span></h1><p>{lead}</p><div className="editorial-scroll">ПРОДОЛЖАЙТЕ ЧИТАТЬ ↓</div></div><div className="editorial-body">{children}</div><div className="end-cta"><span>ВАШ СЛЕДУЮЩИЙ ШАГ</span><Link href="/catalog">Открыть коллекцию <ArrowUpRight size={30}/></Link></div><SiteFooter/></main>;
}
export function EditorialRows({rows}:{rows:{index:string;title:string;body:string}[]}){return <div className="editorial-rows">{rows.map(r=><div className="editorial-row" key={r.index}><span>{r.index}</span><h2>{r.title}</h2><p>{r.body}</p></div>)}</div>;}

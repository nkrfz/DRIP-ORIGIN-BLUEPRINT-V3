import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {products,getProduct} from '@/lib/data';
import ProductExperience from '@/components/ProductExperience';
export function generateStaticParams(){return products.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=getProduct(slug);return {title:p?p.name:'Товар не найден',description:p?.description};}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=getProduct(slug);if(!p)notFound();
 const jsonLd={"@context":"https://schema.org","@type":"Product",name:p.name,description:p.description,sku:p.id,offers:{"@type":"Offer",price:p.price,priceCurrency:'RUB',availability:'https://schema.org/InStock'}};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/><ProductExperience product={p}/></>;
}

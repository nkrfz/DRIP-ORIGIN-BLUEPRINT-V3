import type {Metadata} from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import CartDrawer from '@/components/CartDrawer';
export const metadata:Metadata={title:{default:'DRIP / ORIGIN – кофе в дрип-пакетах для HoReCa',template:'%s – DRIP / ORIGIN'},description:'Спешелти кофе в дрип-пакетах для отелей, гостиниц и ресторанов. Пять происхождений, один идеальный ритуал.',robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body><SiteHeader/>{children}<CartDrawer/></body></html>;}

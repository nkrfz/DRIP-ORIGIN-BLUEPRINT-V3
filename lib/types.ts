export type ProductType = "Дрип-пакеты" | "Кофе в зернах" | "Наборы" | "Аксессуары";
export type Product = {
 id: string; slug: string; name: string; origin: string; originSlug: string;
 type: ProductType; price: number; amount: number; description: string;
 notes: string[]; strength: number; featured?: boolean;
};
export type JournalEntry = {slug:string;title:string;lead:string;body:string[];category:string};
export type CartLine = {id:string;quantity:number};

import { ArrowUpRight, Box } from "lucide-react";
export function Header() {
  return <header className="header"><a href="/" className="wordmark" aria-label="Quietbox-ի գլխավոր էջ"><span className="logo"><Box size={20} strokeWidth={1.6}/></span>quietbox<span className="wordmark-dot">.</span></a><nav aria-label="Հիմնական ընտրացանկ"><a href="/privacy">Գաղտնիություն</a><a href="/source">Բաց կոդ <ArrowUpRight size={14}/></a></nav></header>;
}
export function Footer() {
  return <footer className="footer"><span>Միայն տեղեկություն փոխանցելու համար։</span></footer>;
}

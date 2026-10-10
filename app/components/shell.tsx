import { ArrowUpRight, Mail } from "lucide-react";
export function Header() {
  return <header className="header"><a href="/" className="wordmark" aria-label="ինֆո․ գլխավոր էջ"><span className="logo" aria-hidden="true"><Mail size={20} strokeWidth={1.6}/></span>ինֆո</a><nav aria-label="Հիմնական ընտրացանկ"><a href="/privacy">Գաղտնիություն</a><a href="/source">Բաց կոդ <ArrowUpRight size={14}/></a></nav></header>;
}
export function Footer() {
  return <footer className="footer"><span>Միայն տեղեկություն փոխանցելու համար։</span></footer>;
}

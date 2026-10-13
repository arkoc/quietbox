import { ArrowUpRight, Mail } from "lucide-react";
import { SOURCE_REPOSITORY_URL } from "../../lib/source-info";
export function Header() {
  return <header className="header"><a href="/" className="wordmark" aria-label="ինֆո․ գլխավոր էջ"><span className="logo" aria-hidden="true"><Mail size={20} strokeWidth={1.6}/></span>ինֆո</a><nav aria-label="Հիմնական ընտրացանկ"><a href="/privacy">Գաղտնիություն</a><a href={SOURCE_REPOSITORY_URL} rel="noreferrer">Բաց կոդ <ArrowUpRight size={14}/></a></nav></header>;
}

import { Header, Footer } from "./components/shell";
import MessageForm from "./components/message-form";
import { SOURCE_REPOSITORY_URL } from "../lib/source-info";
export default function Home() {
  return <div className="site"><Header/><main className="dropbox-page">
    <div className="dropbox-heading"><h1>Ուղարկել տեղեկություն</h1><p>Գրեք ձեր հաղորդագրությունը և ուղարկեք։</p></div>
    <MessageForm/>
    <p className="dropbox-privacy">Հաղորդագրության հետ ձեր IP հասցեն չի պահվում։ <a href="/privacy">Մանրամասներ</a></p>
    <p className="dropbox-source">Կոդը բաց է <a href={SOURCE_REPOSITORY_URL} target="_blank" rel="noopener noreferrer">GitHub-ում</a>։ Խնդրեք AI-ին ստուգել՝ ինչպես է պաշտպանվում ձեր անանունությունը։ <a href="/source#ai-review">Ստուգման պատրաստի հարցում</a></p>
  </main><Footer/></div>;
}

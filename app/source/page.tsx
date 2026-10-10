import { Header, Footer } from "../components/shell";
import SourceViewer from "./source-viewer";
import AiReview from "./ai-review";
export default function SourcePage() {
  return <div className="site"><Header/><main className="source-page"><div className="eyebrow">ԲԱՑ Է ՈՒՍՈՒՄՆԱՍԻՐԵԼՈՒ ՀԱՄԱՐ</div><h1>Տեսեք՝ ինչպես<br/><em>է աշխատում։</em></h1><p className="source-intro">Հաղորդագրության ձևը, ուղարկման մշակումը, տվյալների բազայի կառուցվածքն ու սպամի ստուգումը։ Ուսումնասիրեք հավելվածի կոդը կամ ներբեռնեք այն՝ ձեր սեփական տարբերակը գործարկելու համար։</p><AiReview/><SourceViewer/><div className="source-caveat"><strong>Ի՞նչ կարելի է ստուգել այստեղ։</strong><p>Այս ֆայլերը նկարագրում են հավելվածի տվյալ տարբերակի աշխատանքը։ Կարող եք դրանք համեմատել դիտարկչի ցանցային հարցումների հետ և ուսումնասիրել տվյալների բազայի կառուցվածքը։ Դրանք չեն ապացուցում, թե ինչ ծրագիր է աշխատում սերվերում կամ ինչ տվյալներ է գրանցում հոսթինգը։ Այս կոդը չի անցել անվտանգության անկախ ստուգում։</p></div></main><Footer/></div>;
}

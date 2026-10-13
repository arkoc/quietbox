import { ArrowLeft, Minus, Plus, Shield } from "lucide-react";
import { Header } from "../components/shell";
export default function PrivacyPage() {
  return <div className="site"><Header/><main className="privacy-page">
    <section className="privacy-section" id="privacy" aria-labelledby="privacy-title"><div className="privacy-heading"><span className="form-heading-icon" aria-hidden="true"><Shield size={22} strokeWidth={1.7}/></span><h1 id="privacy-title">Գաղտնիություն</h1></div><div className="privacy-answers">
      <details open>
        <summary><span>Ի՞նչ է ստանում հասցեատերը։</span><Plus size={17} className="plus"/><Minus size={17} className="minus"/></summary>
        <p>Ձեր գրածը և ստացման օրը։ Հաղորդագրության հետ չեն պահվում ձեր IP հասցեն, հաշվի տվյալները կամ ուղարկելու ճշգրիտ ժամը։</p>
        <p>Արկղում պահվում են նաև հաղորդագրության պատահական համարը և կարդացված լինելու նշումը։</p>
      </details>
      <details>
        <summary><span>Ո՞վ կարող է տեսնել իմ IP հասցեն։</span><Plus size={17} className="plus"/><Minus size={17} className="minus"/></summary>
        <p>Հոսթինգը տեսնում է ձեր IP հասցեն և կարող է մշակել կապի կամ հաշվի տվյալները։ Հավելվածը դրանք չի պահում հաղորդագրության հետ։</p>
        <p>Լիակատար անհետագծելիություն չենք երաշխավորում։ Մի՛ գրեք ձեր անունը, հեռախոսահամարը կամ ձեզ բացահայտող մանրամասներ։</p>
      </details>
      <details>
        <summary><span>Ե՞րբ են ջնջվում հաղորդագրությունները։</span><Plus size={17} className="plus"/><Minus size={17} className="minus"/></summary>
        <p>30 և ավելի օր առաջ ստացված հաղորդագրությունները ջնջվում են արկղը բացելու կամ նոր հաղորդագրություն ընդունելու հաջորդ պահին։ Եթե կայքը չի օգտագործվում, ջնջումը հետաձգվում է։</p>
        <p>Սա չի ջնջում հասցեատիրոջ՝ առանձին պահած պատճենները։ Հոսթինգի պահուստային պատճենները հավելվածը չի կառավարում։</p>
      </details>
    </div></section><a className="text-link" href="/"><ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true"/>Վերադառնալ հաղորդագրության ձևին</a>
  </main></div>;
}

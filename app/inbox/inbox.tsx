"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Inbox as InboxIcon, RefreshCw, Trash2, Check } from "lucide-react";
const formatDay = (day: string) => new Intl.DateTimeFormat("hy-AM", {dateStyle: "medium", timeZone: "UTC"}).format(new Date(day + "T00:00:00Z"));
type Message = {id: string; body: string; day: string; is_read: number};
export default function Inbox() {
  const [items, setItems] = useState<Message[]>([]), [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(""), [filter, setFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(false), [busy, setBusy] = useState(false);
  async function load() {
    setLoading(true); setError("");
    try { const r=await fetch("/api/inbox", {cache:"no-store"}); const d=await r.json() as {error?:string;messages:Message[]}; if(!r.ok)throw new Error(d.error); setItems(d.messages); }
    catch(e){setError(e instanceof Error && !(e instanceof TypeError) && !(e instanceof SyntaxError)?e.message:"Չհաջողվեց բեռնել հաղորդագրությունները։");} finally{setLoading(false);}
  }
  useEffect(() => { void load(); }, []);
  async function act(id: string, action: "read" | "delete") {
    setBusy(true); setError("");
    try {
      const r=await fetch("/api/inbox",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action})}); const d=await r.json() as {error?:string}; if(!r.ok)throw new Error(d.error);
      setItems(items => action === "delete" ? items.filter(i => i.id !== id) : items.map(i => i.id === id ? {...i,is_read:1} : i));
      if(action === "delete"){setSelected(null);setConfirmDelete(false);}
    } catch(e){setError(e instanceof Error && !(e instanceof TypeError) && !(e instanceof SyntaxError)?e.message:"Չհաջողվեց պահել փոփոխությունը։");} finally{setBusy(false);}
  }
  const item = items.find(i => i.id === selected), visible = items.filter(i => filter !== "unread" || !i.is_read);
  return <main className="inbox-page"><div className="inbox-title"><div><h1>Մուտքային արկղ</h1></div><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/> Թարմացնել</button></div>{error && <p className="error" role="alert">{error}</p>}
    <div className="inbox-grid"><aside className="inbox-list"><div className="filters"><button className={filter === "all"?"active":""} onClick={()=>setFilter("all")}>Բոլորը <span>{items.length}</span></button><button className={filter === "unread"?"active":""} onClick={()=>setFilter("unread")}>Չկարդացված <span>{items.filter(i=>!i.is_read).length}</span></button></div>
      {loading ? <p className="empty-small" role="status">Հաղորդագրությունները բեռնվում են…</p> : visible.length ? visible.map(i=><button key={i.id} className={`message-row ${selected===i.id?"selected":""}`} onClick={()=>{setSelected(i.id);setConfirmDelete(false);}}><span className="row-date">{formatDay(i.day)}<span className={i.is_read?"read-dot":"unread-dot"}/></span><span className="snippet">{i.body}</span></button>) : <p className="empty-small">{filter === "unread"?"Բոլոր հաղորդագրությունները կարդացված են։":"Առայժմ հաղորդագրություններ չկան։"}</p>}
    </aside><section className="message-reader">{item ? <><div className="reader-top"><button className="icon-button" onClick={()=>setSelected(null)} aria-label="Փակել հաղորդագրությունը"><ArrowLeft size={18}/></button><span>{formatDay(item.day)} · ըստ UTC-ի</span><div className="reader-actions">{!item.is_read && <button disabled={busy} onClick={()=>act(item.id,"read")}><Check size={15}/> Նշել որպես կարդացված</button>}<button disabled={busy} onClick={()=>setConfirmDelete(true)} aria-label="Ջնջել հաղորդագրությունը"><Trash2 size={16}/></button></div></div>{confirmDelete && <div className="delete-confirm"><span>Անվերադարձ ջնջե՞լ այս հաղորդագրությունը։</span><button disabled={busy} onClick={()=>act(item.id,"delete")}>Ջնջել</button><button onClick={()=>setConfirmDelete(false)}>Չեղարկել</button></div>}<p className="message-body">{item.body}</p></> : <div className="reader-empty"><InboxIcon size={36} strokeWidth={1.3}/><h2>Ձեր հաղորդագրությունները</h2><p>{items.length?"Ընտրեք հաղորդագրությունը՝ այստեղ կարդալու համար։":"Նոր հաղորդագրությունները կհայտնվեն այստեղ։"}</p></div>}</section></div><p className="retention-note">30 և ավելի օր առաջ ստացված հաղորդագրությունները ջնջվում են, երբ բացվում է այս արկղը կամ ընդունվում է նոր հաղորդագրություն։ Ցուցադրվում է առավելագույնը 500 հաղորդագրություն։</p>
  </main>;
}

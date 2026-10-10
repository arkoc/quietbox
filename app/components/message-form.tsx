"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, RotateCcw, ShieldCheck } from "lucide-react";
function SpamCheck({ version, onState }: {version: number; onState: (state: string, payload?: string) => void}) {
  const host = useRef<HTMLDivElement>(null), callback = useRef(onState);
  callback.current = onState;
  useEffect(() => {
    let disposed = false;
    let widget: HTMLElement | null = null;
    callback.current("loading");
    import("altcha").then(() => import("altcha/i18n/hy")).then(() => {
      if (disposed || !host.current) return;
      widget = document.createElement("altcha-widget");
      widget.setAttribute("language", "hy"); widget.setAttribute("challenge", "/api/challenge"); widget.setAttribute("auto", "off"); widget.setAttribute("workers", "2");
      // The private Sites gateway needs its existing access cookie. The Worker
      // strips cookies and visitor identity before the message handler runs.
      widget.setAttribute("configuration", JSON.stringify({ humanInteractionSignature: false, serverVerificationTimeZone: false, serverVerificationFields: false, credentials: "same-origin", hideFooter: true, hideLogo: true }));
      widget.addEventListener("statechange", ((event: CustomEvent) => callback.current(event.detail.state, event.detail.payload)) as EventListener);
      widget.addEventListener("verified", ((event: CustomEvent) => callback.current("verified", event.detail.payload)) as EventListener);
      host.current.replaceChildren(widget); callback.current("unverified");
    }).catch(() => callback.current("error"));
    return () => { disposed = true; widget?.remove(); };
  }, [version]);
  return <div ref={host} className="spam-widget"/>;
}
export default function MessageForm() {
  const [message, setMessage] = useState(""), [proof, setProof] = useState(""), [checkState, setCheckState] = useState("loading"), [version, setVersion] = useState(0);
  const [sending, setSending] = useState(false), [sent, setSent] = useState(false), [error, setError] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (sent) resultHeading.current?.focus(); }, [sent]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (sending) return;
    const form = event.currentTarget, token = proof || String(new FormData(form).get("altcha") || "");
    if (!message.trim()) { setError("Նախ գրեք ձեր հաղորդագրությունը։"); return; }
    if (checkState !== "verified" || !token) { setError("Ուղարկելուց առաջ անցեք սպամի ստուգումը։"); return; }
    setSending(true); setError("");
    try {
      const response = await fetch("/api/messages", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, proof: token, website: String(new FormData(form).get("website") || "") }) });
      if (response.status === 401) throw new Error("Կայքը դեռ մասնավոր է։ Թարմացրեք էջը և մուտք գործեք թույլատրված հաշվով։");
      const data = await response.json() as {ok?: boolean; error?: string};
      if (!response.ok || !data.ok) throw new Error(data.error || "Չհաջողվեց պահել հաղորդագրությունը։ Փորձեք կրկին։");
      setMessage(""); setProof(""); setSent(true);
    } catch (e) {
      setError(e instanceof Error && !(e instanceof TypeError) && !(e instanceof SyntaxError) ? e.message : "Սխալ է տեղի ունեցել։ Ձեր գրածը պահպանված է այս էջում․ փորձեք կրկին։");
      setProof(""); setCheckState("unverified"); setVersion(v => v + 1);
    } finally { setSending(false); }
  }
  if (sent) return <div className="form-card success-card"><div className="success-icon"><Check size={33}/></div><h2 ref={resultHeading} tabIndex={-1}>Հաղորդագրությունն ուղարկված է։</h2><p>Շնորհակալություն։ Պատասխան չի ուղարկվում, և զրույց չի բացվում։ Կարող եք փակել էջը։</p></div>;
  return <form className="form-card" onSubmit={submit} autoComplete="off">
    <label htmlFor="message" className="message-label">Ձեր հաղորդագրությունը</label><p className="field-description" id="message-help">Մի նշեք ձեր անունը կամ ձեզ նույնականացնող այլ տվյալներ։</p>
    <div className="textarea-wrap"><textarea id="message" name="message" aria-describedby="message-help message-count" placeholder="Գրեք այստեղ…" maxLength={8000} value={message} onChange={e => setMessage(e.target.value)} required disabled={sending} spellCheck={false}/><span id="message-count" className="counter">{message.length.toLocaleString("hy-AM")} / 8 000</span></div>
    <div className="honeypot" aria-hidden="true"><label>Այս դաշտը թողեք դատարկ<input name="website" type="text" tabIndex={-1} autoComplete="off"/></label></div>
    <div className="verification"><div className="verification-heading"><ShieldCheck size={16}/><span>Կարճ ստուգում՝ սպամը կանխելու համար</span></div><SpamCheck version={version} onState={(state, payload) => {setCheckState(state); setProof(state === "verified" ? payload || "" : "");}}/>
      {checkState === "loading" && <p className="check-hint" role="status">Սպամից պաշտպանությունը բեռնվում է…</p>}{["error", "expired"].includes(checkState) && <button type="button" className="retry" onClick={() => setVersion(v => v+1)}><RotateCcw size={13}/> Կրկնել ստուգումը</button>}<span className="check-hint">Աշխատում է այստեղ՝ առանց արտաքին CAPTCHA ծառայության։</span>
    </div>{error && <p className="error" role="alert">{error}</p>}
    <button className="primary" type="submit" disabled={sending || !message.trim() || checkState !== "verified"}>{sending ? "Ուղարկվում է…" : "Ուղարկել"}<ArrowRight size={18}/></button><p className="submit-note">Սա միակողմանի ուղարկում է․ պատասխան կամ զրույց չի լինի։</p>
    <noscript><p className="error">Սպամի ստուգումն անցնելու և հաղորդագրություն ուղարկելու համար անհրաժեշտ է միացնել JavaScript-ը։</p></noscript>
  </form>;
}

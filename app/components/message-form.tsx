"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, RotateCcw, Send, Shield, SquarePen } from "lucide-react";
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
  if (sent) return <div className="form-card success-card"><div className="success-icon" aria-hidden="true"><Check size={28}/></div><h1 ref={resultHeading} tabIndex={-1}>Ուղարկված է։</h1></div>;
  return <form className="form-card" onSubmit={submit} autoComplete="off">
    <div className="form-heading"><span className="form-heading-icon" aria-hidden="true"><SquarePen size={21} strokeWidth={1.7}/></span><h1 className="message-label"><label htmlFor="message">Անանուն հաղորդագրություն</label></h1></div>
    <div className="anonymity-note" id="anonymity-note"><Shield size={17} strokeWidth={1.7} aria-hidden="true"/><p><strong>Այս հավելվածը չի պահում ձեր IP հասցեն կամ հաշվի տվյալները։</strong><span>Հոսթինգը տեսնում է ձեր IP հասցեն։ Մի՛ ներառեք ձեզ բացահայտող տվյալներ։ <a href="/privacy">Մանրամասներ</a></span></p></div>
    <div className="textarea-wrap"><textarea id="message" name="message" aria-describedby="anonymity-note message-count" placeholder="Գրեք այստեղ…" maxLength={8000} value={message} onChange={e => setMessage(e.target.value)} required disabled={sending} spellCheck={false}/><span id="message-count" className="counter">{message.length.toLocaleString("hy-AM")} / 8 000</span></div>
    <div className="honeypot" aria-hidden="true"><label>Այս դաշտը թողեք դատարկ<input name="website" type="text" tabIndex={-1} autoComplete="off"/></label></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-actions"><div className="verification"><SpamCheck version={version} onState={(state, payload) => {setCheckState(state); setProof(state === "verified" ? payload || "" : "");}}/>
      {checkState === "loading" && <p className="check-hint" role="status">Ստուգումը բեռնվում է…</p>}{["error", "expired"].includes(checkState) && <button type="button" className="retry" onClick={() => setVersion(v => v+1)}><RotateCcw size={13}/> Կրկնել ստուգումը</button>}
    </div>
    <button className="primary" type="submit" disabled={sending || !message.trim() || checkState !== "verified"}>{sending ? "Ուղարկվում է…" : "Ուղարկել"}<Send size={17} strokeWidth={1.7} aria-hidden="true"/></button></div>
    <noscript><p className="error">Սպամի ստուգումն անցնելու և հաղորդագրություն ուղարկելու համար անհրաժեշտ է միացնել JavaScript-ը։</p></noscript>
  </form>;
}

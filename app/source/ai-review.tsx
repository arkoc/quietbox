"use client";
import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { AI_REVIEW_PROMPT, SOURCE_REPOSITORY_URL } from "../../lib/source-info";

export default function AiReview() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(AI_REVIEW_PROMPT);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }
  return <section className="ai-review" id="ai-review" aria-labelledby="ai-review-heading">
    <h2 id="ai-review-heading">Ստուգել AI-ով</h2>
    <p>Պատճենեք հարցումը և ուղարկեք ձեր ընտրած AI-ին։</p>
    <a className="text-link" href={SOURCE_REPOSITORY_URL} target="_blank" rel="noopener noreferrer">Դիտել կոդը GitHub-ում <ArrowUpRight size={15}/></a>
    <details className="review-prompt"><summary>Դիտել ստուգման հարցումը</summary><pre>{AI_REVIEW_PROMPT}</pre></details>
    <div className="review-copy"><button className="secondary" type="button" onClick={copyPrompt}>{status === "copied" ? <Check size={16}/> : <Copy size={16}/>} {status === "copied" ? "Հարցումը պատճենված է" : "Պատճենել հարցումը"}</button><span role="status">{status === "copied" ? "Տեղադրեք այն ձեր ընտրած AI-ի զրույցում։" : status === "failed" ? "Չհաջողվեց պատճենել։ Բացեք հարցումը և պատճենեք տեքստը։" : ""}</span></div>
    <p className="review-limit">AI-ի պատասխանը անվտանգության անկախ աուդիտ չէ։ Կոդի ուսումնասիրությունը չի ապացուցում, որ նույն կոդն է աշխատում սերվերում կամ որ հոսթինգը տվյալներ չի գրանցում։</p>
  </section>;
}

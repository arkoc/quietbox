"use client";
import { useEffect, useState } from "react";
import { Download, FileCode2 } from "lucide-react";
type Source = {version: string; files: {path: string; sha256: string; content: string}[]};
export default function SourceViewer() {
  const [source,setSource]=useState<Source|null>(null),[path,setPath]=useState("lib/submissions.ts"),[error,setError]=useState(false);
  useEffect(()=>{fetch("/source.json",{credentials:"same-origin",cache:"no-store"}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Source>;}).then(setSource).catch(()=>setError(true));},[]);
  const file=source?.files.find(f=>f.path===path) || source?.files[0];
  return <><div className="source-toolbar"><span>MIT արտոնագիր · {source?`Տարբերակ ${source.version}`:"Սկզբնական կոդ"}</span><a className="secondary" href="/quietbox-source.tar.gz" download><Download size={16}/> Ներբեռնել կոդը</a></div>{error?<p className="error" role="alert">Չհաջողվեց բեռնել կոդը։ Փորձեք ներբեռնել այն կամ թարմացնել էջը։</p>:source?<div className="source-browser"><label className="source-select"><FileCode2 size={17}/><select aria-label="Կոդի ֆայլ" value={file?.path} onChange={e=>setPath(e.target.value)}>{source.files.map(f=><option key={f.path} value={f.path}>{f.path}</option>)}</select></label><pre tabIndex={0}><code>{file?.content}</code></pre><div className="checksum">SHA-256 <span>{file?.sha256}</span></div></div>:<p className="empty-small">Կոդը բեռնվում է…</p>}</>;
}

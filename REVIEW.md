# Ստուգեք «ինֆո»-ի կոդը / Review info

Հանրային կոդը՝ [github.com/arkoc/quietbox](https://github.com/arkoc/quietbox)։

Կարող եք ստորև բերված հարցումը փոխանցել ձեր ընտրած AI-ին։ AI-ի պատասխանը կարող է սխալ լինել և անվտանգության անկախ աուդիտ չէ։ Կոդի ուսումնասիրությունը չի հաստատում գործող սերվերի կարգավորումները կամ հոսթինգի գրանցումները։

## Պատրաստի հարցում

Ուսումնասիրիր այս կայքի բաց կոդը՝ https://github.com/arkoc/quietbox։

Մի հիմնվիր միայն README-ի կամ կայքի խոստումների վրա։ Կարդա հաղորդագրություն ուղարկելու, սերվերում մշակելու, պահելու և ստացողի մուտքը պաշտպանելու կոդը, ինչպես նաև կախվածություններն ու թեստերը։

Պարզ հայերենով բացատրիր՝
1. Ի՞նչ տվյալներ են ուղարկվում, պահվում կամ գրանցվում։ Կա՞ն IP հասցեներ, հաշվի տվյալներ, cookie-ներ, վերլուծական գործիքներ կամ երրորդ կողմերին հարցումներ։
2. Կարո՞ղ է հաղորդագրության ստացողը պարզել ուղարկողի ինքնությունը։ Ի՞նչ կարող են տեսնել հոսթինգի կամ ցանցի ծառայություններ մատուցողները։
3. Ինչպե՞ս է աշխատում սպամից պաշտպանությունը, և ի՞նչ սահմանափակումներ ունի։
4. Ի՞նչ հնարավոր խնդիրներ կամ թույլ կողմեր կան։ Հղումներ տուր համապատասխան ֆայլերին և նշիր ստուգած commit-ը։
5. Ի՞նչ կարող ես հաստատել կոդից, և ի՞նչը պահանջում է գործող կայքի, սերվերի կարգավորումների ու հոսթինգի գրանցումների առանձին ստուգում։

Մի խոստացիր լիակատար անանունություն։ Տարբերակիր փաստերը, ենթադրություններն ու չստուգվածը։ Հաշվի առ, որ հաղորդագրության բովանդակությունն ինքնին կարող է բացահայտել հեղինակին։ Եթե չես կարող բացել պահոցը կամ կարդալ ֆայլերը, հստակ ասա դա և խնդրիր ներբեռնված կոդը՝ առանց ստուգման արդյունք հորինելու։

## Review scope (English)

Review the code, not just this README or the website's claims. Identify the commit inspected. Distinguish confirmed code behavior, assumptions about the hosting gateway, and unverified live configuration. Report findings with file and line references. Do not interpret passing tests as a security audit.

Start with:

- `app/components/message-form.tsx`: submission body, browser storage, ALTCHA configuration and same-origin cookies.
- `build/sites-worker.ts` and `lib/privacy.ts`: request metadata removed before application handling, paths allowed to retain recipient identity, CSP and caching.
- `lib/submissions.ts` and `app/api/messages/route.ts`: signed proof validation, expiry, replay rejection, input bounds and shared quotas.
- `db/schema.ts` and `drizzle/`: stored columns and retention behavior.
- `lib/recipient.ts`, `app/api/inbox/route.ts` and `app/chatgpt-auth.ts`: authenticated recipient access and dependence on the trusted Sites gateway.
- `vite.config.ts`, `build/`, `package-lock.json` and `tests/privacy.test.ts`: build settings, dependencies and tested boundaries.

Check at least these limits:

- The browser's connection reaches a hosting/network provider that may see its IP and existing session data. Application header removal occurs after that boundary.
- The operator can change deployed code or infrastructure. A public repository, downloadable source, hashes and an AI review do not attest what is running or prove the absence of host logs/backups.
- The hosted submission page is public; the inbox still requires the recipient's sign-in. Audience settings and gateway behavior must be verified on the live deployment. Anonymous visitor access cannot be established from this repository alone.
- The inbox depends on identity headers injected by a trusted gateway. A generic Worker route accepting spoofed public headers would not be safe. Local preview uses mock authentication.
- Proof-of-work discourages spam but does not prove a human sender. Shared quotas can be exhausted by others.
- Message content can identify its author; the recipient can retain or copy text independently of application retention.

Use `npm test` and `npx tsc --noEmit` for the supplied checks. Review live browser requests and hosting settings separately, with authorization; do not submit tips or probe production just because this document mentions a check. If repository access is unavailable, say so and request an uploaded source archive rather than claiming to have inspected it.

## Source publication

The GitHub repository contains an allowlisted snapshot of the application source, lockfile, migrations, tests and MIT license. It has its own public history; internal deployment history, local files, secrets, inbox records and generated build output are excluded. `.env.example` contains placeholders only; `.openai/hosting.json` contains the public deployment identifier, not a credential.

The Site's `/source` page also offers a source download and SHA-256 file hashes. These enable file comparisons, not independent deployment attestation. The repository and downloadable source must be updated together when application code changes.

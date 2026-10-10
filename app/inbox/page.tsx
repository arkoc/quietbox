import { getChatGPTUser, chatGPTSignInPath } from "../chatgpt-auth";
import { isRecipient } from "../../lib/recipient";
import { Header } from "../components/shell";
import Inbox from "./inbox";
export const dynamic = "force-dynamic";
export default async function InboxPage() {
  const user = await getChatGPTUser(), allowed = await isRecipient();
  return <div className="site"><Header/>{allowed ? <Inbox/> : <main className="access-card"><h1>Մուտքային արկղ</h1><p>{user ? "Այս հաշիվը մուտք չունի հաղորդագրությունների արկղ։" : "Հաղորդագրությունները կարդալու համար մուտք գործեք հասցեատիրոջ ChatGPT հաշվով։"}</p>{!user && <a className="primary" href={chatGPTSignInPath("/inbox")} target="_top">Մուտք գործել արկղ</a>}<a className="text-link" href="/">Վերադառնալ հաղորդագրության ձևին</a></main>}</div>;
}

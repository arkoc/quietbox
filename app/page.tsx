import { Header } from "./components/shell";
import MessageForm from "./components/message-form";
export default function Home() {
  return <div className="site"><Header/><main className="dropbox-page"><MessageForm/></main></div>;
}

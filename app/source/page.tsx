import { Header } from "../components/shell";
import SourceViewer from "./source-viewer";
import AiReview from "./ai-review";
export default function SourcePage() {
  return <div className="site"><Header/><main className="source-page"><h1>Բաց կոդ</h1><AiReview/><SourceViewer/></main></div>;
}
